import { apiClient } from '@/lib/utils/api-client';
import {
  CreateWAPermissionRequest,
  CreateWAPermissionResponse,
  WAPermissionListResponse,
  MyWAPermissionListResponse,
  WAPermissionByUserResponse,
  ApiResponse
} from '@/lib/types';

export const waPermissionApi = {
  /**
   * POST /wapermission - create WhatsApp permission
   */
  async create(payload: CreateWAPermissionRequest): Promise<ApiResponse<CreateWAPermissionResponse>> {
    try {
      const response = await apiClient.post<CreateWAPermissionResponse>('/wapermission', payload);
      
      if (response.success && response.data) {
        return response;
      } else {
        return {
          success: false,
          error: { 
            error: 'permission_creation_failed',
            message: response.error?.message || 'Failed to create WhatsApp permission' 
          },
          data: undefined
        };
      }
    } catch (error) {
      console.error('❌ Error in createWAPermission API:', error);
      return {
        success: false,
        error: { 
          error: 'permission_creation_error',
          message: error instanceof Error ? error.message : 'Failed to create WhatsApp permission' 
        },
        data: undefined
      };
    }
  },

  /**
   * GET /wapermission - list all WhatsApp permissions with pagination
   */
  async list(params?: { page?: number; limit?: number }): Promise<ApiResponse<WAPermissionListResponse>> {
    try {
      const query = new URLSearchParams();
      if (params?.page !== undefined) query.set('page', String(params.page));
      if (params?.limit !== undefined) query.set('limit', String(params.limit));

      const qs = query.toString();
      const response = await apiClient.get<WAPermissionListResponse>(`/wapermission${qs ? `?${qs}` : ''}`);
      
      if (response.success && response.data) {
        return response;
      } else {
        return {
          success: false,
          error: { 
            error: 'permissions_fetch_failed',
            message: response.error?.message || 'Failed to fetch WhatsApp permissions' 
          },
          data: undefined
        };
      }
    } catch (error) {
      console.error('❌ Error in listWAPermissions API:', error);
      return {
        success: false,
        error: { 
          error: 'permissions_fetch_error',
          message: error instanceof Error ? error.message : 'Failed to fetch WhatsApp permissions' 
        },
        data: undefined
      };
    }
  },

  /**
   * GET /wapermission/my - get current user's WhatsApp permissions
   */
  async getMyPermissions(): Promise<ApiResponse<MyWAPermissionListResponse>> {
    try {
      const response = await apiClient.get<MyWAPermissionListResponse>('/wapermission/my');
      
      if (response.success && response.data) {
        return response;
      } else {
        return {
          success: false,
          error: { 
            error: 'my_permissions_fetch_failed',
            message: response.error?.message || 'Failed to fetch my WhatsApp permissions' 
          },
          data: undefined
        };
      }
    } catch (error) {
      console.error('❌ Error in getMyWAPermissions API:', error);
      return {
        success: false,
        error: { 
          error: 'my_permissions_fetch_error',
          message: error instanceof Error ? error.message : 'Failed to fetch my WhatsApp permissions' 
        },
        data: undefined
      };
    }
  },

  /**
   * GET /wapermission/user/:userId - get WhatsApp permissions by user ID
   */
  async getPermissionsByUserId(userId: number): Promise<ApiResponse<WAPermissionByUserResponse>> {
    try {
      const response = await apiClient.get<WAPermissionByUserResponse>(`/wapermission/user/${userId}`);
      
      if (response.success && response.data) {
        return response;
      } else {
        return {
          success: false,
          error: { 
            error: 'user_permissions_fetch_failed',
            message: response.error?.message || 'Failed to fetch user WhatsApp permissions' 
          },
          data: undefined
        };
      }
    } catch (error) {
      console.error('❌ Error in getPermissionsByUserId API:', error);
      return {
        success: false,
        error: { 
          error: 'user_permissions_fetch_error',
          message: error instanceof Error ? error.message : 'Failed to fetch user WhatsApp permissions' 
        },
        data: undefined
      };
    }
  },
};
