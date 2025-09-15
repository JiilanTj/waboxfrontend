import { 
  WhatsAppListResponse,
  WhatsAppResponse,
  CreateWhatsAppRequest,
  CreateWhatsAppResponse,
  UpdateWhatsAppRequest,
  WhatsAppDeleteResponse,
  WhatsAppToggleStatusResponse,
  WhatsAppFilters,
  ApiResponse
} from '@/lib/types';
import { apiClient } from '@/lib/utils/api-client';

export const whatsappApi = {
  /**
   * GET /whatsapp - list whatsapp numbers with optional pagination params
   */
  async getWhatsAppNumbers(filters: WhatsAppFilters = {}): Promise<ApiResponse<WhatsAppListResponse>> {
    const query = new URLSearchParams();
    if (filters.page !== undefined) query.set('page', String(filters.page));
    if (filters.limit !== undefined) query.set('limit', String(filters.limit));
    if (filters.search) query.set('search', filters.search);
    if (filters.isActive !== undefined) query.set('isActive', String(filters.isActive));

    const qs = query.toString();
    return apiClient.get<WhatsAppListResponse>(`/whatsapp${qs ? `?${qs}` : ''}`);
  },

  /**
   * GET /whatsapp/:id - get single whatsapp number
   */
  async getWhatsAppNumber(id: number): Promise<ApiResponse<WhatsAppResponse>> {
    return apiClient.get<WhatsAppResponse>(`/whatsapp/${id}`);
  },

  /**
   * POST /whatsapp - create whatsapp number
   */
  async createWhatsAppNumber(payload: CreateWhatsAppRequest): Promise<ApiResponse<CreateWhatsAppResponse>> {
    return apiClient.post<CreateWhatsAppResponse>('/whatsapp', payload);
  },

  /**
   * PUT /whatsapp/:id - update whatsapp number
   */
  async updateWhatsAppNumber(id: number, payload: UpdateWhatsAppRequest): Promise<ApiResponse<CreateWhatsAppResponse>> {
    return apiClient.put<CreateWhatsAppResponse>(`/whatsapp/${id}`, payload);
  },

  /**
   * DELETE /whatsapp/:id - delete whatsapp number
   */
  async deleteWhatsAppNumber(id: number): Promise<ApiResponse<WhatsAppDeleteResponse>> {
    return apiClient.delete<WhatsAppDeleteResponse>(`/whatsapp/${id}`);
  },

  /**
   * PATCH /whatsapp/:id/toggle-status - toggle whatsapp number status
   */
  async toggleWhatsAppStatus(id: number): Promise<ApiResponse<WhatsAppToggleStatusResponse>> {
    return apiClient.patch<WhatsAppToggleStatusResponse>(`/whatsapp/${id}/toggle-status`);
  }
};
