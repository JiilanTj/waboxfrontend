import { apiClient } from '@/lib/utils/api-client';
import { 
  ChatHistoryResponse, 
  ChatHistoryParams, 
  SendMessageResponse, 
  SendMessageParams, 
  SendMessageRequest 
} from '@/lib/types/message';

export const messageApi = {
  /**
   * Get chat history via REST API
   */
  getChatHistory: async (params: ChatHistoryParams): Promise<ChatHistoryResponse> => {
    try {
      const { chatId, limit = 50, offset = 0 } = params;
      
      const response = await apiClient.get<ChatHistoryResponse>(
        `/chats/${chatId}/messages?limit=${limit}&offset=${offset}`
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return error response in expected format
        return {
          success: false,
          message: response.error?.message || 'Failed to fetch chat history',
          data: [],
          pagination: { limit, offset, total: 0 }
        };
      }
    } catch (error) {
      console.error('❌ Error in getChatHistory API:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch chat history',
        data: [],
        pagination: { limit: params.limit || 50, offset: params.offset || 0, total: 0 }
      };
    }
  },

  /**
   * Send message via REST API
   */
  sendMessage: async (params: SendMessageParams): Promise<SendMessageResponse> => {
    try {
      const { sessionId, to, message } = params;
      
      const requestBody: SendMessageRequest = {
        to,
        message
      };
      
      const response = await apiClient.post<SendMessageResponse>(
        `/sessions/${sessionId}/send`,
        requestBody
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return error response in expected format
        return {
          success: false,
          message: response.error?.message || 'Failed to send message',
          data: {
            sessionId: sessionId,
            from: { id: 0, name: '', phoneNumber: '' },
            to: to,
            message: message,
            messageId: '',
            timestamp: new Date().toISOString(),
          }
        };
      }
    } catch (error) {
      console.error('❌ Error in sendMessage API:', error);
      
      // Return a consistent error response
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message',
        data: {
          sessionId: params.sessionId,
          from: { id: 0, name: '', phoneNumber: '' },
          to: params.to,
          message: params.message,
          messageId: '',
          timestamp: new Date().toISOString(),
        }
      };
    }
  },
};
