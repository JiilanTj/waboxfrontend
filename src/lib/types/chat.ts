export interface Chat {
  id: string;
  contactName: string;
  contactNumber: string;
  contactJid: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isGroup: boolean;
  groupName: string | null;
  isPinned: boolean;
  isArchived: boolean;
}

export interface ChatListResponse {
  success: boolean;
  message: string;
  data: Chat[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ChatListParams {
  whatsappNumberId: number;
  limit?: number;
  offset?: number;
}

export interface SocketChatListData {
  chats: Chat[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}
