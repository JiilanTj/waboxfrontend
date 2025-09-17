'use client';

import { useCallback, useEffect, useState } from 'react';
import { waPermissionApi } from '@/lib/api';
import {
  WAPermission,
  CreateWAPermissionRequest,
  CreateWAPermissionResponse,
  WAPermissionListResponse,
  MyWAPermissionListResponse,
  WAPermissionByUserResponse
} from '@/lib/types';

interface UseWAPermissionOptions {
  autoFetch?: boolean;
}

interface WAPermissionState {
  permissions: WAPermission[];
  myPermissions: WAPermission[];
  userPermissions: WAPermission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  } | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

export function useWAPermission(options: UseWAPermissionOptions = {}) {
  const { autoFetch = true } = options;

  const [state, setState] = useState<WAPermissionState>({
    permissions: [],
    myPermissions: [],
    userPermissions: [],
    pagination: null,
    isLoading: false,
    isCreating: false,
    error: null,
  });

  // Fetch all permissions
  const fetchPermissions = useCallback(async (params?: { page?: number; limit?: number }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    console.log('🔍 Fetching WhatsApp permissions...', params);

    try {
      const response = await waPermissionApi.list(params);
      console.log('📋 Permissions response:', response);

      if (response.success && response.data) {
        const responseData = response.data as WAPermissionListResponse;
        setState(prev => ({
          ...prev,
          permissions: responseData.data,
          pagination: responseData.pagination || null,
          isLoading: false,
          error: null,
        }));
        console.log('✅ Permissions fetched successfully');
      } else {
        const errorMessage = response.error?.message || 'Failed to fetch permissions';
        setState(prev => ({
          ...prev,
          permissions: [],
          pagination: null,
          isLoading: false,
          error: errorMessage,
        }));
        console.log('❌ Failed to fetch permissions:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        permissions: [],
        pagination: null,
        isLoading: false,
        error: errorMessage,
      }));
      console.log('💥 Permissions fetch error:', error);
    }
  }, []);

  // Fetch my permissions
  const fetchMyPermissions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    console.log('🔍 Fetching my WhatsApp permissions...');

    try {
      const response = await waPermissionApi.getMyPermissions();
      console.log('📋 My permissions response:', response);

      if (response.success && response.data) {
        const responseData = response.data as MyWAPermissionListResponse;
        setState(prev => ({
          ...prev,
          myPermissions: responseData.data,
          isLoading: false,
          error: null,
        }));
        console.log('✅ My permissions fetched successfully');
      } else {
        const errorMessage = response.error?.message || 'Failed to fetch my permissions';
        setState(prev => ({
          ...prev,
          myPermissions: [],
          isLoading: false,
          error: errorMessage,
        }));
        console.log('❌ Failed to fetch my permissions:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        myPermissions: [],
        isLoading: false,
        error: errorMessage,
      }));
      console.log('💥 My permissions fetch error:', error);
    }
  }, []);

  // Create permission
  const createPermission = useCallback(async (request: CreateWAPermissionRequest): Promise<CreateWAPermissionResponse | null> => {
    setState(prev => ({ ...prev, isCreating: true, error: null }));
    console.log('➕ Creating WhatsApp permission...', request);

    try {
      const response = await waPermissionApi.create(request);
      console.log('📋 Create permission response:', response);

      if (response.success && response.data) {
        const responseData = response.data as CreateWAPermissionResponse;
        setState(prev => ({
          ...prev,
          isCreating: false,
          error: null,
        }));
        console.log('✅ Permission created successfully');
        
        // Refresh permissions after creation
        fetchPermissions();
        fetchMyPermissions();
        
        return responseData;
      } else {
        const errorMessage = response.error?.message || 'Failed to create permission';
        setState(prev => ({
          ...prev,
          isCreating: false,
          error: errorMessage,
        }));
        console.log('❌ Failed to create permission:', errorMessage);
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isCreating: false,
        error: errorMessage,
      }));
      console.log('💥 Create permission error:', error);
      return null;
    }
  }, [fetchPermissions, fetchMyPermissions]);

  // Fetch permissions by user ID
  const fetchPermissionsByUserId = useCallback(async (userId: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    console.log('🔍 Fetching WhatsApp permissions for user ID:', userId);

    try {
      const response = await waPermissionApi.getPermissionsByUserId(userId);
      console.log('📋 User permissions response:', response);

      if (response.success && response.data) {
        const responseData = response.data as WAPermissionByUserResponse;
        setState(prev => ({
          ...prev,
          userPermissions: responseData.data,
          isLoading: false,
          error: null,
        }));
        console.log('✅ User permissions fetched successfully');
      } else {
        const errorMessage = response.error?.message || 'Failed to fetch user permissions';
        setState(prev => ({
          ...prev,
          userPermissions: [],
          isLoading: false,
          error: errorMessage,
        }));
        console.log('❌ Failed to fetch user permissions:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        userPermissions: [],
        isLoading: false,
        error: errorMessage,
      }));
      console.log('💥 User permissions fetch error:', error);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPermissions();
      fetchMyPermissions();
    }
  }, [autoFetch, fetchPermissions, fetchMyPermissions]);

  return {
    // Data
    permissions: state.permissions,
    myPermissions: state.myPermissions,
    userPermissions: state.userPermissions,
    pagination: state.pagination,
    
    // Loading states
    isLoading: state.isLoading,
    isCreating: state.isCreating,
    error: state.error,
    
    // Actions
    fetchPermissions,
    fetchMyPermissions,
    createPermission,
    fetchPermissionsByUserId,
    
    // Helper computed values
    totalPermissions: state.pagination?.totalItems || 0,
    currentPage: state.pagination?.currentPage || 1,
    totalPages: state.pagination?.totalPages || 0,
    hasMyPermissions: state.myPermissions.length > 0,
    hasUserPermissions: state.userPermissions.length > 0,
  };
}
