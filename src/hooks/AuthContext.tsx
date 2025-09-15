'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthState } from '@/hooks/useAuth';
import { LoginRequest, LoginResponse, ErrorResponse } from '@/lib/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<{
    success: boolean;
    data?: LoginResponse;
    error?: ErrorResponse;
  }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
