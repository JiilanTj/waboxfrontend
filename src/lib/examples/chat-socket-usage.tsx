// Contoh penggunaan Socket.IO Chat List Service
// File ini hanya untuk dokumentasi dan testing

import SocketService from '@/lib/utils/socket';
import { useChatList } from '@/hooks/useChatList';

// === 1. CARA MENGGUNAKAN SOCKET SERVICE LANGSUNG ===

const socketService = SocketService.getInstance();

// Connect to socket
socketService.connect('http://localhost:5000');

// Listen for chat list updates
socketService.onChatList((data) => {
  console.log('Real-time chat list update:', data);
  // Update UI dengan data.chats
});

// Request chat list
socketService.getChatList({
  whatsappNumberId: 1,
  limit: 50,
  offset: 0
});

// Disconnect when done
socketService.disconnect();

// === 2. CARA MENGGUNAKAN HOOK (RECOMMENDED) ===

// Dalam React component:
function ChatListComponent({ whatsappId }: { whatsappId: number }) {
  const {
    chats,
    isLoading,
    error,
    pagination,
    refetch,
    loadMore,
    isConnected
  } = useChatList({
    whatsappNumberId: whatsappId,
    limit: 50,
    offset: 0
  });

  if (isLoading) return <div>Loading chats...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      
      {chats.map((chat) => (
        <div key={chat.id} className="chat-item">
          <h4>{chat.contactName}</h4>
          <p>{chat.lastMessage}</p>
          <small>{chat.lastMessageTime}</small>
          {chat.unreadCount > 0 && (
            <span className="unread-badge">{chat.unreadCount}</span>
          )}
        </div>
      ))}
      
      {pagination && pagination.offset + pagination.limit < pagination.total && (
        <button onClick={loadMore}>Load More</button>
      )}
      
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

// === 3. INTEGRASI DENGAN CONTACT LIST COMPONENT ===

// Update ContactList component untuk menggunakan real data
export { ChatListComponent };
