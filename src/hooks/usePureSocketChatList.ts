'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chat, ChatListParams } from '@/lib/types/chat';
import SocketService from '@/lib/utils/socket';
import { debugSocketAuth } from '@/lib/utils/debug-socket';
import { logSocketEvent } from '@/lib/utils/debug-socket-response';

interface UsePureSocketChatListReturn {
  chats: Chat[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  } | null;
  requestRefresh: () => void;
  loadMore: () => void;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  forceDisconnect: () => void;
}

export function usePureSocketChatList(params: ChatListParams): UsePureSocketChatListReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    limit: number;
    offset: number;
    total: number;
  } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

  const socketService = SocketService.getInstance();

  // Request chat list from server
  const requestChatList = useCallback((offset = 0, append = false) => {
    if (!isConnected) {
      console.warn('Socket not connected, cannot request chat list');
      return;
    }

    console.log('🔄 Requesting chat list via Socket.IO:', {
      whatsappNumberId: params.whatsappNumberId,
      limit: params.limit || 50,
      offset
    });

    if (!append) {
      setIsLoading(true);
    }
    
    socketService.getChatList({
      ...params,
      offset
    });
  }, [isConnected, params, socketService]);

  // Request refresh
  const requestRefresh = useCallback(() => {
    setError(null);
    requestChatList(0, false);
  }, [requestChatList]);

  // Load more chats
  const loadMore = useCallback(() => {
    if (!pagination || pagination.offset + pagination.limit >= pagination.total) {
      return;
    }
    
    const newOffset = pagination.offset + pagination.limit;
    requestChatList(newOffset, true);
  }, [requestChatList, pagination]);

  // Setup Socket.IO connection and listeners
  useEffect(() => {
    // Debug auth
    debugSocketAuth();
    
    // Check token
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication token not found');
      setConnectionStatus('error');
      setIsLoading(false);
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    // Connect to Socket.IO
    try {
      socketService.connect();
      
      // Setup connection event listeners
      const socket = socketService.getSocket();
      if (socket) {
        socket.on('connect', () => {
          console.log('✅ Socket.IO connected');
          setIsConnected(true);
          setConnectionStatus('connected');
          setError(null);
          // Request initial chat list
          requestChatList();
        });

        socket.on('disconnect', (reason: string) => {
          console.log('❌ Socket.IO disconnected:', reason);
          setIsConnected(false);
          setConnectionStatus('disconnected');
          setError(`Connection lost: ${reason}`);
        });

        socket.on('connect_error', (err: Error) => {
          console.error('❌ Socket.IO connection error:', err);
          setIsConnected(false);
          setConnectionStatus('error');
          setError(`Connection failed: ${err.message}`);
          setIsLoading(false);
        });

        socket.on('auth_error', (err: unknown) => {
          console.error('❌ Socket.IO auth error:', err);
          setError('Authentication failed');
          setConnectionStatus('error');
          setIsLoading(false);
        });
      }

      // Handle real-time chat list updates
      const handleChatListUpdate = (data: unknown) => {
        logSocketEvent('chat:list', data);
        
        // Handle different response formats from backend
        let chats: Chat[] = [];
        let pagination: { limit: number; offset: number; total: number } | null = null;
        
        // Type guard and data extraction
        const dataObj = data as Record<string, unknown>;
        
        if (dataObj && typeof dataObj === 'object') {
          if (Array.isArray(dataObj.chats)) {
            // Format: { chats: [], pagination: {} }
            chats = dataObj.chats as Chat[];
            pagination = dataObj.pagination as { limit: number; offset: number; total: number } | null;
          } else if (Array.isArray(data)) {
            // Format: [chat1, chat2, ...]
            chats = data as Chat[];
          } else if (Array.isArray(dataObj.data)) {
            // Format: { data: [chat1, chat2, ...], pagination: {} }
            chats = dataObj.data as Chat[];
            pagination = dataObj.pagination as { limit: number; offset: number; total: number } | null;
          }
        } else if (Array.isArray(data)) {
          // Direct array format
          chats = data as Chat[];
        }
        
        if (chats.length >= 0) {
          setChats(prev => {
            // Check if pagination exists and offset is 0, replace all chats
            if (!pagination || pagination.offset === 0) {
              return chats;
            } else {
              // Append new chats for pagination
              return [...prev, ...chats];
            }
          });
          
          // Set pagination if available, otherwise create default
          if (pagination) {
            setPagination(pagination);
          } else {
            // Create default pagination
            setPagination({
              limit: params.limit || 50,
              offset: 0,
              total: chats.length
            });
          }
        } else {
          console.warn('Unexpected chat list data format:', data);
          setError('Invalid data format received from server');
        }
        
        setIsLoading(false);
        setError(null);
      };

      // Listen for chat list updates
      socketService.onChatList(handleChatListUpdate);

    } catch (err) {
      console.error('Failed to setup socket connection:', err);
      setError(err instanceof Error ? err.message : 'Connection setup failed');
      setConnectionStatus('error');
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      // Only remove listeners, don't disconnect the socket
      // Socket should remain connected for real-time updates
      socketService.offChatList();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [params.whatsappNumberId, params.limit, socketService, requestChatList]);

  // Explicit disconnect method (for logout, etc.)
  const forceDisconnect = useCallback(() => {
    socketService.offChatList();
    socketService.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, [socketService]);

  return {
    chats,
    isLoading,
    error,
    pagination,
    requestRefresh,
    loadMore,
    isConnected,
    connectionStatus,
    forceDisconnect,
  };
}
