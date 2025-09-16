'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { ChatLayout } from '@/components/chat';

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

  return <ChatLayout whatsappId={whatsappId} />;
}
