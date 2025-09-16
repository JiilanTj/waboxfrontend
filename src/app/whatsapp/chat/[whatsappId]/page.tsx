'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppChatPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <WhatsAppChatContent />
    </AuthGuard>
  );
}

function WhatsAppChatContent() {
  const params = useParams();
  const whatsappId = params?.whatsappId as string;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center space-y-6 p-8">
        <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-lg">
          <MessageCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Chat WhatsApp
          </h1>
          <p className="text-gray-600">
            Ini placeholder halaman chat WhatsApp
          </p>
          <div className="text-sm text-gray-500 bg-gray-100 rounded-lg p-4">
            <p>WhatsApp ID: <span className="font-mono font-semibold">{whatsappId}</span></p>
            <p className="mt-2 text-xs">
              Halaman ini akan dikembangkan untuk menampilkan interface chat WhatsApp
            </p>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
          >
            Tutup Tab
          </button>
        </div>
      </div>
    </div>
  );
}
