'use client';

import io from 'socket.io-client';
import { SocketChatListData } from '@/lib/types/chat';

type SocketType = ReturnType<typeof io>;

class SocketService {
  private socket: SocketType | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(url: string = 'http://localhost:5000'): SocketType {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('No auth token found. Socket connection may fail.');
    }
    
    this.socket = io(url, {
      auth: {
        token: token,
        authorization: `Bearer ${token}`
      },
      transportOptions: {
        polling: {
          extraHeaders: {
            'Authorization': `Bearer ${token}`
          }
        }
      },
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: false,
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket?.id);
      console.log('Auth token being sent:', token ? 'Token exists' : 'No token');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket.IO connection error:', error);
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        console.error('Authentication failed - check if token is valid');
      }
    });

    // Add auth error handler
    this.socket.on('auth_error', (error: unknown) => {
      console.error('Socket.IO auth error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  updateToken(newToken: string | null): void {
    // For socket.io, we need to reconnect with new token
    if (this.socket && newToken) {
      this.disconnect();
      // The next connect call will use the new token from localStorage
    }
  }

  getSocket(): SocketType | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Chat-specific methods
  getChatList(params: { whatsappNumberId: number; limit?: number; offset?: number }): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Please connect first.');
      return;
    }

    this.socket.emit('chat:get-list', {
      whatsappNumberId: params.whatsappNumberId,
      limit: params.limit || 50,
      offset: params.offset || 0
    });
  }

  onChatList(callback: (data: SocketChatListData) => void): void {
    if (!this.socket) {
      console.warn('Socket not initialized. Please connect first.');
      return;
    }

    this.socket.on('chat:list', callback);
  }

  offChatList(): void {
    if (this.socket) {
      this.socket.off('chat:list');
    }
  }

  // Generic event listeners
  on(event: string, callback: (data: unknown) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }
}

export default SocketService;
