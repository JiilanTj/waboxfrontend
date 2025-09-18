'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TemplatesFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  limit: number;
  onLimitChange: (value: number) => void;
}

export function TemplatesFilters({ searchInput, onSearchChange, status, onStatusChange, limit, onLimitChange }: TemplatesFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-3 items-end">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Pencarian</Label>
            <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-white">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari nama atau command..."
                className="border-0 p-0 focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <select 
              value={status}
              onChange={(e) => onStatusChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="ALL">Semua</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Tidak Aktif</option>
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
      </CardContent>
    </Card>
  );
}
