'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chatTemplateApi } from '@/lib/api';
import {
  ChatTemplate,
  ChatTemplateListResponse,
  CreateChatTemplateRequest,
  UpdateChatTemplateRequest,
  GetChatTemplateResponse,
  UpsertChatTemplateResponse,
  DeleteChatTemplateResponse,
  ApiResponse,
} from '@/lib/types';

interface UseChatTemplateOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  autoFetch?: boolean;
}

interface ChatTemplateState {
  data: ChatTemplate[];
  pagination: ChatTemplateListResponse['pagination'] | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  search: string;
  isActive?: boolean;
  // mutation states
  isCreating: boolean;
  updatingIds: number[];
  deletingIds: number[];
}

export function useChatTemplate(options: UseChatTemplateOptions = {}) {
  const { page: initialPage = 1, limit: initialLimit = 10, search: initialSearch = '', isActive: initialIsActive, autoFetch = true } = options;

  const [state, setState] = useState<ChatTemplateState>({
    data: [],
    pagination: null,
    isLoading: autoFetch,
    error: null,
    page: initialPage,
    limit: initialLimit,
    search: initialSearch,
    isActive: initialIsActive,
    isCreating: false,
    updatingIds: [],
    deletingIds: [],
  });

  const lastQueryRef = useRef<string>('');
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const fetchTemplates = useCallback(async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) => {
    const current = stateRef.current;
    const page = params?.page ?? current.page;
    const limit = params?.limit ?? current.limit;
    const search = params?.search ?? current.search;
    const isActive = params?.isActive ?? current.isActive;

    const queryKey = JSON.stringify({ page, limit, search, isActive: isActive ?? null });
    if (!params && queryKey === lastQueryRef.current) return;
    lastQueryRef.current = queryKey;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const response = await chatTemplateApi.list({ page, limit, search, isActive });

    if (!response.success || !response.data) {
      setState(prev => ({ ...prev, isLoading: false, error: response.error?.message || 'Gagal memuat chat template' }));
      return;
    }

    const { data, pagination } = response.data;
    setState(prev => ({
      ...prev,
      data,
      pagination,
      isLoading: false,
      error: null,
      page: pagination.currentPage === prev.page ? prev.page : pagination.currentPage,
    }));
  }, []);

  useEffect(() => {
    if (autoFetch) fetchTemplates();
  }, [autoFetch, fetchTemplates]);

  // Auto fetch on filters change after mount
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    fetchTemplates();
  }, [state.page, state.limit, state.search, state.isActive, fetchTemplates]);

  const setFilters = useCallback((filters: Partial<{ page: number; limit: number; search: string; isActive?: boolean }>) => {
    setState(prev => {
      const next = { ...prev, ...filters };
      const noChange =
        prev.page === next.page &&
        prev.limit === next.limit &&
        prev.search === next.search &&
        prev.isActive === next.isActive;
      return noChange ? prev : next;
    });
  }, []);

  const createTemplate = useCallback(async (payload: CreateChatTemplateRequest): Promise<ApiResponse<UpsertChatTemplateResponse>> => {
    setState(prev => ({ ...prev, isCreating: true, error: null }));
    const response = await chatTemplateApi.create(payload);
    if (!response.success || !response.data) {
      setState(prev => ({ ...prev, isCreating: false, error: response.error?.message || 'Gagal membuat chat template' }));
      return response;
    }
    const created = response.data.data;
    setState(prev => ({
      ...prev,
      isCreating: false,
      data: [created, ...prev.data],
      pagination: prev.pagination ? { ...prev.pagination, totalItems: prev.pagination.totalItems + 1 } : prev.pagination,
    }));
    return response;
  }, []);

  const updateTemplate = useCallback(async (id: number, payload: UpdateChatTemplateRequest): Promise<ApiResponse<UpsertChatTemplateResponse>> => {
    setState(prev => ({ ...prev, updatingIds: [...prev.updatingIds, id], error: null }));
    const response = await chatTemplateApi.update(id, payload);
    if (!response.success || !response.data) {
      setState(prev => ({ ...prev, updatingIds: prev.updatingIds.filter(x => x !== id), error: response.error?.message || 'Gagal memperbarui chat template' }));
      return response;
    }
    const updated = response.data.data;
    setState(prev => ({
      ...prev,
      updatingIds: prev.updatingIds.filter(x => x !== id),
      data: prev.data.map(t => (t.id === id ? updated : t)),
    }));
    return response;
  }, []);

  const deleteTemplate = useCallback(async (id: number): Promise<ApiResponse<DeleteChatTemplateResponse>> => {
    setState(prev => ({ ...prev, deletingIds: [...prev.deletingIds, id], error: null }));
    const response = await chatTemplateApi.delete(id);
    if (!response.success) {
      setState(prev => ({ ...prev, deletingIds: prev.deletingIds.filter(x => x !== id), error: response.error?.message || 'Gagal menghapus chat template' }));
      return response;
    }
    setState(prev => ({
      ...prev,
      deletingIds: prev.deletingIds.filter(x => x !== id),
      data: prev.data.filter(t => t.id !== id),
      pagination: prev.pagination ? { ...prev.pagination, totalItems: prev.pagination.totalItems - 1 } : prev.pagination,
    }));
    return response;
  }, []);

  const isUpdating = useCallback((id: number) => state.updatingIds.includes(id), [state.updatingIds]);
  const isDeleting = useCallback((id: number) => state.deletingIds.includes(id), [state.deletingIds]);

  // Getters (no state change)
  const getTemplate = useCallback(async (id: number): Promise<ApiResponse<GetChatTemplateResponse>> => {
    const res = await chatTemplateApi.getById(id);
    return res;
  }, []);

  const getTemplateByCommand = useCallback(async (command: string): Promise<ApiResponse<GetChatTemplateResponse>> => {
    const res = await chatTemplateApi.getByCommand(command);
    return res;
  }, []);

  return {
    // data
    data: state.data,
    pagination: state.pagination,

    // loading
    isLoading: state.isLoading,
    error: state.error,

    // filters
    page: state.page,
    limit: state.limit,
    search: state.search,
    isActive: state.isActive,

    // actions
    fetchTemplates,
    setFilters,

    // mutations
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // mutation states
    isCreating: state.isCreating,
    isUpdating,
    isDeleting,

    // getters
    getTemplate,
    getTemplateByCommand,
  };
}
