'use client';

import { useState, useEffect } from 'react';
import { ContactList } from '@/components/chat/ContactList';
import { ChatArea } from '@/components/chat/ChatArea';
import { useChat } from '@/hooks/useChat';
import { useWhatsAppSession } from '@/hooks/useWhatsAppSession';
import { Chat } from '@/lib/types/chat';

interface ChatLayoutProps {
  whatsappId: string;
}

export function ChatLayout({ whatsappId }: ChatLayoutProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  
  // Get WhatsApp sessions to find the correct sessionId
  const { allSessions, getAllSessions } = useWhatsAppSession();
  
  // Get chat list to find selected chat data - using our useChat hook
  const { data: chats } = useChat({
    whatsappNumberId: parseInt(whatsappId),
    limit: 50,
    offset: 0,
    autoFetch: true,
    enablePolling: false // Let ContactList handle the polling
  });

  // Find selected chat data
  const selectedChat: Chat | null = selectedContact 
    ? chats.find(chat => chat.id === selectedContact) || null 
    : null;

  // 🆕 Find the correct sessionId from WhatsApp sessions
  const whatsappSession = allSessions.find(session => 
    session.whatsappNumberId === parseInt(whatsappId) && 
    session.status === 'CONNECTED'
  );
  
  const sessionId = whatsappSession?.id || undefined;
  
  console.log('🔍 ChatLayout session lookup:', {
    whatsappId: parseInt(whatsappId),
    foundSession: whatsappSession,
    sessionId: sessionId,
    allSessions: allSessions
  });

  // Load sessions if not loaded yet
  useEffect(() => {
    if (allSessions.length === 0) {
      getAllSessions();
    }
  }, [allSessions.length, getAllSessions]);

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Show warning if no connected session */}
      {!sessionId && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-200 px-4 py-3 z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-yellow-600">⚠️</div>
            <span className="text-yellow-800 text-sm font-medium">
              WhatsApp belum terhubung. Silakan hubungkan WhatsApp terlebih dahulu untuk dapat mengirim pesan.
            </span>
          </div>
        </div>
      )}
      
      {/* Sidebar - Contact List - Hidden on mobile when chat is selected */}
      <div className={`bg-white border-r border-gray-300 flex flex-col transition-all duration-300 ${
        selectedContact ? 'hidden lg:flex lg:w-1/3' : 'w-full lg:w-1/3'
      } ${!sessionId ? 'pt-16' : ''}`}>
        <ContactList 
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          whatsappId={whatsappId}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${
        selectedContact ? 'w-full lg:flex-1' : 'hidden lg:flex lg:flex-1'
      } ${!sessionId ? 'pt-16' : ''}`}>
        {selectedContact && selectedChat ? (
          <ChatArea 
            chat={selectedChat} 
            sessionId={sessionId} // 🆕 Pass sessionId (will be undefined if no connection)
            onBack={() => setSelectedContact(null)} // For mobile back button
          />
        ) : (
          <div className="flex-1 bg-gray-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-green-600" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM8.53 7.33c.16 0 .31 0 .45.01.14 0 .32-.05.5.38.18.44.61 1.49.67 1.6.06.11.1.26.02.42-.08.16-.12.26-.23.4-.11.14-.23.31-.33.42-.11.1-.22.21-.1.41.12.2.54.89 1.15 1.44.78.71 1.44 1.02 1.64 1.11.2.09.31.08.42-.05.11-.13.48-.56.61-.75.13-.2.25-.17.42-.1.17.06 1.07.5 1.25.59.18.09.3.14.34.21.04.08.04.45-.1.88-.14.43-.81.85-1.72.91-.47.03-.97-.01-1.57-.36-.47-.27-1.34-.52-2.29-1.87-1.18-1.68-1.46-4.08-.77-5.63.35-.78.97-1.29 1.32-1.29z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-medium text-gray-700 mb-2">
                  WhatsApp Web
                </h2>
                <p className="text-gray-500 text-sm">
                  Pilih kontak untuk memulai percakapan
                </p>
                {!sessionId && (
                  <p className="text-yellow-600 text-sm mt-2">
                    ⚠️ WhatsApp belum terhubung
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
