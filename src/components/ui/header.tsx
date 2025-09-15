"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/hooks/AuthContext";
import { MessageSquare, Menu, User } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAuthContext();

  return (
    <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <MessageSquare className="h-5 w-5 text-green-600" />
          </div>
          <h1 className="text-base lg:text-lg font-bold text-gray-900">
            WABox
          </h1>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-gray-600" />
        <div className="text-sm">
          <p className="font-medium text-gray-900 truncate max-w-24 lg:max-w-xs">
            {user?.name}
          </p>
        </div>
      </div>
    </header>
  );
}
