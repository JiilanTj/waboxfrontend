'use client';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';

interface ChatAreaProps {
  contactId: string;
}

export function ChatArea({ contactId }: ChatAreaProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <ChatHeader contactId={contactId} />
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList contactId={contactId} />
      </div>
      
      {/* Message Input */}
      <MessageInput contactId={contactId} />
    </div>
  );
}
