import { 
  CreateSessionResponse,
  GetSessionResponse,
  GetQRCodeResponse,
  GetAllSessionsResponse,
  ApiResponse
} from '@/lib/types';
import { apiClient } from '@/lib/utils/api-client';

export const whatsappSessionApi = {
  /**
   * POST /sessions/:whatsappNumberId - create or update session for whatsapp number
   */
  async createSession(whatsappNumberId: number): Promise<ApiResponse<CreateSessionResponse>> {
    return apiClient.post<CreateSessionResponse>(`/sessions/${whatsappNumberId}`);
  },

  /**
   * GET /sessions/:whatsappNumberId - get session by whatsapp number id
   */
  async getSession(whatsappNumberId: number): Promise<ApiResponse<GetSessionResponse>> {
    return apiClient.get<GetSessionResponse>(`/sessions/${whatsappNumberId}`);
  },

  /**
   * GET /sessions/:sessionId/qr - get QR code for session
   */
  async getQRCode(sessionId: string): Promise<ApiResponse<GetQRCodeResponse>> {
    return apiClient.get<GetQRCodeResponse>(`/sessions/${sessionId}/qr`);
  },

  /**
   * GET /sessions - get all sessions with pagination
   */
  async getAllSessions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<GetAllSessionsResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    
    const queryString = searchParams.toString();
    return apiClient.get<GetAllSessionsResponse>(`/sessions${queryString ? `?${queryString}` : ''}`);
  }
};
