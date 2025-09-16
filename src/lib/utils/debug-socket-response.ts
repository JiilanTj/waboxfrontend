/**
 * Debug utility untuk testing berbagai format response Socket.IO
 */

export const testSocketResponseFormats = () => {
  console.group('🧪 Testing Socket Response Format Handling');
  
  // Test format 1: { chats: [], pagination: {} }
  const format1 = {
    chats: [
      { id: '1', contactName: 'Test User', lastMessage: 'Hello', unreadCount: 1 }
    ],
    pagination: { limit: 50, offset: 0, total: 1 }
  };
  
  // Test format 2: [chat1, chat2, ...]
  const format2 = [
    { id: '1', contactName: 'Test User', lastMessage: 'Hello', unreadCount: 1 }
  ];
  
  // Test format 3: { data: [], pagination: {} }
  const format3 = {
    data: [
      { id: '1', contactName: 'Test User', lastMessage: 'Hello', unreadCount: 1 }
    ],
    pagination: { limit: 50, offset: 0, total: 1 }
  };
  
  // Test format 4: { chats: [] } (no pagination)
  const format4 = {
    chats: [
      { id: '1', contactName: 'Test User', lastMessage: 'Hello', unreadCount: 1 }
    ]
  };
  
  console.log('Format 1 (expected):', format1);
  console.log('Format 2 (array):', format2);
  console.log('Format 3 (with data key):', format3);
  console.log('Format 4 (no pagination):', format4);
  
  console.groupEnd();
};

export const logSocketEvent = (eventName: string, data: unknown) => {
  console.group(`📡 Socket Event: ${eventName}`);
  console.log('Raw data:', data);
  console.log('Data type:', typeof data);
  console.log('Is array:', Array.isArray(data));
  
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    console.log('Object keys:', Object.keys(obj));
    console.log('Has chats:', 'chats' in obj);
    console.log('Has data:', 'data' in obj);
    console.log('Has pagination:', 'pagination' in obj);
  }
  
  console.groupEnd();
};
