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
  Shield,
  Plus,
  X
} from 'lucide-react';
import { WAPermission, WhatsAppNumber } from '@/lib/types';
import { useState } from 'react';

interface ManagePermissionsModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    email: string;
    username: string;
  } | null;
  permissions: WAPermission[];
  availableWhatsApps: WhatsAppNumber[];
  isLoading: boolean;
  isCreating: boolean;
  isDeletingPermission?: (permissionId: number) => boolean;
  onCreatePermission: (userId: number, whatsappNumberId: number) => Promise<void>;
  onRemovePermission?: (permissionId: number) => Promise<void>;
}

export function ManagePermissionsModal({
  open,
  onClose,
  user,
  permissions,
  availableWhatsApps,
  isLoading,
  isCreating,
  isDeletingPermission,
  onCreatePermission,
  onRemovePermission
}: ManagePermissionsModalProps) {
  const [selectedWhatsAppId, setSelectedWhatsAppId] = useState<number | null>(null);

  // Check if this is an admin user (permissions with null id)
  const isAdminUser = permissions.length > 0 && permissions.every(p => p.id === null);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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

  // Get WhatsApp numbers that user doesn't have permission for
  const getAvailableWhatsApps = () => {
    const userPermissionIds = permissions.map(p => p.whatsappNumberId);
    return availableWhatsApps.filter(wa => !userPermissionIds.includes(wa.id));
  };

  const handleCreatePermission = async () => {
    if (selectedWhatsAppId && user) {
      await onCreatePermission(user.id, selectedWhatsAppId);
      setSelectedWhatsAppId(null);
    }
  };

  const availableOptions = getAvailableWhatsApps();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">
                Kelola Izin WhatsApp
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
          {/* Admin Notice */}
          {isAdminUser && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-900 mb-1">Akses Administrator</h3>
                  <p className="text-sm text-purple-700">
                    Sebagai ADMIN, pengguna ini memiliki akses otomatis ke semua nomor WhatsApp ({permissions.length} nomor). 
                    Tidak perlu menambah atau menghapus izin secara manual.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add Permission Section - Only for non-admin users */}
          {!isAdminUser && availableOptions.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                Tambah Izin Baru
              </h3>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label htmlFor="whatsapp-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Nomor WhatsApp
                  </label>
                  <select
                    id="whatsapp-select"
                    value={selectedWhatsAppId || ''}
                    onChange={(e) => setSelectedWhatsAppId(Number(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih nomor WhatsApp...</option>
                    {availableOptions.map((wa) => (
                      <option key={wa.id} value={wa.id}>
                        {wa.name} - {formatPhoneNumber(wa.phoneNumber)}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleCreatePermission}
                  disabled={!selectedWhatsAppId || isCreating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Menambah...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Tambah
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Current Permissions */}
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
                  {isAdminUser ? `Akses WhatsApp Administrator (${permissions.length})` : `Izin WhatsApp Saat Ini (${permissions.length})`}
                </h3>
              </div>

              <div className="grid gap-4">
                {permissions.map((permission, index) => (
                  <Card key={permission.id || `admin-${index}`} className="border border-gray-200 hover:border-gray-300 transition-colors">
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

                          {/* Admin badge for null permissions */}
                          {permission.id === null && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                              <Shield className="h-3 w-3" />
                              Admin
                            </div>
                          )}
                          
                          {/* Only show remove button for non-admin permissions */}
                          {onRemovePermission && permission.id !== null && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRemovePermission(permission.id as number)}
                              disabled={isDeletingPermission?.(permission.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                            >
                              {isDeletingPermission?.(permission.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                        {permission.id !== null ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3" />
                              <span>ID Izin: {permission.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>Dibuat: {formatDate(permission.createdAt)}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              <span>Tipe: Akses Administrator</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>Status: Otomatis</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-gray-400" />
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
