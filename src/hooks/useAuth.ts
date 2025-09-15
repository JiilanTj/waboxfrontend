'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';
import { User, LoginRequest } from '@/lib/types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Verify token by getting user profile
        const response = await authApi.getProfile();
        
        if (response.success && response.data?.user) {
          setAuthState({
            user: response.data.user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    const response = await authApi.login(credentials);

    if (response.success && response.data) {
      const { user, token } = response.data;
      
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true, data: response.data };
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return { success: false, error: response.error };
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    // Call logout API
    await authApi.logout();

    // Clear state regardless of API response
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!authState.token) return;

    const response = await authApi.getProfile();

    if (response.success && response.data?.user) {
      setAuthState(prev => ({
        ...prev,
        user: response.data!.user,
      }));
    }
  }, [authState.token]);

  return {
    ...authState,
    login,
    logout,
    refreshUser,
  };
};
