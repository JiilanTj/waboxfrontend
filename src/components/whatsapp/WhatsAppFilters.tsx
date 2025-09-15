'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface WhatsAppFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  isActive?: boolean;
  onStatusChange: (status: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

export function WhatsAppFilters({
  searchInput,
  onSearchChange,
  isActive,
  onStatusChange,
  limit,
  onLimitChange,
}: WhatsAppFiltersProps) {
  const getStatusValue = () => {
    if (isActive === undefined) return 'all';
    return isActive ? 'active' : 'inactive';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari nama atau nomor WhatsApp..."
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={getStatusValue() === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onStatusChange('all')}
                className="h-8 px-3 text-xs"
              >
                Semua
              </Button>
              <Button
                variant={getStatusValue() === 'active' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onStatusChange('active')}
                className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white data-[state=active]:bg-green-600"
              >
                Aktif
              </Button>
              <Button
                variant={getStatusValue() === 'inactive' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onStatusChange('inactive')}
                className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white data-[state=active]:bg-red-600"
              >
                Nonaktif
              </Button>
            </div>
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Per halaman:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
