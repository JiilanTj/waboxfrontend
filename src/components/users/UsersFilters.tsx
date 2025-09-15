'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface UsersFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  role: string | undefined;
  onRoleChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
}

export function UsersFilters({ 
  searchInput, 
  onSearchChange, 
  role, 
  onRoleChange, 
  limit, 
  onLimitChange 
}: UsersFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 items-end">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Pencarian</Label>
        <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-white">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama, username, atau email..."
            className="border-0 p-0 focus-visible:ring-0"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Role</Label>
        <select 
          value={role || ''} 
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Semua Role</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Per Halaman</Label>
        <select 
          value={limit} 
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  );
}
