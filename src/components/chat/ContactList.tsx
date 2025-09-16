'use client';

import { Search, MoreVertical, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface ContactListProps {
  selectedContact: string | null;
  onSelectContact: (contactId: string) => void;
  whatsappId: string;
}

// Dummy data untuk demo
const dummyContacts: Contact[] = [
  {
    id: '1',
    name: 'Ahmad Rizki',
    lastMessage: 'Terima kasih atas pelayanannya!',
    timestamp: '15:30',
    avatar: 'AR',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    lastMessage: 'Apakah produk masih tersedia?',
    timestamp: '14:45',
    avatar: 'SN',
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Budi Santoso',
    lastMessage: 'Baik, saya akan transfer sekarang',
    timestamp: '13:20',
    avatar: 'BS',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Maya Sari',
    lastMessage: 'Lokasi toko dimana ya?',
    timestamp: '12:15',
    avatar: 'MS',
    unreadCount: 3,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Andi Wijaya',
    lastMessage: 'Oke, ditunggu konfirmasinya',
    timestamp: 'Kemarin',
    avatar: 'AW',
    isOnline: false,
  },
];

export function ContactList({ selectedContact, onSelectContact, whatsappId }: ContactListProps) {
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
              <h1 className="font-semibold text-gray-900">WhatsApp Business</h1>
              <p className="text-xs text-gray-500">ID: {whatsappId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
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
        {dummyContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact.id)}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
              selectedContact === contact.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
            }`}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-semibold text-sm">
                  {contact.avatar}
                </span>
              </div>
              {contact.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {contact.name}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {contact.timestamp}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {contact.lastMessage}
                </p>
                {contact.unreadCount && (
                  <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {contact.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
