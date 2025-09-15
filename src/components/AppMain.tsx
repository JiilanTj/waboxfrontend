'use client';

import React from 'react';
import { useAuthContext } from '@/hooks/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import DashboardContent from '@/components/dashboard/DashboardLayout';

export default function AppMain() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isAuthenticated ? <DashboardContent /> : <LoginForm />}
    </div>
  );
}
