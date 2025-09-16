'use client';

import { MoreVertical, Phone, Video, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chat } from '@/lib/types/chat';

interface ChatHeaderProps {
  chat: Chat | null;
  onBack?: () => void; // For mobile back button
}

// Helper function untuk generate avatar dari nama
const generateAvatar = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Helper function untuk format last seen
const formatLastSeen = (lastMessageTime: string) => {
  try {
    const date = new Date(lastMessageTime);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'online';
    } else if (diffInMinutes < 60) {
      return `terakhir dilihat ${Math.floor(diffInMinutes)} menit yang lalu`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `terakhir dilihat ${hours} jam yang lalu`;
    } else {
      return `terakhir dilihat ${date.toLocaleDateString('id-ID')}`;
    }
  } catch {
    return 'offline';
  }
};

export function ChatHeader({ chat, onBack }: ChatHeaderProps) {
  if (!chat) {
    return (
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-semibold text-sm">?</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Select a chat</h2>
              <p className="text-xs text-gray-500">No chat selected</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avatar = generateAvatar(chat.contactName);
  const lastSeen = formatLastSeen(chat.lastMessageTime);

  return (
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Contact Info */}
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700 font-semibold text-sm">
              {avatar}
            </span>
          </div>
          
          {/* Contact Details */}
          <div>
            <h2 className="font-semibold text-gray-900">
              {chat.isGroup ? (chat.groupName || chat.contactName) : chat.contactName}
            </h2>
            <div className="flex items-center gap-2">
              {chat.isGroup && (
                <span className="text-xs text-gray-500">👥</span>
              )}
              <p className={`text-xs ${
                lastSeen === 'online' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {lastSeen}
              </p>
              {chat.isPinned && (
                <span className="text-xs text-yellow-600" title="Pinned">📌</span>
              )}
            </div>
            {/* Contact Number */}
            <p className="text-xs text-gray-400">
              {chat.contactNumber}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" title="Search in conversation">
            <Search className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" title="Voice call">
            <Phone className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" title="Video call">
            <Video className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" title="Menu">
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
