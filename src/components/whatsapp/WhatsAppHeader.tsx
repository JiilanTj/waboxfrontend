'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppHeaderProps {
  onCreateWhatsApp: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function WhatsAppHeader({ 
  onCreateWhatsApp, 
  onRefresh, 
  isLoading 
}: WhatsAppHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manajemen WhatsApp
              </h1>
              <p className="text-sm text-gray-600">
                Kelola nomor WhatsApp untuk sistem multi-account
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2",
                isLoading && "opacity-50"
              )}
            >
              <RefreshCw 
                className={cn(
                  "h-4 w-4",
                  isLoading && "animate-spin"
                )} 
              />
              Refresh
            </Button>
            
            <Button
              onClick={onCreateWhatsApp}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Tambah WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
