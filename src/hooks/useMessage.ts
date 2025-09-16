'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { messageApi } from '@/lib/api';
import {
  ChatHistoryResponse,
  ChatHistoryParams,
  ChatMessage,
  SendMessageParams,
} from '@/lib/types';

interface UseMessageOptions {
  chatId: string;
  sessionId?: string; // Add sessionId for sending messages
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
  enablePolling?: boolean;
  pollingInterval?: number; // in milliseconds
}

interface MessageState {
  data: ChatMessage[];
  pagination: ChatHistoryResponse['pagination'] | null;
  isLoading: boolean;
  error: string | null;
  chatId: string;
  sessionId?: string;
  limit: number;
  offset: number;
  // Send message states
  isSending: boolean;
  sendError: string | null;
}

export function useMessage(options: UseMessageOptions) {
  const {
    chatId,
    sessionId,
    limit: initialLimit = 50,
    offset: initialOffset = 0,
    autoFetch = true,
    enablePolling = false,
    pollingInterval = 5000, // 5 seconds default
  } = options;

  const [state, setState] = useState<MessageState>({
    data: [],
    pagination: null,
    isLoading: false,
    error: null,
    chatId,
    sessionId,
    limit: initialLimit,
    offset: initialOffset,
    isSending: false,
    sendError: null,
  });

  const filtersRef = useRef({
    chatId,
    limit: initialLimit,
    offset: initialOffset,
  });

  // Polling state
  const [isPollingEnabled, setIsPollingEnabled] = useState(enablePolling);

  // Stable filters object for useEffect dependency
  const currentFilters = useMemo(() => ({
    chatId: state.chatId,
    limit: state.limit,
    offset: state.offset,
  }), [state.chatId, state.limit, state.offset]);

  const fetchChatHistory = useCallback(async () => {
    console.log('🔥 fetchChatHistory called for chatId:', state.chatId);
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params: ChatHistoryParams = {
        chatId: state.chatId,
        limit: state.limit,
        offset: state.offset,
      };

      console.log('📡 API params:', params);
      const response = await messageApi.getChatHistory(params);
      console.log('📨 API response:', response);

      if (response && response.success && response.data) {
        setState(prev => ({
          ...prev,
          data: response.data,
          pagination: response.pagination,
          isLoading: false,
        }));
        console.log('✅ Messages updated, count:', response.data.length);
      } else {
        const errorMessage = response?.message || 'Failed to fetch chat history';
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
  }, [state.chatId, state.limit, state.offset]);

  // Set filters function that updates the state and triggers fetch
  const setFilters = useCallback((newFilters: Partial<Omit<UseMessageOptions, 'autoFetch' | 'enablePolling' | 'pollingInterval'>>) => {
    setState(prev => {
      const updatedState = {
        ...prev,
        chatId: newFilters.chatId ?? prev.chatId,
        limit: newFilters.limit ?? prev.limit,
        offset: newFilters.offset ?? prev.offset,
      };

      // Update ref to track the change
      filtersRef.current = {
        chatId: updatedState.chatId,
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
        filtersRef.current.chatId !== currentFilters.chatId ||
        filtersRef.current.limit !== currentFilters.limit ||
        filtersRef.current.offset !== currentFilters.offset;

      if (hasFiltersChanged) {
        fetchChatHistory();
      }
    }
  }, [autoFetch, currentFilters, fetchChatHistory]);

  // Reset and fetch when chatId changes (important for switching chats)
  useEffect(() => {
    console.log('🔄 chatId effect triggered:', {
      newChatId: chatId,
      currentRefChatId: filtersRef.current.chatId,
      stateChatId: state.chatId
    });
    
    if (chatId && chatId !== state.chatId) {
      console.log('🔄 ChatId changed, resetting state and fetching new messages');
      setState(prev => ({
        ...prev,
        data: [], // Clear previous messages
        pagination: null,
        error: null,
        chatId: chatId,
        offset: 0 // Reset to first page
      }));
      
      // Update ref immediately
      filtersRef.current = {
        ...filtersRef.current,
        chatId: chatId,
        offset: 0
      };
    }
  }, [chatId, state.chatId]);

  // Update sessionId when it changes
  useEffect(() => {
    if (sessionId !== state.sessionId) {
      console.log('🔄 SessionId changed:', { oldSessionId: state.sessionId, newSessionId: sessionId });
      setState(prev => ({
        ...prev,
        sessionId: sessionId,
        sendError: null // Clear any previous send errors when session changes
      }));
    }
  }, [sessionId, state.sessionId]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch && state.data.length === 0 && !state.isLoading) {
      fetchChatHistory();
    }
  }, [autoFetch, fetchChatHistory, state.data.length, state.isLoading]);

  // Polling effect
  useEffect(() => {
    if (!isPollingEnabled) return;

    const interval = setInterval(() => {
      // Only poll if not currently loading to avoid conflicts
      if (!state.isLoading) {
        fetchChatHistory();
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [isPollingEnabled, pollingInterval, fetchChatHistory, state.isLoading]);

  // Refresh function to fetch latest data
  const refresh = useCallback(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  // Load more function for pagination
  const loadMore = useCallback(() => {
    if (state.pagination && state.offset + state.limit < state.pagination.total) {
      setFilters({
        offset: state.offset + state.limit
      });
    }
  }, [state.pagination, state.offset, state.limit, setFilters]);

  // Load newer messages (for when new messages arrive)
  const loadNewer = useCallback(() => {
    setFilters({ offset: 0 });
  }, [setFilters]);

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

  // Add new message to the list (for real-time updates)
  const addMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      data: [message, ...prev.data], // Add to beginning for newest first
    }));
  }, []);

  // Update message status (for delivery/read receipts)
  const updateMessageStatus = useCallback((messageId: string, status: ChatMessage['status']) => {
    setState(prev => ({
      ...prev,
      data: prev.data.map(msg => 
        msg.messageId === messageId 
          ? { ...msg, status }
          : msg
      ),
    }));
  }, []);

  // Send message function
  const sendMessage = useCallback(async (to: string, message: string) => {
    if (!state.sessionId) {
      console.error('❌ SessionId is required to send messages');
      setState(prev => ({
        ...prev,
        sendError: 'SessionId is required to send messages'
      }));
      return {
        success: false,
        error: {
          error: 'MissingSessionId',
          message: 'SessionId is required to send messages'
        }
      };
    }

    console.log('📤 Sending message:', { sessionId: state.sessionId, to, message });
    setState(prev => ({ ...prev, isSending: true, sendError: null }));

    try {
      const params: SendMessageParams = {
        sessionId: state.sessionId,
        to: to,
        message: message
      };

      const response = await messageApi.sendMessage(params);
      console.log('📤 Send response type:', typeof response);
      console.log('📤 Send response:', response);
      console.log('📤 Send response success:', response?.success);
      console.log('📤 Send response data:', response?.data);

      // Handle undefined response
      if (!response) {
        console.error('❌ Response is undefined');
        const errorMessage = 'No response from server';
        setState(prev => ({
          ...prev,
          sendError: errorMessage,
          isSending: false,
        }));
        return {
          success: false,
          error: {
            error: 'NoResponse',
            message: errorMessage
          }
        };
      }

      if (response.success && response.data) {
        // Create a temporary message object to add to the list immediately
        const tempMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          messageId: response.data.messageId,
          fromJid: `${response.data.from.phoneNumber}@s.whatsapp.net`,
          fromNumber: response.data.from.phoneNumber,
          fromName: response.data.from.name,
          content: message,
          type: 'TEXT',
          mediaUrl: null,
          mediaCaption: null,
          quotedMessageId: null,
          quotedContent: null,
          isFromMe: true,
          status: 'SENT',
          timestamp: response.data.timestamp,
        };

        // Add the message to the beginning of the list
        setState(prev => ({
          ...prev,
          data: [tempMessage, ...prev.data],
          isSending: false,
        }));

        console.log('✅ Message sent and added to list');
        return response;
      } else {
        // Handle failed response
        const errorMessage = response.message || 'Failed to send message';
        console.error('❌ API returned error:', errorMessage);
        setState(prev => ({
          ...prev,
          sendError: errorMessage,
          isSending: false,
        }));
        return {
          success: false,
          error: {
            error: 'ApiError',
            message: errorMessage
          }
        };
      }
    } catch (error) {
      console.log('💥 Send error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        sendError: errorMessage,
        isSending: false,
      }));
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: errorMessage
        }
      };
    }
  }, [state.sessionId]);

  return {
    // Data
    data: state.data,
    messages: state.data, // Alias for convenience
    pagination: state.pagination,
    
    // Loading states
    isLoading: state.isLoading,
    error: state.error,
    
    // Send message states
    isSending: state.isSending,
    sendError: state.sendError,
    
    // Current filter values
    chatId: state.chatId,
    sessionId: state.sessionId,
    limit: state.limit,
    offset: state.offset,
    
    // Actions
    fetchChatHistory,
    setFilters,
    refresh,
    loadMore,
    loadNewer,
    resetToFirstPage,
    
    // Send message
    sendMessage,
    
    // Real-time message management
    addMessage,
    updateMessageStatus,
    
    // Polling controls
    isPollingEnabled,
    togglePolling,
    startPolling,
    stopPolling,
    
    // Helper computed values
    hasMore: state.pagination ? state.offset + state.limit < state.pagination.total : false,
    totalMessages: state.pagination?.total || 0,
    currentPage: Math.floor(state.offset / state.limit) + 1,
    totalPages: state.pagination ? Math.ceil(state.pagination.total / state.limit) : 0,
    isEmpty: state.data.length === 0 && !state.isLoading,
    
    // Message helpers
    latestMessage: state.data[0] || null,
    oldestMessage: state.data[state.data.length - 1] || null,
  };
}
