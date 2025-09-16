import { apiClient } from '@/lib/utils/api-client';
import { ChatListResponse, ChatListParams } from '@/lib/types/chat';

export const chatApi = {
  /**
   * Get chat list via REST API
   */
  getChatList: async (params: ChatListParams): Promise<ChatListResponse> => {
    const { whatsappNumberId, limit = 50, offset = 0 } = params;
    
    const response = await apiClient.get<ChatListResponse>(
      `/chats/${whatsappNumberId}?limit=${limit}&offset=${offset}`
    );
    
    return response.data as ChatListResponse;
  },
};
