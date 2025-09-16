'use client';

import { useState } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  contactId: string;
}

export function MessageInput({ contactId }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement actual message sending
      console.log('Sending message to', contactId, ':', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        <Button variant="ghost" size="sm" className="flex-shrink-0">
          <Paperclip className="w-5 h-5 text-gray-600" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <div className="flex items-end bg-white rounded-lg border border-gray-200 focus-within:border-green-500">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan"
                className="w-full px-3 py-2 resize-none border-none outline-none rounded-lg max-h-20 min-h-[40px]"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '40px',
                  maxHeight: '80px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-shrink-0 mr-2"
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Send Button or Mic */}
        {message.trim() ? (
          <Button 
            onClick={handleSend}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 p-0 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-shrink-0 text-gray-600 rounded-full w-10 h-10 p-0"
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
