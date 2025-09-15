import { apiClient } from '@/lib/utils/api-client';
import {
  UsersListResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  CreateUserResponse as UpdateUserResponse,
  DeleteUserResponse,
  ApiResponse
} from '@/lib/types';

export const usersApi = {
  /**
   * GET /users - list users with optional pagination params
   */
  async list(params?: { page?: number; limit?: number; search?: string; role?: string; }): Promise<ApiResponse<UsersListResponse>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);

    const qs = query.toString();
    return apiClient.get<UsersListResponse>(`/users${qs ? `?${qs}` : ''}`);
  },

  /**
   * GET /users/:id - get single user
   */
  async get(id: number): Promise<ApiResponse<{ user: UsersListResponse['users'][number] }>> {
    return apiClient.get<{ user: UsersListResponse['users'][number] }>(`/users/${id}`);
  },

  /**
   * POST /users - create user
   */
  async create(payload: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> {
    return apiClient.post<CreateUserResponse>('/users', payload);
  },

  /**
   * PUT /users/:id - update user
   */
  async update(id: number, payload: UpdateUserRequest): Promise<ApiResponse<UpdateUserResponse>> {
    return apiClient.put<UpdateUserResponse>(`/users/${id}`, payload);
  },

  /**
   * DELETE /users/:id - delete user
   */
  async delete(id: number): Promise<ApiResponse<DeleteUserResponse>> {
    return apiClient.delete<DeleteUserResponse>(`/users/${id}`);
  }
};
