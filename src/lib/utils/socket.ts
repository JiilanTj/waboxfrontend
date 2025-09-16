'use client';

import io from 'socket.io-client';
import { SocketChatListData } from '@/lib/types/chat';

type SocketType = ReturnType<typeof io>;
type ConnectionCallback = (connected: boolean) => void;

class SocketService {
  private socket: SocketType | null = null;
  private static instance: SocketService;
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 2000; // Start with 2 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private lastUrl = '';
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    return this.connectionStatus;
  }

  onConnectionChange(callback: ConnectionCallback): void {
    this.connectionCallbacks.add(callback);
  }

  offConnectionChange(callback: ConnectionCallback): void {
    this.connectionCallbacks.delete(callback);
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  private startReconnection(): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.isReconnecting = true;
    this.connectionStatus = 'connecting';
    this.notifyConnectionChange(false);

    console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.isReconnecting = false;
      
      // Exponential backoff: 2s, 4s, 8s, 16s, max 30s
      this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000);
      
      this.connect(this.lastUrl);
    }, this.reconnectInterval);
  }

  private stopReconnection(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isReconnecting = false;
  }

  connect(url: string = 'http://localhost:5000'): SocketType {
    this.lastUrl = url;

    // If already connected and stable, return existing connection
    if (this.socket?.connected) {
      return this.socket;
    }

    // Clean up existing socket if any
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('No auth token found. Socket connection may fail.');
      this.connectionStatus = 'error';
      this.notifyConnectionChange(false);
      return this.socket!;
    }

    this.connectionStatus = 'connecting';
    this.notifyConnectionChange(false);
    
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
      timeout: 10000,
      forceNew: false,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket?.id);
      console.log('🔑 Auth token being sent:', token ? 'Token exists' : 'No token');
      
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.reconnectInterval = 2000; // Reset interval
      this.stopReconnection();
      this.notifyConnectionChange(true);
    });

    // Connection lost
    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket.IO disconnected:', reason);
      this.connectionStatus = 'disconnected';
      this.notifyConnectionChange(false);

      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected us, don't auto-reconnect
        console.log('🛑 Server disconnected us, not auto-reconnecting');
      } else {
        // Network issues, try to reconnect
        console.log('🔄 Starting auto-reconnect...');
        this.startReconnection();
      }
    });

    // Connection errors
    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      this.connectionStatus = 'error';
      this.notifyConnectionChange(false);

      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        console.error('🔐 Authentication failed - token may be invalid');
        // Don't auto-reconnect on auth errors
        this.stopReconnection();
      } else {
        // Network or other errors, try to reconnect
        this.startReconnection();
      }
    });

    // Authentication errors
    this.socket.on('auth_error', (error: unknown) => {
      console.error('🔐 Socket.IO auth error:', error);
      this.connectionStatus = 'error';
      this.notifyConnectionChange(false);
      this.stopReconnection();
    });

    // Reconnection attempts
    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Reconnect attempt ${attemptNumber}`);
      this.connectionStatus = 'connecting';
      this.notifyConnectionChange(false);
    });

    // Successful reconnection
    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`✅ Reconnected successfully after ${attemptNumber} attempts`);
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.reconnectInterval = 2000;
      this.stopReconnection();
      this.notifyConnectionChange(true);
    });

    // Failed to reconnect
    this.socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after maximum attempts');
      this.connectionStatus = 'error';
      this.notifyConnectionChange(false);
      this.startReconnection(); // Start our custom reconnection
    });

    // Ping/Pong for connection health
    this.socket.on('ping', () => {
      console.log('🏓 Ping from server');
    });

    this.socket.on('pong', (latency: number) => {
      console.log(`🏓 Pong - latency: ${latency}ms`);
    });

    return this.socket;
  }

  disconnect(): void {
    console.log('🛑 Manually disconnecting socket');
    this.stopReconnection();
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connectionStatus = 'disconnected';
    this.notifyConnectionChange(false);
  }

  forceReconnect(): void {
    console.log('🔄 Force reconnecting...');
    this.reconnectAttempts = 0;
    this.reconnectInterval = 2000;
    this.disconnect();
    setTimeout(() => {
      this.connect(this.lastUrl);
    }, 1000);
  }

  updateToken(newToken: string | null): void {
    console.log('🔑 Updating socket token');
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    } else {
      localStorage.removeItem('authToken');
    }
    
    // Reconnect with new token
    this.forceReconnect();
  }

  getSocket(): SocketType | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Enhanced method with retry logic
  private emitWithRetry(event: string, data: unknown, maxRetries = 3): void {
    const attempt = (retryCount = 0) => {
      if (!this.socket?.connected) {
        if (retryCount < maxRetries) {
          console.log(`🔄 Socket not connected, retrying emit ${event} (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => attempt(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          console.warn(`❌ Failed to emit ${event} after ${maxRetries} attempts`);
        }
        return;
      }

      try {
        this.socket.emit(event, data);
        console.log(`✅ Successfully emitted ${event}`);
      } catch (error) {
        console.error(`❌ Error emitting ${event}:`, error);
        if (retryCount < maxRetries) {
          setTimeout(() => attempt(retryCount + 1), 1000);
        }
      }
    };

    attempt();
  }

  // Chat-specific methods with retry logic
  getChatList(params: { whatsappNumberId: number; limit?: number; offset?: number }): void {
    const data = {
      whatsappNumberId: params.whatsappNumberId,
      limit: params.limit || 50,
      offset: params.offset || 0
    };
    
    console.log('📋 Requesting chat list:', data);
    this.emitWithRetry('chat:get-list', data);
  }

  getChatHistory(params: { chatId: string; limit?: number; offset?: number }): void {
    const data = {
      chatId: params.chatId,
      limit: params.limit || 50,
      offset: params.offset || 0
    };

    console.log('💬 Requesting chat history:', data);
    this.emitWithRetry('chat:get-history', data);
  }

  // Event listener methods with better error handling
  onChatList(callback: (data: SocketChatListData) => void): void {
    if (!this.socket) {
      console.warn('Socket not initialized. Please connect first.');
      return;
    }

    const wrappedCallback = (data: SocketChatListData) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in chat list callback:', error);
      }
    };

    this.socket.on('chat:list', wrappedCallback);
  }

  offChatList(): void {
    if (this.socket) {
      this.socket.off('chat:list');
    }
  }

  onChatHistory(callback: (data: unknown) => void): void {
    if (!this.socket) {
      console.warn('Socket not initialized. Please connect first.');
      return;
    }

    const wrappedCallback = (data: unknown) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in chat history callback:', error);
      }
    };

    this.socket.on('chat:history', wrappedCallback);
  }

  offChatHistory(): void {
    if (this.socket) {
      this.socket.off('chat:history');
    }
  }

  // Generic event listeners with error handling
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.socket) {
      console.warn('Socket not initialized. Please connect first.');
      return;
    }

    const wrappedCallback = (data: unknown) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    };

    this.socket.on(event, wrappedCallback);
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
    this.emitWithRetry(event, data);
  }

  // Health check method
  ping(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const startTime = Date.now();
      
      this.socket.emit('ping', startTime, () => {
        const latency = Date.now() - startTime;
        resolve(latency);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, 5000);
    });
  }

  // Connection statistics
  getStats(): {
    connected: boolean;
    reconnectAttempts: number;
    connectionStatus: string;
    socketId: string | undefined;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      connectionStatus: this.connectionStatus,
      socketId: this.socket?.id,
    };
  }
}

export default SocketService;
