'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chat, ChatListParams, SocketChatListData } from '@/lib/types/chat';
import { chatApi } from '@/lib/api/chat';
import SocketService from '@/lib/utils/socket';
import { debugSocketAuth } from '@/lib/utils/debug-socket';

interface UseChatListReturn {
  chats: Chat[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  } | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  isConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export function useChatList(params: ChatListParams): UseChatListReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    limit: number;
    offset: number;
    total: number;
  } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketService = SocketService.getInstance();

  // Connect to Socket.IO
  const connectSocket = useCallback(() => {
    try {
      // Debug auth information
      debugSocketAuth();
      
      // Check if token exists before connecting
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Update token in case it changed
      socketService.updateToken(token);
      
      socketService.connect();
      setIsConnected(socketService.isConnected());
    } catch (err) {
      console.error('Failed to connect to socket:', err);
      setError('Failed to connect to real-time updates');
    }
  }, [socketService]);

  // Disconnect from Socket.IO
  const disconnectSocket = useCallback(() => {
    socketService.offChatList();
    // Don't disconnect socket - keep it persistent
    // socketService.disconnect();
    setIsConnected(false);
  }, [socketService]);

  // Fetch chat list via REST API
  const fetchChatList = useCallback(async (offset = 0, append = false) => {
    try {
      setError(null);
      if (!append) setIsLoading(true);

      const response = await chatApi.getChatList({
        ...params,
        offset,
      });

      if (response.success) {
        if (append) {
          setChats(prev => [...prev, ...response.data]);
        } else {
          setChats(response.data);
        }
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch chat list');
      }
    } catch (err) {
      console.error('Error fetching chat list:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  // Refetch chat list
  const refetch = useCallback(async () => {
    await fetchChatList(0, false);
  }, [fetchChatList]);

  // Load more chats (pagination)
  const loadMore = useCallback(async () => {
    if (!pagination || pagination.offset + pagination.limit >= pagination.total) {
      return;
    }
    
    const newOffset = pagination.offset + pagination.limit;
    await fetchChatList(newOffset, true);
  }, [fetchChatList, pagination]);

  // Set up Socket.IO listeners
  useEffect(() => {
    if (!isConnected) return;

    // Handle real-time chat list updates
    const handleChatListUpdate = (data: SocketChatListData) => {
      console.log('Real-time chat list update:', data);
      setChats(data.chats);
      // Handle optional pagination
      if (data.pagination) {
        setPagination(data.pagination);
      }
    };

    // Listen for chat list updates
    socketService.onChatList(handleChatListUpdate);

    // Request initial chat list via Socket.IO
    socketService.getChatList(params);

    return () => {
      socketService.offChatList();
      // Keep socket connected for persistence
    };
  }, [isConnected, params, socketService]);

  // Initial fetch via REST API
  useEffect(() => {
    fetchChatList();
  }, [fetchChatList]);

  // Auto-connect to Socket.IO on mount
  useEffect(() => {
    connectSocket();
    
    return () => {
      // Don't disconnect on unmount - keep socket persistent
      // disconnectSocket();
    };
  }, [connectSocket]);

  return {
    chats,
    isLoading,
    error,
    pagination,
    refetch,
    loadMore,
    isConnected,
    connectSocket,
    disconnectSocket,
  };
}
