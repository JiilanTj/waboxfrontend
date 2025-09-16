'use client';

import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  contactId: string;
}

// Dummy data untuk header info
const getContactInfo = (contactId: string) => {
  const contacts = {
    '1': { name: 'Ahmad Rizki', status: 'online', avatar: 'AR' },
    '2': { name: 'Siti Nurhaliza', status: 'terakhir dilihat 5 menit yang lalu', avatar: 'SN' },
    '3': { name: 'Budi Santoso', status: 'online', avatar: 'BS' },
    '4': { name: 'Maya Sari', status: 'mengetik...', avatar: 'MS' },
    '5': { name: 'Andi Wijaya', status: 'terakhir dilihat kemarin', avatar: 'AW' },
  };
  return contacts[contactId as keyof typeof contacts] || { name: 'Unknown', status: 'offline', avatar: 'UN' };
};

export function ChatHeader({ contactId }: ChatHeaderProps) {
  const contact = getContactInfo(contactId);

  return (
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Contact Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700 font-semibold text-sm">
              {contact.avatar}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{contact.name}</h2>
            <p className={`text-xs ${
              contact.status === 'online' ? 'text-green-600' : 
              contact.status.includes('mengetik') ? 'text-blue-600' : 
              'text-gray-500'
            }`}>
              {contact.status}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="Menu">
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}
