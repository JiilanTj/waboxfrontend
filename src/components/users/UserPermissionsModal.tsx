'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Hash, 
  Phone,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
  Users
} from 'lucide-react';
import { WAPermission } from '@/lib/types';

interface UserPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    email: string;
    username: string;
  } | null;
  permissions: WAPermission[];
  isLoading: boolean;
}

export function UserPermissionsModal({
  open,
  onClose,
  user,
  permissions,
  isLoading
}: UserPermissionsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber.startsWith('+62')) {
      return phoneNumber.replace('+62', '0');
    }
    return phoneNumber;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">
                Izin WhatsApp
              </div>
              <div className="text-sm font-normal text-gray-500">
                {user?.name}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>@{user?.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="h-4 w-4" />
                <span>ID: {user?.id}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-96 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Memuat izin pengguna...</p>
              </div>
            </div>
          ) : permissions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  Ditemukan {permissions.length} izin WhatsApp
                </h3>
                <div className="text-sm text-gray-500">
                  Total: {permissions.length} nomor
                </div>
              </div>

              <div className="grid gap-4">
                {permissions.map((permission) => (
                  <Card key={permission.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Phone className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {permission.whatsappNumber.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Phone className="h-3 w-3" />
                              <span className="font-mono">
                                {formatPhoneNumber(permission.whatsappNumber.phoneNumber)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {permission.whatsappNumber.isActive ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              Aktif
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              <XCircle className="h-3 w-3" />
                              Nonaktif
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3" />
                          <span>ID Izin: {permission.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Dibuat: {formatDate(permission.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada izin WhatsApp
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Pengguna ini belum memiliki izin untuk mengakses nomor WhatsApp manapun.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 -mx-6 px-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
