'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { chatApi } from '@/lib/api';
import {
  ChatListResponse,
  ChatListParams,
  Chat,
} from '@/lib/types';

interface UseChatOptions {
  whatsappNumberId: number;
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
  enablePolling?: boolean;
  pollingInterval?: number; // in milliseconds
}

interface ChatState {
  data: Chat[];
  pagination: ChatListResponse['pagination'] | null;
  isLoading: boolean;
  error: string | null;
  whatsappNumberId: number;
  limit: number;
  offset: number;
}

export function useChat(options: UseChatOptions) {
  const {
    whatsappNumberId,
    limit: initialLimit = 50,
    offset: initialOffset = 0,
    autoFetch = true,
    enablePolling = false,
    pollingInterval = 5000, // 5 seconds default
  } = options;

  const [state, setState] = useState<ChatState>({
    data: [],
    pagination: null,
    isLoading: false,
    error: null,
    whatsappNumberId,
    limit: initialLimit,
    offset: initialOffset,
  });

  const filtersRef = useRef({
    whatsappNumberId,
    limit: initialLimit,
    offset: initialOffset,
  });

  // Polling state
  const [isPollingEnabled, setIsPollingEnabled] = useState(enablePolling);

  // Stable filters object for useEffect dependency
  const currentFilters = useMemo(() => ({
    whatsappNumberId: state.whatsappNumberId,
    limit: state.limit,
    offset: state.offset,
  }), [state.whatsappNumberId, state.limit, state.offset]);

  const fetchChatList = useCallback(async () => {
    console.log('🔥 fetchChatList called for whatsappNumberId:', state.whatsappNumberId);
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params: ChatListParams = {
        whatsappNumberId: state.whatsappNumberId,
        limit: state.limit,
        offset: state.offset,
      };

      console.log('📡 API params:', params);
      const response = await chatApi.getChatList(params);
      console.log('📨 API response:', response);

      if (response && response.success && response.data) {
        setState(prev => ({
          ...prev,
          data: response.data,
          pagination: response.pagination,
          isLoading: false,
        }));
        console.log('✅ Chat list updated, count:', response.data.length);
      } else {
        const errorMessage = response?.message || 'Failed to fetch chat list';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        console.log('❌ API error:', errorMessage);
      }
    } catch (error) {
      console.log('💥 Fetch error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false,
      }));
    }
  }, [state.whatsappNumberId, state.limit, state.offset]);

  // Set filters function that updates the state and triggers fetch
  const setFilters = useCallback((newFilters: Partial<Omit<UseChatOptions, 'autoFetch'>>) => {
    setState(prev => {
      const updatedState = {
        ...prev,
        whatsappNumberId: newFilters.whatsappNumberId ?? prev.whatsappNumberId,
        limit: newFilters.limit ?? prev.limit,
        offset: newFilters.offset ?? prev.offset,
      };

      // Update ref to track the change
      filtersRef.current = {
        whatsappNumberId: updatedState.whatsappNumberId,
        limit: updatedState.limit,
        offset: updatedState.offset,
      };

      return updatedState;
    });
  }, []);

  // Auto-fetch when filters change
  useEffect(() => {
    if (autoFetch) {
      const hasFiltersChanged = 
        filtersRef.current.whatsappNumberId !== currentFilters.whatsappNumberId ||
        filtersRef.current.limit !== currentFilters.limit ||
        filtersRef.current.offset !== currentFilters.offset;

      if (hasFiltersChanged) {
        fetchChatList();
      }
    }
  }, [autoFetch, currentFilters, fetchChatList]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch && state.data.length === 0 && !state.isLoading) {
      fetchChatList();
    }
  }, [autoFetch, fetchChatList, state.data.length, state.isLoading]);

  // Polling effect
  useEffect(() => {
    if (!isPollingEnabled) return;

    const interval = setInterval(() => {
      // Only poll if not currently loading to avoid conflicts
      if (!state.isLoading) {
        fetchChatList();
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [isPollingEnabled, pollingInterval, fetchChatList, state.isLoading]);

  // Refresh function to fetch latest data
  const refresh = useCallback(() => {
    fetchChatList();
  }, [fetchChatList]);

  // Load more function for pagination
  const loadMore = useCallback(() => {
    if (state.pagination && state.offset + state.limit < state.pagination.total) {
      setFilters({
        offset: state.offset + state.limit
      });
    }
  }, [state.pagination, state.offset, state.limit, setFilters]);

  // Reset to first page
  const resetToFirstPage = useCallback(() => {
    setFilters({ offset: 0 });
  }, [setFilters]);

  // Toggle polling
  const togglePolling = useCallback(() => {
    setIsPollingEnabled(prev => !prev);
  }, [setIsPollingEnabled]);

  const startPolling = useCallback(() => {
    setIsPollingEnabled(true);
  }, [setIsPollingEnabled]);

  const stopPolling = useCallback(() => {
    setIsPollingEnabled(false);
  }, [setIsPollingEnabled]);

  // Mark chat as read
  const markAsRead = useCallback(async (chatId: string) => {
    console.log('📖 Marking chat as read:', chatId);
    
    try {
      const response = await chatApi.markAsRead(chatId);
      console.log('📖 Mark as read response:', response);
      
      if (response.success) {
        // Update the chat's unreadCount to 0 in the local state
        setState(prev => ({
          ...prev,
          data: prev.data.map(chat =>
            chat.id === chatId
              ? { ...chat, unreadCount: 0 }
              : chat
          ),
        }));
        console.log('✅ Chat marked as read successfully');
      } else {
        console.log('❌ Failed to mark chat as read:', response.message);
      }
      
      return response;
    } catch (error) {
      console.log('💥 Mark as read error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }, []);

  return {
    // Data
    data: state.data,
    pagination: state.pagination,
    
    // Loading states
    isLoading: state.isLoading,
    error: state.error,
    
    // Current filter values
    whatsappNumberId: state.whatsappNumberId,
    limit: state.limit,
    offset: state.offset,
    
    // Actions
    fetchChatList,
    setFilters,
    refresh,
    loadMore,
    resetToFirstPage,
    markAsRead, // 🆕 Add markAsRead function
    
    // Polling controls
    isPollingEnabled,
    togglePolling,
    startPolling,
    stopPolling,
    
    // Helper computed values
    hasMore: state.pagination ? state.offset + state.limit < state.pagination.total : false,
    totalChats: state.pagination?.total || 0,
    currentPage: Math.floor(state.offset / state.limit) + 1,
    totalPages: state.pagination ? Math.ceil(state.pagination.total / state.limit) : 0,
  };
}
