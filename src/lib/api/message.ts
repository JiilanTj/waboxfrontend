import { apiClient } from '@/lib/utils/api-client';
import { ChatHistoryResponse, ChatHistoryParams } from '@/lib/types/message';

export const messageApi = {
  /**
   * Get chat history via REST API
   */
  getChatHistory: async (params: ChatHistoryParams): Promise<ChatHistoryResponse> => {
    const { chatId, limit = 50, offset = 0 } = params;
    
    const response = await apiClient.get<ChatHistoryResponse>(
      `/chats/${chatId}/messages?limit=${limit}&offset=${offset}`
    );
    
    return response.data as ChatHistoryResponse;
  },
};
