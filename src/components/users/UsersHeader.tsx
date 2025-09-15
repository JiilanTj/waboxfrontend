'use client';

import { Button } from '@/components/ui/button';
import { Users as UsersIcon, UserPlus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsersHeaderProps {
  onCreateUser: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function UsersHeader({ onCreateUser, onRefresh, isLoading = false }: UsersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <UsersIcon className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Manajemen Pengguna</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola akun pengguna sistem dan hak akses</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreateUser} className="gap-2">
          <UserPlus className="h-4 w-4" /> Tambah Pengguna
        </Button>
        <Button variant="outline" onClick={onRefresh} className="gap-2">
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} /> Refresh
        </Button>
      </div>
    </div>
  );
}
