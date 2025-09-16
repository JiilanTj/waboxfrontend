'use client';

/**
 * Debug utilities untuk troubleshooting Socket.IO authentication
 */

export const debugSocketAuth = () => {
  const token = localStorage.getItem('authToken');
  
  console.group('🔍 Socket.IO Auth Debug');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length || 0);
  console.log('Token starts with Bearer:', token?.startsWith('Bearer '));
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
  
  // Check if token is JWT format
  if (token) {
    try {
      const parts = token.split('.');
      console.log('Token parts count (should be 3 for JWT):', parts.length);
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload preview:', {
          exp: payload.exp ? new Date(payload.exp * 1000) : 'No expiry',
          iat: payload.iat ? new Date(payload.iat * 1000) : 'No issued time',
          userId: payload.userId || payload.id || 'No user ID found'
        });
        
        // Check if token is expired
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          console.warn('⚠️ Token is EXPIRED!');
        } else {
          console.log('✅ Token is valid (not expired)');
        }
      }
    } catch (e) {
      console.warn('Token is not JWT format or corrupted');
    }
  }
  console.groupEnd();
};

export const testSocketConnection = async () => {
  console.group('🧪 Socket.IO Connection Test');
  
  // Test basic connectivity
  try {
    const response = await fetch('http://localhost:5000/health', { 
      method: 'GET' 
    });
    console.log('Backend health check:', response.status === 200 ? '✅ OK' : '❌ Failed');
  } catch (err) {
    console.error('❌ Backend not reachable:', err);
  }
  
  // Test auth endpoint
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Token verification:', response.status === 200 ? '✅ Valid' : '❌ Invalid');
    } catch (err) {
      console.error('❌ Auth verification failed:', err);
    }
  }
  
  console.groupEnd();
};
