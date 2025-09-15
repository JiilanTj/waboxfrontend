'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { whatsappApi } from '@/lib/api';
import {
  WhatsAppListResponse,
  WhatsAppPagination,
  CreateWhatsAppRequest,
  UpdateWhatsAppRequest,
} from '@/lib/types';

interface UseWhatsAppOptions {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  autoFetch?: boolean;
}

interface WhatsAppState {
  data: WhatsAppListResponse['whatsappNumbers'];
  pagination: WhatsAppPagination | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  isActive?: boolean;
  search: string;
  // mutation states
  isCreating: boolean;
  isUpdating: Record<number, boolean>;
  isDeleting: Record<number, boolean>;
  isToggling: Record<number, boolean>;
}

export function useWhatsApp(options: UseWhatsAppOptions = {}) {
  const {
    page: initialPage = 1,
    limit: initialLimit = 10,
    isActive: initialIsActive,
    search: initialSearch = '',
    autoFetch = false,
  } = options;

  const [state, setState] = useState<WhatsAppState>({
    data: [],
    pagination: null,
    isLoading: false,
    error: null,
    page: initialPage,
    limit: initialLimit,
    isActive: initialIsActive,
    search: initialSearch,
    isCreating: false,
    isUpdating: {},
    isDeleting: {},
    isToggling: {},
  });

  const filtersRef = useRef({
    page: initialPage,
    limit: initialLimit,
    isActive: initialIsActive,
    search: initialSearch,
  });

  // Stable filters object for useEffect dependency
  const currentFilters = useMemo(() => ({
    page: state.page,
    limit: state.limit,
    isActive: state.isActive,
    search: state.search,
  }), [state.page, state.limit, state.isActive, state.search]);

  const fetchWhatsApp = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await whatsappApi.getWhatsAppNumbers({
        page: state.page,
        limit: state.limit,
        isActive: state.isActive,
        search: state.search || undefined,
      });

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          data: response.data!.whatsappNumbers,
          pagination: response.data!.pagination,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error?.message || 'Failed to fetch WhatsApp numbers',
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false,
      }));
    }
  }, [state.page, state.limit, state.isActive, state.search]);

  // Set filters function that updates the state and triggers fetch
  const setFilters = useCallback((newFilters: Partial<UseWhatsAppOptions>) => {
    setState(prev => {
      const updatedState = {
        ...prev,
        page: newFilters.page ?? prev.page,
        limit: newFilters.limit ?? prev.limit,
        isActive: newFilters.isActive ?? prev.isActive,
        search: newFilters.search ?? prev.search,
      };

      // Update ref to track the change
      filtersRef.current = {
        page: updatedState.page,
        limit: updatedState.limit,
        isActive: updatedState.isActive,
        search: updatedState.search,
      };

      return updatedState;
    });
  }, []);

  // Auto-fetch when filters change
  useEffect(() => {
    if (autoFetch) {
      const hasFiltersChanged = 
        filtersRef.current.page !== currentFilters.page ||
        filtersRef.current.limit !== currentFilters.limit ||
        filtersRef.current.isActive !== currentFilters.isActive ||
        filtersRef.current.search !== currentFilters.search;

      if (hasFiltersChanged) {
        fetchWhatsApp();
      }
    }
  }, [autoFetch, currentFilters, fetchWhatsApp]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch && state.data.length === 0 && !state.isLoading) {
      fetchWhatsApp();
    }
  }, [autoFetch, fetchWhatsApp, state.data.length, state.isLoading]);

  // Create WhatsApp number
  const createWhatsApp = useCallback(async (data: CreateWhatsAppRequest) => {
    setState(prev => ({ ...prev, isCreating: true }));

    try {
      const response = await whatsappApi.createWhatsAppNumber(data);
      if (response.success) {
        // Refresh the list after successful creation
        await fetchWhatsApp();
      }
      setState(prev => ({ ...prev, isCreating: false }));
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, isCreating: false }));
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }, [fetchWhatsApp]);

  // Update WhatsApp number
  const updateWhatsApp = useCallback(async (id: number, data: UpdateWhatsAppRequest) => {
    setState(prev => ({
      ...prev,
      isUpdating: { ...prev.isUpdating, [id]: true }
    }));

    try {
      const response = await whatsappApi.updateWhatsAppNumber(id, data);
      if (response.success) {
        // Update the specific item in the list
        setState(prev => ({
          ...prev,
          data: prev.data.map(item =>
            item.id === id && response.data
              ? { ...response.data.whatsappNumber }
              : item
          ),
        }));
      }
      setState(prev => ({
        ...prev,
        isUpdating: { ...prev.isUpdating, [id]: false }
      }));
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUpdating: { ...prev.isUpdating, [id]: false }
      }));
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }, []);

  // Delete WhatsApp number
  const deleteWhatsApp = useCallback(async (id: number) => {
    setState(prev => ({
      ...prev,
      isDeleting: { ...prev.isDeleting, [id]: true }
    }));

    try {
      const response = await whatsappApi.deleteWhatsAppNumber(id);
      if (response.success) {
        // Remove the item from the list
        setState(prev => ({
          ...prev,
          data: prev.data.filter(item => item.id !== id),
        }));
      }
      setState(prev => ({
        ...prev,
        isDeleting: { ...prev.isDeleting, [id]: false }
      }));
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isDeleting: { ...prev.isDeleting, [id]: false }
      }));
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }, []);

  // Toggle WhatsApp number status
  const toggleWhatsAppStatus = useCallback(async (id: number) => {
    setState(prev => ({
      ...prev,
      isToggling: { ...prev.isToggling, [id]: true }
    }));

    try {
      const response = await whatsappApi.toggleWhatsAppStatus(id);
      if (response.success && response.data) {
        // Update the specific item in the list
        setState(prev => ({
          ...prev,
          data: prev.data.map(item =>
            item.id === id 
              ? { ...response.data!.whatsappNumber }
              : item
          ),
        }));
      }
      setState(prev => ({
        ...prev,
        isToggling: { ...prev.isToggling, [id]: false }
      }));
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isToggling: { ...prev.isToggling, [id]: false }
      }));
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
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
    page: state.page,
    limit: state.limit,
    isActive: state.isActive,
    search: state.search,
    
    // Actions
    fetchWhatsApp,
    setFilters,
    
    // Mutations
    createWhatsApp,
    updateWhatsApp,
    deleteWhatsApp,
    toggleWhatsAppStatus,
    
    // Mutation loading states
    isCreating: state.isCreating,
    isUpdating: (id: number) => state.isUpdating[id] || false,
    isDeleting: (id: number) => state.isDeleting[id] || false,
    isToggling: (id: number) => state.isToggling[id] || false,
  };
}
