'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface TemplatesHeaderProps {
  onCreate: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function TemplatesHeader({ onCreate, onRefresh, isLoading }: TemplatesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Template Chat</h1>
        <p className="text-sm text-gray-600">Kelola template balasan cepat untuk chat</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Template
        </Button>
      </div>
    </div>
  );
}
