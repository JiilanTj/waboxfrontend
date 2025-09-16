'use client';

import { useCallback, useState } from 'react';
import { whatsappSessionApi } from '@/lib/api';
import {
  WhatsAppSession,
} from '@/lib/types';

interface WhatsAppSessionState {
  sessions: Record<number, WhatsAppSession>; // keyed by whatsappNumberId
  qrCodes: Record<string, string>; // keyed by sessionId
  isLoading: Record<number, boolean>; // keyed by whatsappNumberId
  isCreating: Record<number, boolean>; // keyed by whatsappNumberId
  isFetchingQR: Record<string, boolean>; // keyed by sessionId
  isDeleting: Record<string, boolean>; // keyed by sessionId
  errors: Record<number, string>; // keyed by whatsappNumberId
  
  // All sessions data
  allSessions: WhatsAppSession[];
  allSessionsPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  isLoadingAllSessions: boolean;
  allSessionsError: string | null;
}

export function useWhatsAppSession() {
  const [state, setState] = useState<WhatsAppSessionState>({
    sessions: {},
    qrCodes: {},
    isLoading: {},
    isCreating: {},
    isFetchingQR: {},
    isDeleting: {},
    errors: {},
    allSessions: [],
    allSessionsPagination: null,
    isLoadingAllSessions: false,
    allSessionsError: null,
  });

  // Get session for a WhatsApp number
  const getSession = useCallback(async (whatsappNumberId: number) => {
    setState(prev => ({
      ...prev,
      isLoading: { ...prev.isLoading, [whatsappNumberId]: true },
      errors: { ...prev.errors, [whatsappNumberId]: '' }
    }));

    try {
      const response = await whatsappSessionApi.getSession(whatsappNumberId);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          sessions: { 
            ...prev.sessions, 
            [whatsappNumberId]: response.data!.data 
          },
          isLoading: { ...prev.isLoading, [whatsappNumberId]: false }
        }));
      } else {
        setState(prev => ({
          ...prev,
          errors: { 
            ...prev.errors, 
            [whatsappNumberId]: response.error?.message || 'Failed to get session' 
          },
          isLoading: { ...prev.isLoading, [whatsappNumberId]: false }
        }));
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [whatsappNumberId]: errorMessage },
        isLoading: { ...prev.isLoading, [whatsappNumberId]: false }
      }));
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: errorMessage
        }
      };
    }
  }, []);

  // Create or update session for a WhatsApp number
  const createSession = useCallback(async (whatsappNumberId: number) => {
    setState(prev => ({
      ...prev,
      isCreating: { ...prev.isCreating, [whatsappNumberId]: true },
      errors: { ...prev.errors, [whatsappNumberId]: '' }
    }));

    try {
      const response = await whatsappSessionApi.createSession(whatsappNumberId);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          sessions: { 
            ...prev.sessions, 
            [whatsappNumberId]: response.data!.data 
          },
          isCreating: { ...prev.isCreating, [whatsappNumberId]: false }
        }));
      } else {
        setState(prev => ({
          ...prev,
          errors: { 
            ...prev.errors, 
            [whatsappNumberId]: response.error?.message || 'Failed to create session' 
          },
          isCreating: { ...prev.isCreating, [whatsappNumberId]: false }
        }));
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [whatsappNumberId]: errorMessage },
        isCreating: { ...prev.isCreating, [whatsappNumberId]: false }
      }));
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: errorMessage
        }
      };
    }
  }, []);

  // Get QR code for a session
  const getQRCode = useCallback(async (sessionId: string) => {
    setState(prev => ({
      ...prev,
      isFetchingQR: { ...prev.isFetchingQR, [sessionId]: true }
    }));

    try {
      const response = await whatsappSessionApi.getQRCode(sessionId);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          qrCodes: { 
            ...prev.qrCodes, 
            [sessionId]: response.data!.data.qrCode 
          },
          isFetchingQR: { ...prev.isFetchingQR, [sessionId]: false }
        }));
      } else {
        setState(prev => ({
          ...prev,
          isFetchingQR: { ...prev.isFetchingQR, [sessionId]: false }
        }));
      }
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isFetchingQR: { ...prev.isFetchingQR, [sessionId]: false }
      }));
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }, []);

  // Clear session data for a WhatsApp number
  const clearSession = useCallback((whatsappNumberId: number) => {
    setState(prev => {
      const newState = { ...prev };
      delete newState.sessions[whatsappNumberId];
      delete newState.errors[whatsappNumberId];
      delete newState.isLoading[whatsappNumberId];
      delete newState.isCreating[whatsappNumberId];
      
      // Also clear QR codes and deleting state for this session
      const session = prev.sessions[whatsappNumberId];
      if (session?.id) {
        delete newState.qrCodes[session.id];
        delete newState.isFetchingQR[session.id];
        delete newState.isDeleting[session.id];
      }
      
      return newState;
    });
  }, []);

  // Clear QR code for a session
  const clearQRCode = useCallback((sessionId: string) => {
    setState(prev => {
      const newState = { ...prev };
      delete newState.qrCodes[sessionId];
      delete newState.isFetchingQR[sessionId];
      delete newState.isDeleting[sessionId];
      return newState;
    });
  }, []);

  // Get all sessions with pagination and filtering
  const getAllSessions = useCallback(async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    isActive?: boolean;
  }) => {
    setState(prev => ({ 
      ...prev, 
      isLoadingAllSessions: true, 
      allSessionsError: null 
    }));

    try {
      const response = await whatsappSessionApi.getAllSessions(params);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          allSessions: response.data!.data,
          allSessionsPagination: response.data!.pagination,
          isLoadingAllSessions: false,
          allSessionsError: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          allSessions: [],
          allSessionsPagination: null,
          isLoadingAllSessions: false,
          allSessionsError: response.error?.message || 'Failed to fetch sessions',
        }));
      }
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        allSessions: [],
        allSessionsPagination: null,
        isLoadingAllSessions: false,
        allSessionsError: errorMessage,
      }));
      
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: errorMessage
        }
      };
    }
  }, []);

  // Delete session permanently
  const deleteSession = useCallback(async (sessionId: string) => {
    setState(prev => ({
      ...prev,
      isDeleting: { ...prev.isDeleting, [sessionId]: true }
    }));

    try {
      const response = await whatsappSessionApi.deleteSession(sessionId);
      if (response.success) {
        setState(prev => {
          const newState = { ...prev };
          
          // Remove from isDeleting
          delete newState.isDeleting[sessionId];
          
          // Remove QR code for this session
          delete newState.qrCodes[sessionId];
          delete newState.isFetchingQR[sessionId];
          
          // Find and remove session from sessions by sessionId
          Object.keys(newState.sessions).forEach(whatsappNumberId => {
            const session = newState.sessions[Number(whatsappNumberId)];
            if (session?.id === sessionId) {
              delete newState.sessions[Number(whatsappNumberId)];
              delete newState.errors[Number(whatsappNumberId)];
              delete newState.isLoading[Number(whatsappNumberId)];
              delete newState.isCreating[Number(whatsappNumberId)];
            }
          });

          // Remove from allSessions array
          newState.allSessions = newState.allSessions.filter(session => session.id !== sessionId);
          
          return newState;
        });
      } else {
        setState(prev => ({
          ...prev,
          isDeleting: { ...prev.isDeleting, [sessionId]: false }
        }));
      }
      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isDeleting: { ...prev.isDeleting, [sessionId]: false }
      }));
      return {
        success: false,
        error: {
          error: 'NetworkError',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }, []);

  return {
    // Data
    sessions: state.sessions,
    qrCodes: state.qrCodes,
    errors: state.errors,
    allSessions: state.allSessions,
    allSessionsPagination: state.allSessionsPagination,
    isLoadingAllSessions: state.isLoadingAllSessions,
    allSessionsError: state.allSessionsError,
    
    // Actions
    getSession,
    createSession,
    getQRCode,
    clearSession,
    clearQRCode,
    getAllSessions,
    deleteSession,
    
    // Loading states
    isLoading: (whatsappNumberId: number) => state.isLoading[whatsappNumberId] || false,
    isCreating: (whatsappNumberId: number) => state.isCreating[whatsappNumberId] || false,
    isFetchingQR: (sessionId: string) => state.isFetchingQR[sessionId] || false,
    isDeleting: (sessionId: string) => state.isDeleting[sessionId] || false,
    
    // Helper functions
    getSessionByWhatsAppId: (whatsappNumberId: number) => state.sessions[whatsappNumberId],
    getQRCodeBySessionId: (sessionId: string) => state.qrCodes[sessionId],
    getErrorByWhatsAppId: (whatsappNumberId: number) => state.errors[whatsappNumberId] || null,
  };
}
