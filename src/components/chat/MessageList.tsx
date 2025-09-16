'use client';

import { Check, CheckCheck, AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useRestChatHistory } from '@/hooks/useRestChatHistory';
import { ChatMessage } from '@/lib/types/message';

interface MessageListProps {
  contactId: string;
}

const MessageStatus = ({ status }: { status: ChatMessage['status'] }) => {
  switch (status) {
    case 'SENT':
      return <Check className="w-4 h-4 text-gray-400" />;
    case 'DELIVERED':
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    case 'READ':
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    case 'PENDING':
      return <Check className="w-4 h-4 text-gray-300" />;
    default:
      return null;
  }
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return timestamp; // Return original if invalid
    }
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      // Show only time if today
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      // Show date and time if not today
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  } catch (error) {
    console.warn('Error formatting timestamp:', timestamp, error);
    return timestamp;
  }
};

export function MessageList({ contactId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use REST API with 5-second polling for chat history
  const { 
    messages, 
    isLoading, 
    error, 
    refetch, 
    loadMore, 
    pagination,
    isPolling 
  } = useRestChatHistory({
    chatId: contactId,
    limit: 50
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connection status indicator
  const ConnectionStatus = () => {
    return null; // No connection status needed for REST API with polling
  };

  return (
    <div className="flex flex-col h-full">
      <ConnectionStatus />
      
      {/* Polling indicator */}
      {isPolling && (
        <div className="text-center py-1 bg-green-50 border-b border-green-200">
          <span className="text-xs text-green-700">🔄 Auto-refreshing messages</span>
        </div>
      )}
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#e5ddd5'
        }}
      >
        {/* Loading state */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
              <span>Memuat pesan...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div className="text-red-600">
                <p className="font-medium">Gagal memuat pesan</p>
                <p className="text-sm text-red-500 mt-1">{error}</p>
              </div>
              <button 
                onClick={refetch}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Belum ada pesan. Mulai percakapan!</p>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <>
            {/* Load more button for pagination */}
            {pagination && pagination.offset + pagination.limit < pagination.total && (
              <div className="flex justify-center py-2">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Memuat...' : 'Muat pesan lama'}
                </button>
              </div>
            )}

            {messages.map((message: ChatMessage) => (
              <div
                key={message.id}
                className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                    message.isFromMe
                      ? 'bg-green-500 text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none'
                  }`}
                >
                  {/* Message content */}
                  <div className="break-words">
                    {message.type === 'TEXT' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="text-sm">
                        {/* Handle media messages */}
                        {message.mediaUrl && (
                          <div className="mb-2">
                            {message.type === 'IMAGE' && (
                              <div className="relative max-w-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={message.mediaUrl} 
                                  alt="Image message" 
                                  className="max-w-full rounded"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            {message.type === 'VIDEO' && (
                              <video 
                                src={message.mediaUrl} 
                                controls 
                                className="max-w-full rounded"
                              />
                            )}
                            {message.type === 'AUDIO' && (
                              <audio 
                                src={message.mediaUrl} 
                                controls 
                                className="max-w-full"
                              />
                            )}
                            {(message.type === 'DOCUMENT' || message.type === 'STICKER') && (
                              <a 
                                href={message.mediaUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                📎 {message.type === 'DOCUMENT' ? 'Dokumen' : 'Stiker'}
                              </a>
                            )}
                          </div>
                        )}
                        {message.mediaCaption && (
                          <p className="whitespace-pre-wrap">{message.mediaCaption}</p>
                        )}
                        {!message.mediaCaption && message.content && (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp and status */}
                  <div className={`flex items-center gap-1 mt-1 ${
                    message.isFromMe ? 'justify-end' : 'justify-end'
                  }`}>
                    <span className={`text-xs ${
                      message.isFromMe ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.isFromMe && <MessageStatus status={message.status} />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
