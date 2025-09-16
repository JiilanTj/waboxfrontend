import { apiClient } from '@/lib/utils/api-client';
import { ChatListResponse, ChatListParams, MarkAsReadResponse } from '@/lib/types/chat';

export const chatApi = {
  /**
   * Get chat list via REST API
   */
  getChatList: async (params: ChatListParams): Promise<ChatListResponse> => {
    try {
      const { whatsappNumberId, limit = 50, offset = 0 } = params;
      
      const response = await apiClient.get<ChatListResponse>(
        `/chats/${whatsappNumberId}?limit=${limit}&offset=${offset}`
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return error response in expected format
        return {
          success: false,
          message: response.error?.message || 'Failed to fetch chat list',
          data: [],
          pagination: { limit, offset, total: 0 }
        };
      }
    } catch (error) {
      console.error('❌ Error in getChatList API:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch chat list',
        data: [],
        pagination: { limit: params.limit || 50, offset: params.offset || 0, total: 0 }
      };
    }
  },

  /**
   * Mark chat as read via REST API
   */
  markAsRead: async (chatId: string): Promise<MarkAsReadResponse> => {
    try {
      const response = await apiClient.patch<MarkAsReadResponse>(
        `/chats/${chatId}/read`
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Return error response in expected format
        return {
          success: false,
          message: response.error?.message || 'Failed to mark chat as read'
        };
      }
    } catch (error) {
      console.error('❌ Error in markAsRead API:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark chat as read'
      };
    }
  },
};
