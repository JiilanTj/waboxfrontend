'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/hooks/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquareText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isLogout?: boolean;
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Manajemen Pengguna',
    icon: Users,
    href: '/users',
    adminOnly: true,
  },
  {
    title: 'Akun WhatsApp',
    icon: MessageSquare,
    href: '/whatsapp',
  },
  {
    title: 'Template Chat',
    icon: MessageSquareText,
    href: '/chat-templates',
    adminOnly: true,
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
  },
  {
    title: 'Logout',
    icon: LogOut,
    href: '#',
    isLogout: true,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const { user, logout } = useAuthContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.isLogout) {
      handleLogout();
    }
  };

  // Filter visibility based on role
  const visibleItems = sidebarItems.filter(item => {
    if (item.adminOnly && user?.role !== 'ADMIN') return false;
    if (item.title === 'Manajemen Pengguna' && user?.role !== 'ADMIN') return false;
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-16" : "w-72 lg:w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 min-h-[73px]">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">WABox</h2>
                <p className="text-xs text-gray-600">Manager</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="mx-auto">
              <div className="bg-green-100 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
            </div>
          )}
          
          {/* Desktop Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCollapse}
            className="hidden lg:flex h-8 w-8 flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden h-8 w-8 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-full flex-shrink-0">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.email || 'admin@wabox.com'}
                </p>
                <div className="mt-1.5">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    user?.role === 'ADMIN' 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-blue-100 p-2.5 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {visibleItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <li key={index}>
                  {item.isLogout ? (
                    <button
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group",
                        "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                        "active:scale-[0.98]",
                        "text-red-600 hover:bg-red-50 hover:text-red-700"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0 text-red-600" />
                      {!isCollapsed && <span className="font-medium truncate flex-1">{item.title}</span>}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                        "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                        "active:scale-[0.98]",
                        "text-gray-700 hover:text-gray-900",
                        isActive && "bg-green-50 text-green-700 border border-green-200 shadow-sm"
                      )}
                      onClick={onToggle}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive ? "text-green-700" : "text-current"
                      )} />
                      {!isCollapsed && (
                        <>
                          <span className="font-medium truncate flex-1">{item.title}</span>
                          {isActive && (
                            <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                          )}
                        </>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && (
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500">
                WABox Manager v1.0
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                © 2025 WABox Team
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
