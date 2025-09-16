import { 
  CreateSessionResponse,
  GetSessionResponse,
  GetQRCodeResponse,
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
  }
};
