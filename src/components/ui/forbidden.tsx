'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ForbiddenProps {
  title?: string;
  description?: string;
}

export default function Forbidden({
  title = '403 Forbidden',
  description = 'Anda tidak memiliki akses ke halaman ini',
}: ForbiddenProps) {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-full bg-red-50 p-3">
          <ShieldAlert className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    </div>
  );
}
