'use client';

import { Check, CheckCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOutgoing: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface MessageListProps {
  contactId: string;
}

// Dummy messages berdasarkan contact
const getMessages = (contactId: string): Message[] => {
  const messageGroups = {
    '1': [
      {
        id: '1',
        text: 'Halo, apakah produk masih tersedia?',
        timestamp: '14:20',
        isOutgoing: false,
        status: 'read' as const,
      },
      {
        id: '2',
        text: 'Halo! Ya masih tersedia. Produk yang mana yang Anda cari?',
        timestamp: '14:22',
        isOutgoing: true,
        status: 'read' as const,
      },
      {
        id: '3',
        text: 'Yang warna biru ukuran L',
        timestamp: '14:25',
        isOutgoing: false,
        status: 'read' as const,
      },
      {
        id: '4',
        text: 'Oke, stok masih ada. Harga Rp 150.000. Apakah mau langsung pesan?',
        timestamp: '14:26',
        isOutgoing: true,
        status: 'read' as const,
      },
      {
        id: '5',
        text: 'Boleh, saya transfer sekarang ya',
        timestamp: '15:28',
        isOutgoing: false,
        status: 'delivered' as const,
      },
      {
        id: '6',
        text: 'Terima kasih atas pelayanannya!',
        timestamp: '15:30',
        isOutgoing: false,
        status: 'sent' as const,
      },
    ],
    '2': [
      {
        id: '1',
        text: 'Selamat pagi, saya ingin tanya produk',
        timestamp: '09:15',
        isOutgoing: false,
        status: 'read' as const,
      },
      {
        id: '2',
        text: 'Selamat pagi! Silakan, produk apa yang ingin ditanyakan?',
        timestamp: '09:16',
        isOutgoing: true,
        status: 'read' as const,
      },
      {
        id: '3',
        text: 'Apakah produk masih tersedia?',
        timestamp: '14:45',
        isOutgoing: false,
        status: 'sent' as const,
      },
    ],
  };
  return messageGroups[contactId as keyof typeof messageGroups] || [];
};

const MessageStatus = ({ status }: { status: Message['status'] }) => {
  switch (status) {
    case 'sent':
      return <Check className="w-4 h-4 text-gray-400" />;
    case 'delivered':
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    case 'read':
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    default:
      return null;
  }
};

export function MessageList({ contactId }: MessageListProps) {
  const messages = getMessages(contactId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundColor: '#e5ddd5'
      }}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Belum ada pesan. Mulai percakapan!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                  message.isOutgoing
                    ? 'bg-green-500 text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${
                  message.isOutgoing ? 'justify-end' : 'justify-end'
                }`}>
                  <span className={`text-xs ${
                    message.isOutgoing ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </span>
                  {message.isOutgoing && <MessageStatus status={message.status} />}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
