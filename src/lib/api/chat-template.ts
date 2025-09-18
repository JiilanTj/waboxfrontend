import { apiClient } from '@/lib/utils/api-client';
import {
  ChatTemplateListResponse,
  GetChatTemplateResponse,
  CreateChatTemplateRequest,
  UpdateChatTemplateRequest,
  UpsertChatTemplateResponse,
  DeleteChatTemplateResponse,
  ApiResponse,
} from '@/lib/types';

export const chatTemplateApi = {
  /**
   * GET /chat-templates - list templates with optional pagination, search, and status
   */
  async list(params?: { page?: number; limit?: number; search?: string; isActive?: boolean }): Promise<ApiResponse<ChatTemplateListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.set('page', String(params.page));
    if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));

    const qs = searchParams.toString();
    return apiClient.get<ChatTemplateListResponse>(`/chat-templates${qs ? `?${qs}` : ''}`);
  },

  /**
   * GET /chat-templates/:id - get template by id
   */
  async getById(id: number): Promise<ApiResponse<GetChatTemplateResponse>> {
    return apiClient.get<GetChatTemplateResponse>(`/chat-templates/${id}`);
  },

  /**
   * GET /chat-templates/command/:command - get template by command (e.g., /greet)
   */
  async getByCommand(command: string): Promise<ApiResponse<GetChatTemplateResponse>> {
    const clean = command.startsWith('/') ? command.slice(1) : command;
    const encoded = encodeURIComponent(clean);
    return apiClient.get<GetChatTemplateResponse>(`/chat-templates/by-command/${encoded}`);
  },

  /**
   * POST /chat-templates - create new template
   */
  async create(payload: CreateChatTemplateRequest): Promise<ApiResponse<UpsertChatTemplateResponse>> {
    return apiClient.post<UpsertChatTemplateResponse>('/chat-templates', payload);
  },

  /**
   * PUT /chat-templates/:id - update template
   */
  async update(id: number, payload: UpdateChatTemplateRequest): Promise<ApiResponse<UpsertChatTemplateResponse>> {
    return apiClient.put<UpsertChatTemplateResponse>(`/chat-templates/${id}`, payload);
  },

  /**
   * DELETE /chat-templates/:id - delete template
   */
  async delete(id: number): Promise<ApiResponse<DeleteChatTemplateResponse>> {
    return apiClient.delete<DeleteChatTemplateResponse>(`/chat-templates/${id}`);
  },
};