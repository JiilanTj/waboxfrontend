'use client';

import { useState } from 'react';
import { Send, Paperclip, Smile, Mic, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMessage } from '@/hooks/useMessage';
import { SendMessageResponse } from '@/lib/types/message';

interface MessageInputProps {
  contactId: string;
  sessionId?: string; // 🆕 Add sessionId prop
  contactNumber?: string; // 🆕 Add contactNumber prop
}

export function MessageInput({ contactId, sessionId, contactNumber }: MessageInputProps) {
  const [message, setMessage] = useState('');

  // 🆕 Use the message hook to get sendMessage function and contact data
  const { 
    sendMessage, 
    isSending, 
    sendError 
  } = useMessage({
    chatId: contactId,
    sessionId: sessionId,
    autoFetch: false, // We don't need to fetch messages here, just send
    enablePolling: false
  });

  const handleSend = async () => {
    if (message.trim() && sessionId && contactNumber) {
      console.log('📤 Sending message to', contactNumber, ':', message);
      console.log('📤 Session ID:', sessionId);
      console.log('📤 Contact number:', contactNumber);
      
      try {
        const result = await sendMessage(contactNumber, message);
        
        console.log('📤 Send result type:', typeof result);
        console.log('📤 Send result:', result);
        
        // Handle undefined result
        if (!result) {
          console.error('❌ Failed to send message: No result returned from sendMessage');
          return;
        }
        
        if (result.success) {
          setMessage(''); // Clear input on successful send
          const successResult = result as SendMessageResponse;
          console.log('✅ Message sent successfully:', successResult.data?.messageId || 'Success');
        } else {
          const errorResult = result as { success: boolean; error: { error: string; message: string; }; };
          const errorMessage = errorResult.error?.message || 'Unknown error occurred';
          console.error('❌ Failed to send message:', errorMessage);
        }
      } catch (error) {
        console.error('💥 Error sending message:', error);
        console.error('💥 Error type:', typeof error);
        console.error('💥 Error details:', error instanceof Error ? error.message : String(error));
      }
    } else {
      if (!sessionId) {
        console.warn('⚠️ SessionId is required to send messages');
        console.warn('⚠️ Current sessionId:', sessionId);
      }
      if (!contactNumber) {
        console.warn('⚠️ Contact number is required to send messages');
        console.warn('⚠️ Current contactNumber:', contactNumber);
      }
      if (!message.trim()) {
        console.warn('⚠️ Message content is required');
        console.warn('⚠️ Current message:', message);
      }
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
      {/* 🆕 Show send error if any */}
      {sendError && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Gagal mengirim pesan: {sendError}</span>
        </div>
      )}

      {/* 🆕 Show warning if no sessionId (not connected) */}
      {!sessionId && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm flex items-center gap-2">
          <div className="w-4 h-4">⚠️</div>
          <span>WhatsApp belum terhubung. Tidak dapat mengirim pesan.</span>
        </div>
      )}
      
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-shrink-0"
          disabled={!sessionId}
        >
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
                placeholder={
                  !sessionId ? "WhatsApp belum terhubung" :
                  !contactNumber ? "Contact number diperlukan untuk mengirim pesan" :
                  "Ketik pesan"
                } // 🆕 Updated placeholder
                disabled={isSending || !sessionId || !contactNumber} // 🆕 Disable when sending or missing requirements
                className="w-full px-3 py-2 resize-none border-none outline-none rounded-lg max-h-20 min-h-[40px] disabled:bg-gray-100 disabled:text-gray-400"
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
              disabled={!sessionId}
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Send Button or Mic */}
        {message.trim() ? (
          <Button 
            onClick={handleSend}
            disabled={isSending || !sessionId || !contactNumber} // 🆕 Disable when sending or no sessionId
            className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 p-0 flex-shrink-0 disabled:opacity-50"
            title={!sessionId ? "WhatsApp belum terhubung" : !contactNumber ? "Contact number diperlukan" : "Kirim pesan"}
          >
            {isSending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-shrink-0 text-gray-600 rounded-full w-10 h-10 p-0"
            disabled={!sessionId}
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
