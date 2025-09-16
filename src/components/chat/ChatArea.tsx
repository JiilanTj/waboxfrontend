'use client';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { Chat } from '@/lib/types/chat';

interface ChatAreaProps {
  chat: Chat;
  sessionId?: string; // 🆕 Add sessionId prop  
  onBack?: () => void; // For mobile back button
}

export function ChatArea({ chat, sessionId, onBack }: ChatAreaProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <ChatHeader chat={chat} onBack={onBack} />
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList contactId={chat.id} sessionId={sessionId} />
      </div>
      
      {/* Message Input */}
      <MessageInput 
        contactId={chat.id} 
        sessionId={sessionId}
        contactNumber={chat.contactNumber} // 🆕 Pass contact number
      />
    </div>
  );
}
