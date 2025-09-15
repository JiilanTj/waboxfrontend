'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Edit,
  Trash2,
  Power,
  PowerOff,
  MessageSquare,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatsAppNumber } from '@/lib/types';

interface WhatsAppTableProps {
  whatsappNumbers: WhatsAppNumber[];
  isLoading: boolean;
  limit: number;
  onEditWhatsApp: (whatsappNumber: WhatsAppNumber) => void;
  onDeleteWhatsApp: (whatsappNumber: WhatsAppNumber) => void;
  onToggleStatus: (whatsappNumber: WhatsAppNumber) => void;
  isUpdating: (id: number) => boolean;
  isDeleting: (id: number) => boolean;
  isToggling: (id: number) => boolean;
}

export function WhatsAppTable({ 
  whatsappNumbers, 
  isLoading, 
  limit, 
  onEditWhatsApp, 
  onDeleteWhatsApp,
  onToggleStatus,
  isUpdating,
  isDeleting,
  isToggling
}: WhatsAppTableProps) {

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
    // Format phone number for better display
    if (phoneNumber.startsWith('+62')) {
      return phoneNumber.replace('+62', '0');
    }
    return phoneNumber;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Memuat data nomor WhatsApp...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (whatsappNumbers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada nomor WhatsApp
            </h3>
            <p className="text-gray-600">
              Belum ada nomor WhatsApp yang terdaftar. Tambah nomor WhatsApp pertama Anda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop Table View
  const DesktopTable = () => (
    <div className="hidden lg:block">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Nama</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Nomor WhatsApp</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Dibuat</th>
            <th className="text-right py-3 px-4 font-medium text-gray-900">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {whatsappNumbers.map((whatsappNumber, index) => (
            <tr 
              key={whatsappNumber.id} 
              className={cn(
                "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                index < limit && "animate-in slide-in-from-top-1"
              )}
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {whatsappNumber.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span className="font-mono">
                    {formatPhoneNumber(whatsappNumber.phoneNumber)}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  {whatsappNumber.isActive ? (
                    <>
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Aktif</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium">Nonaktif</span>
                    </>
                  )}
                </div>
              </td>
              <td className="py-4 px-4 text-gray-600 text-sm">
                {formatDate(whatsappNumber.createdAt)}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(whatsappNumber)}
                    disabled={isToggling(whatsappNumber.id)}
                    className={cn(
                      "flex items-center gap-1",
                      whatsappNumber.isActive 
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                        : "text-green-600 hover:text-green-700 hover:bg-green-50"
                    )}
                  >
                    {isToggling(whatsappNumber.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : whatsappNumber.isActive ? (
                      <PowerOff className="h-3 w-3" />
                    ) : (
                      <Power className="h-3 w-3" />
                    )}
                    {whatsappNumber.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditWhatsApp(whatsappNumber)}
                    disabled={isUpdating(whatsappNumber.id)}
                  >
                    {isUpdating(whatsappNumber.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Edit className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteWhatsApp(whatsappNumber)}
                    disabled={isDeleting(whatsappNumber.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isDeleting(whatsappNumber.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile Card View
  const MobileCards = () => (
    <div className="lg:hidden space-y-4">
      {whatsappNumbers.map((whatsappNumber) => (
        <Card key={whatsappNumber.id} className="p-4">
          <CardContent className="p-0">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {whatsappNumber.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {whatsappNumber.isActive ? (
                    <>
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium text-sm">Aktif</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium text-sm">Nonaktif</span>
                    </>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span className="font-mono">
                  {formatPhoneNumber(whatsappNumber.phoneNumber)}
                </span>
              </div>

              {/* Created Date */}
              <div className="text-sm text-gray-500">
                Dibuat: {formatDate(whatsappNumber.createdAt)}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(whatsappNumber)}
                  disabled={isToggling(whatsappNumber.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1",
                    whatsappNumber.isActive 
                      ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                      : "text-green-600 hover:text-green-700 hover:bg-green-50"
                  )}
                >
                  {isToggling(whatsappNumber.id) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : whatsappNumber.isActive ? (
                    <PowerOff className="h-3 w-3" />
                  ) : (
                    <Power className="h-3 w-3" />
                  )}
                  {whatsappNumber.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditWhatsApp(whatsappNumber)}
                  disabled={isUpdating(whatsappNumber.id)}
                >
                  {isUpdating(whatsappNumber.id) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Edit className="h-3 w-3" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteWhatsApp(whatsappNumber)}
                  disabled={isDeleting(whatsappNumber.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeleting(whatsappNumber.id) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardContent className="p-0">
        <DesktopTable />
        <div className="p-4 lg:p-0">
          <MobileCards />
        </div>
      </CardContent>
    </Card>
  );
}
