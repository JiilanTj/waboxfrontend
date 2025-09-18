'use client';

import { ChatTemplate } from '@/lib/types/chat-template';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';

interface TemplatesTableProps {
  data: ChatTemplate[];
  isLoading?: boolean;
  onEdit: (item: ChatTemplate) => void;
  onDelete: (item: ChatTemplate) => void;
  isUpdating: (id: number) => boolean;
  isDeleting: (id: number) => boolean;
}

export function TemplatesTable({ data, isLoading, onEdit, onDelete, isUpdating, isDeleting }: TemplatesTableProps) {
  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-white rounded-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <Card className="p-6 text-center text-gray-600">Belum ada template</Card>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Command</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500 line-clamp-1">{item.content}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.commands}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {item.isActive ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)} disabled={isUpdating(item.id)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(item)} disabled={isDeleting(item.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Hapus
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
