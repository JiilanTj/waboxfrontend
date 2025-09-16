'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';

export default function WhatsAppChatPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <WhatsAppChatContent />
    </AuthGuard>
  );
}

function WhatsAppChatContent() {
  const params = useParams();
  const whatsappId = params.whatsappId as string;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM8.53 7.33c.16 0 .31 0 .45.01.14 0 .32-.05.5.38.18.44.61 1.49.67 1.6.06.11.1.26.02.42-.08.16-.12.26-.23.4-.11.14-.23.31-.33.42-.11.1-.22.21-.1.41.12.2.54.89 1.15 1.44.78.71 1.44 1.02 1.64 1.11.2.09.31.08.42-.05.11-.13.48-.56.61-.75.13-.2.25-.17.42-.1.17.06 1.07.5 1.25.59.18.09.3.14.34.21.04.08.04.45-.1.88-.14.43-.81.85-1.72.91-.47.03-.97-.01-1.57-.36-.47-.27-1.34-.52-2.29-1.87-1.18-1.68-1.46-4.08-.77-5.63.35-.78.97-1.29 1.32-1.29z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            WhatsApp Chat
          </h1>
          <p className="text-gray-600 mb-4">
            Ini placeholder halaman chat WhatsApp
          </p>
          <p className="text-sm text-gray-500">
            WhatsApp ID: {whatsappId}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 max-w-md mx-auto">
          <p className="text-sm text-gray-600 leading-relaxed">
            Halaman ini akan berisi interface chat WhatsApp dengan fitur:
          </p>
          <ul className="text-sm text-gray-600 mt-3 space-y-1 text-left">
            <li>• Daftar kontak/chat</li>
            <li>• Interface kirim pesan</li>
            <li>• History percakapan</li>
            <li>• Upload media</li>
            <li>• Dan fitur chat lainnya</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
