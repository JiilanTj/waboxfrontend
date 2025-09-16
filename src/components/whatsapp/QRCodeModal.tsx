'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Phone, Smartphone } from 'lucide-react';
import { WhatsAppNumber, WhatsAppSession } from '@/lib/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  qrCode: string | null;
  whatsappNumber: WhatsAppNumber | null;
  sessionId: string | null;
  onRefreshQR?: (sessionId: string) => Promise<void>;
  onRefreshSession?: (whatsappNumberId: number) => Promise<void>;
  isRefreshing?: boolean;
  session?: WhatsAppSession | null;
}

export function QRCodeModal({
  open,
  onClose,
  qrCode,
  whatsappNumber,
  sessionId,
  onRefreshQR,
  onRefreshSession,
  isRefreshing = false,
  session
}: QRCodeModalProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // Auto refresh QR code every 30 seconds if still PENDING/PAIRING
  useEffect(() => {
    if (!open || !autoRefresh || !sessionId || !onRefreshQR) return;
    if (session?.status === 'CONNECTED') return;

    const interval = setInterval(() => {
      if (countdown <= 1) {
        onRefreshQR(sessionId);
        setCountdown(30);
      } else {
        setCountdown(prev => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, autoRefresh, sessionId, onRefreshQR, countdown, session?.status]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (open) {
      setCountdown(30);
    }
  }, [open]);

  const handleRefreshQR = async () => {
    if (!sessionId || !onRefreshQR) return;
    
    try {
      await onRefreshQR(sessionId);
      setCountdown(30);
      toast.success('QR Code berhasil diperbarui');
    } catch (error) {
      console.error('Failed to refresh QR:', error);
      toast.error('Gagal memperbarui QR Code');
    }
  };

  const handleRefreshSession = async () => {
    if (!whatsappNumber?.id || !onRefreshSession) return;
    
    try {
      await onRefreshSession(whatsappNumber.id);
      toast.success('Status sesi berhasil diperbarui');
    } catch (error) {
      console.error('Failed to refresh session:', error);
      toast.error('Gagal memperbarui status sesi');
    }
  };

  const handleManualStatusCheck = async () => {
    if (!whatsappNumber?.id || !onRefreshSession) return;
    
    try {
      toast.loading('Mengecek status koneksi...', { id: 'status-check' });
      await onRefreshSession(whatsappNumber.id);
      
      if (session?.status === 'CONNECTED') {
        toast.success('WhatsApp berhasil terhubung!', { id: 'status-check' });
      } else {
        toast.success('Status berhasil dicek!', { id: 'status-check' });
      }
    } catch (error) {
      console.error('Failed to check status:', error);
      toast.error('Gagal mengecek status koneksi', { id: 'status-check' });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'CONNECTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAIRING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DISCONNECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'CONNECTED': return <CheckCircle className="w-4 h-4" />;
      case 'ERROR': return <AlertCircle className="w-4 h-4" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'PENDING': return 'Menunggu Koneksi';
      case 'CONNECTED': return 'Terhubung';
      case 'PAIRING': return 'Sedang Pairing';
      case 'DISCONNECTED': return 'Terputus';
      case 'ERROR': return 'Error';
      default: return 'Tidak Diketahui';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle>QR Code WhatsApp</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* WhatsApp Number Info */}
          {whatsappNumber && (
            <Card>
              <CardContent className="pt-4">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">{whatsappNumber.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {whatsappNumber.phoneNumber}
                  </div>
                  
                  {/* Status Badge */}
                  {session && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className={cn("border rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center", getStatusColor(session.status))}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{getStatusText(session.status)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Code Display */}
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-4">
                {qrCode ? (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={qrCode} 
                          alt="QR Code WhatsApp" 
                          className="w-40 h-40 max-w-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                        <Smartphone className="w-4 h-4" />
                        <span>Pindai dengan WhatsApp di ponsel Anda</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Buka WhatsApp → Titik 3 → Perangkat Tertaut → Tautkan Perangkat
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">Memuat QR Code...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Auto Refresh Info & Controls */}
          {session?.status !== 'CONNECTED' && qrCode && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Refresh Otomatis</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">{autoRefresh ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                  </div>
                  
                  {autoRefresh && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        Refresh QR dalam {countdown} detik
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshQR}
                      disabled={isRefreshing}
                      className="flex-1"
                    >
                      {isRefreshing ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Refresh QR
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshSession}
                      disabled={isRefreshing}
                      className="flex-1"
                    >
                      {isRefreshing ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Refresh Status
                    </Button>
                  </div>

                  {/* Manual Check Button */}
                  <div className="pt-2">
                    <Button
                      onClick={handleManualStatusCheck}
                      disabled={isRefreshing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      {isRefreshing ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-3 h-3 mr-2" />
                      )}
                      Sudah Scan QR?
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Klik tombol ini setelah Anda memindai QR code untuk langsung mengecek status
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {session?.status === 'CONNECTED' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                  <h3 className="font-semibold text-green-800">WhatsApp Terhubung!</h3>
                  <p className="text-sm text-green-700">
                    WhatsApp berhasil terhubung dan siap digunakan.
                  </p>
                  <Button
                    onClick={onClose}
                    className="mt-3 bg-green-600 hover:bg-green-700"
                  >
                    Tutup
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
