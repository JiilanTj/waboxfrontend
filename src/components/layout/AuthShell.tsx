'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/hooks/AuthContext';
import Sidebar from '@/components/ui/sidebar';
import Header from '@/components/ui/header';

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/login';

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // While loading, just show nothing; pages with AuthGuard will show spinner.
  if (isLoading) return <>{children}</>;

  // If not authenticated OR on login page, render children only
  if (!isAuthenticated || isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="flex flex-col flex-1 lg:ml-64 min-h-screen overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
