'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export function ComingSoonNotice() {
  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-6 lg:p-8 text-center">
        <div className="bg-white p-4 rounded-full w-fit mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-green-600" />
        </div>
        <h4 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
          Fitur Lengkap Segera Hadir!
        </h4>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm lg:text-base">
          Kami sedang mengembangkan fitur-fitur lengkap untuk mengelola 
          WhatsApp multi-account dan multi-CS. Dashboard ini akan segera 
          dilengkapi dengan semua tools yang Anda butuhkan untuk mengoptimalkan 
          komunikasi bisnis Anda.
        </p>
      </CardContent>
    </Card>
  );
}
