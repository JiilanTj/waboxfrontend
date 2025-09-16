'use client';

import { useState } from 'react';
import { ContactList } from '@/components/chat/ContactList';
import { ChatArea } from '@/components/chat/ChatArea';

interface ChatLayoutProps {
  whatsappId: string;
}

export function ChatLayout({ whatsappId }: ChatLayoutProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>('1');

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar - Contact List - Hidden on mobile when chat is selected */}
      <div className={`bg-white border-r border-gray-300 flex flex-col transition-all duration-300 ${
        selectedContact ? 'hidden lg:flex lg:w-1/3' : 'w-full lg:w-1/3'
      }`}>
        <ContactList 
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          whatsappId={whatsappId}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${
        selectedContact ? 'w-full lg:flex-1' : 'hidden lg:flex lg:flex-1'
      }`}>
        {selectedContact ? (
          <ChatArea contactId={selectedContact} />
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
