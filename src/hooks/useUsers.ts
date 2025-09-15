'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usersApi } from '@/lib/api';
import {
  UsersListResponse,
  UsersPagination,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/lib/types';

interface UseUsersOptions {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  autoFetch?: boolean;
}

interface UsersState {
  data: UsersListResponse['users'];
  pagination: UsersPagination | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  role?: string;
  search: string;
  // mutation states
  isCreating: boolean;
  updatingIds: number[];
  deletingIds: number[];
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const { page: initialPage = 1, limit: initialLimit = 10, role: initialRole, search: initialSearch = '', autoFetch = true } = options;
  const [state, setState] = useState<UsersState>({
    data: [],
    pagination: null,
    isLoading: autoFetch,
    error: null,
    page: initialPage,
    limit: initialLimit,
    role: initialRole,
    search: initialSearch,
    isCreating: false,
    updatingIds: [],
    deletingIds: [],
  });

  // Track last executed query to prevent redundant refetch loops
  const lastQueryRef = useRef<string>('');
  const stateRef = useRef(state);
  
  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const fetchUsers = useCallback(async (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const currentState = stateRef.current;
    const page = params?.page ?? currentState.page;
    const limit = params?.limit ?? currentState.limit;
    const role = params?.role ?? currentState.role;
    const search = params?.search ?? currentState.search;

    const queryKey = JSON.stringify({ page, limit, role: role || null, search });
    if (!params && queryKey === lastQueryRef.current) {
      // skip duplicate automatic fetch
      return;
    }
    lastQueryRef.current = queryKey;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const response = await usersApi.list({ page, limit, role, search });

    if (!response.success || !response.data) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: response.error?.message || 'Gagal memuat data pengguna',
      }));
      return;
    }

    const { users, pagination } = response.data;
    setState(prev => ({
      ...prev,
      data: users,
      pagination,
      isLoading: false,
      error: null,
      // only update page if berbeda
      page: pagination.currentPage === prev.page ? prev.page : pagination.currentPage,
    }));
  }, []); // ✅ Empty dependency array - usersApi is stable

  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [autoFetch, fetchUsers]);

  // Auto fetch when filters change (but not on initial load)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    fetchUsers();
  }, [state.page, state.limit, state.role, state.search, fetchUsers]);

  const setFilters = (filters: Partial<{ page: number; limit: number; role?: string; search: string }>) => {
    setState(prev => ({ ...prev, ...filters }));
    // fetchUsers will be called automatically by useEffect when state changes
  };

  const createUser = useCallback(async (payload: CreateUserRequest) => {
    setState(prev => ({ ...prev, isCreating: true, error: null }));
    const response = await usersApi.create(payload);
    if (!response.success || !response.data) {
      setState(prev => ({ ...prev, isCreating: false, error: response.error?.message || 'Gagal membuat pengguna' }));
      return response;
    }
    const newUser = response.data.user;
    setState(prev => ({
      ...prev,
      isCreating: false,
      data: [newUser, ...prev.data],
      pagination: prev.pagination ? { ...prev.pagination, totalUsers: prev.pagination.totalUsers + 1 } : prev.pagination,
    }));
    return response;
  }, []);

  const updateUser = useCallback(async (id: number, payload: UpdateUserRequest) => {
    setState(prev => ({ ...prev, updatingIds: [...prev.updatingIds, id], error: null }));
    const response = await usersApi.update(id, payload);
    if (!response.success || !response.data) {
      setState(prev => ({ ...prev, updatingIds: prev.updatingIds.filter(x => x !== id), error: response.error?.message || 'Gagal memperbarui pengguna' }));
      return response;
    }
    const updated = response.data.user;
    setState(prev => ({
      ...prev,
      updatingIds: prev.updatingIds.filter(x => x !== id),
      data: prev.data.map(u => (u.id === id ? updated : u)),
    }));
    return response;
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, deletingIds: [...prev.deletingIds, id], error: null }));
    const response = await usersApi.delete(id);
    if (!response.success) {
      setState(prev => ({ ...prev, deletingIds: prev.deletingIds.filter(x => x !== id), error: response.error?.message || 'Gagal menghapus pengguna' }));
      return response;
    }
    setState(prev => ({
      ...prev,
      deletingIds: prev.deletingIds.filter(x => x !== id),
      data: prev.data.filter(u => u.id !== id),
      pagination: prev.pagination ? { ...prev.pagination, totalUsers: prev.pagination.totalUsers - 1 } : prev.pagination,
    }));
    return response;
  }, []);

  const isUpdating = useCallback((id: number) => state.updatingIds.includes(id), [state.updatingIds]);
  const isDeleting = useCallback((id: number) => state.deletingIds.includes(id), [state.deletingIds]);

  return {
    ...state,
    fetchUsers,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
    isUpdating,
    isDeleting,
  };
};
