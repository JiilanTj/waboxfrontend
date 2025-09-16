export interface ChatMessage {
  id: string;
  messageId: string;
  fromJid: string;
  fromNumber: string;
  fromName: string | null;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER';
  mediaUrl: string | null;
  mediaCaption: string | null;
  quotedMessageId: string | null;
  quotedContent: string | null;
  isFromMe: boolean;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'PENDING';
  timestamp: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  message: string;
  data: ChatMessage[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ChatHistoryParams {
  chatId: string;
  limit?: number;
  offset?: number;
}

export interface SocketChatHistoryData {
  messages: ChatMessage[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}
