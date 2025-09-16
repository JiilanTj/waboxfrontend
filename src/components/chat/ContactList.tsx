'use client';

import { Search, MoreVertical, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';

interface ContactListProps {
  selectedContact: string | null;
  onSelectContact: (contactId: string) => void;
  whatsappId: string;
}

// Helper function untuk format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 168) { // 1 week
    return date.toLocaleDateString('id-ID', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }
};

// Helper function untuk generate avatar
const generateAvatar = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export function ContactList({ selectedContact, onSelectContact, whatsappId }: ContactListProps) {
  // Use our new useChat hook with polling enabled
  const {
    data: chats,
    isLoading,
    error,
    pagination,
    refresh,
    loadMore,
    isPollingEnabled,
    startPolling,
    stopPolling,
    markAsRead
  } = useChat({
    whatsappNumberId: parseInt(whatsappId),
    limit: 50,
    offset: 0,
    autoFetch: true,
    enablePolling: true, // Enable 5-second polling
    pollingInterval: 5000
  });

  // Debug: Log component state changes
  console.log('🎯 ContactList render:', {
    chatsLength: chats.length,
    isLoading,
    error,
    isPolling: isPollingEnabled,
    whatsappId
  });

  // Handle chat selection and mark as read
  const handleSelectContact = async (chatId: string) => {
    console.log('📖 Selecting chat and marking as read:', chatId);
    
    // First, select the contact
    onSelectContact(chatId);
    
    // Then, mark the chat as read (no need to await as it updates local state)
    markAsRead(chatId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {whatsappId.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-gray-900">WhatsApp Business</h1>
                <div className={`w-2 h-2 rounded-full ${
                  isPollingEnabled ? 'bg-green-500' : 'bg-gray-400'
                }`} title={isPollingEnabled ? 'Polling active' : 'Polling inactive'} />
              </div>
              <p className="text-xs text-gray-500">
                ID: {whatsappId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refresh}
              disabled={isLoading}
              title="Manual refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={isPollingEnabled ? stopPolling : startPolling}
              title={isPollingEnabled ? "Stop auto-refresh" : "Start auto-refresh"}
              className={isPollingEnabled ? "text-green-600" : "text-gray-400"}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari atau mulai chat baru"
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isLoading && chats.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading chats...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && chats.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No chats found</p>
              <p className="text-xs text-gray-400">Start a conversation to see it here</p>
            </div>
          </div>
        )}

        {/* Chat List */}
        {chats.map((chat) => {
          console.log('🎯 Rendering chat:', chat);
          return (
            <div
              key={chat.id}
              onClick={() => handleSelectContact(chat.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                selectedContact === chat.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
              }`}
            >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-semibold text-sm">
                  {generateAvatar(chat.contactName)}
                </span>
              </div>
              {/* Online indicator could be added here if available from backend */}
            </div>

            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {chat.contactName}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTimestamp(chat.lastMessageTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </span>
                )}
              </div>
              {/* Additional info */}
              <div className="flex items-center gap-2 mt-1">
                {chat.isPinned && (
                  <span className="text-xs text-yellow-600">📌</span>
                )}
                {chat.isGroup && (
                  <span className="text-xs text-blue-600">👥 {chat.groupName}</span>
                )}
                {chat.isArchived && (
                  <span className="text-xs text-gray-400">📁</span>
                )}
              </div>
            </div>
          </div>
          );
        })}

        {/* Load More Button */}
        {pagination && pagination.offset + pagination.limit < pagination.total && (
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                `Load More (${pagination.total - pagination.offset - pagination.limit} remaining)`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
