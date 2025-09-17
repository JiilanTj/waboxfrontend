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
  Phone,
  Plug,
  PlugZap,
  Lock,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatsAppNumber, WhatsAppSession } from '@/lib/types';

interface WhatsAppTableProps {
  whatsappNumbers: WhatsAppNumber[];
  sessions: WhatsAppSession[];
  isLoading: boolean;
  limit: number;
  onEditWhatsApp: (whatsappNumber: WhatsAppNumber) => void;
  onDeleteWhatsApp: (whatsappNumber: WhatsAppNumber) => void;
  onToggleStatus: (whatsappNumber: WhatsAppNumber) => void;
  onConnectWhatsApp: (whatsappNumber: WhatsAppNumber) => void;
  onDisconnectWhatsApp: (whatsappNumber: WhatsAppNumber, session: WhatsAppSession) => void;
  isUpdating: (id: number) => boolean;
  isDeleting: (id: number) => boolean;
  isToggling: (id: number) => boolean;
  isConnecting: (id: number) => boolean;
  isDisconnecting: (sessionId: string) => boolean;
  hasPermission: (whatsappNumberId: number) => boolean;
  isAdmin: boolean;
  isLoadingPermissions: boolean;
}

// Map for session status display configuration (desktop + can be reused elsewhere)
const statusConfigMap = {
  CONNECTED: { color: 'text-green-600', bg: 'bg-green-500', label: 'Terhubung' },
  DISCONNECTED: { color: 'text-red-600', bg: 'bg-red-500', label: 'Terputus' },
  PAIRING: { color: 'text-blue-600', bg: 'bg-blue-500', label: 'Pairing' },
  PENDING: { color: 'text-yellow-600', bg: 'bg-yellow-500', label: 'Menunggu' },
  ERROR: { color: 'text-red-600', bg: 'bg-red-500', label: 'Error' }
} as const;

type StatusConfig = typeof statusConfigMap[keyof typeof statusConfigMap];

export function WhatsAppTable({ 
  whatsappNumbers,
  sessions, 
  isLoading, 
  limit, 
  onEditWhatsApp, 
  onDeleteWhatsApp,
  onToggleStatus,
  onConnectWhatsApp,
  onDisconnectWhatsApp,
  isUpdating,
  isDeleting,
  isToggling,
  isConnecting,
  isDisconnecting,
  hasPermission,
  isAdmin,
  isLoadingPermissions
}: WhatsAppTableProps) {

  // Helper function to get session for a WhatsApp number
  const getSessionForWhatsApp = (whatsappNumberId: number): WhatsAppSession | null => {
    return sessions.find(session => session.whatsappNumberId === whatsappNumberId) || null;
  };

  // Helper function to check if WhatsApp is connected
  const isWhatsAppConnected = (whatsappNumberId: number): boolean => {
    const session = getSessionForWhatsApp(whatsappNumberId);
    return session?.status === 'CONNECTED';
  };

  // Helper function to get session status
  const getSessionStatus = (whatsappNumberId: number): WhatsAppSession['status'] | null => {
    const session = getSessionForWhatsApp(whatsappNumberId);
    return session?.status || null;
  };

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
            <span className="ml-2 text-gray-600">
              Memuat data nomor WhatsApp{isLoadingPermissions && " dan permission"}...
            </span>
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
      <table className="w-full">{[
          <thead key="thead">{[
            <tr key="head-row" className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Nama</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Nomor WhatsApp</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Sesi</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Dibuat</th>
              <th className="text-right py-3 px-4 font-medium text-gray-900">Aksi</th>
            </tr>
          ]}</thead>,
          <tbody key="tbody">{whatsappNumbers.map((whatsappNumber, index) => {
            const hasAccess = hasPermission(whatsappNumber.id);
            const showForbidden = !isAdmin && !isLoadingPermissions && !hasAccess;

            return (
              <tr
                key={whatsappNumber.id}
                className={cn(
                  "border-b border-gray-100 transition-colors",
                  index < limit && "animate-in slide-in-from-top-1",
                  showForbidden ? "bg-red-50/50" : "hover:bg-gray-50"
                )}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", showForbidden ? "bg-red-100" : "bg-green-100")}>{showForbidden ? (<Lock className="h-4 w-4 text-red-600" />) : (<MessageSquare className="h-4 w-4 text-green-600" />)}</div>
                    <div>
                      <div className={cn("font-medium", showForbidden ? "text-red-900" : "text-gray-900")}>{whatsappNumber.name}</div>
                      {isAdmin && (
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600 font-medium">Admin</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className={cn("flex items-center gap-2", showForbidden ? "text-red-600" : "text-gray-600")}> 
                    <Phone className="h-4 w-4" />
                    <span className="font-mono">{formatPhoneNumber(whatsappNumber.phoneNumber)}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {showForbidden ? (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium">Tidak Ada Akses</span>
                    </div>
                  ) : (
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
                  )}
                </td>
                <td className="py-4 px-4">
                  {showForbidden ? (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                      <span className="text-red-500 font-medium">Terbatas</span>
                    </div>
                  ) : (
                    (() => {
                      const sessionStatus = getSessionStatus(whatsappNumber.id);
                      if (!sessionStatus) {
                        return (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-500 font-medium">Belum Ada Sesi</span>
                          </div>
                        );
                      }
                      const statusConfig: StatusConfig | { color: string; bg: string; label: string } = statusConfigMap[sessionStatus as keyof typeof statusConfigMap] || { color: 'text-gray-600', bg: 'bg-gray-500', label: sessionStatus };
                      return (
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 ${statusConfig.bg} rounded-full`}></div>
                          <span className={`${statusConfig.color} font-medium`}>{statusConfig.label}</span>
                        </div>
                      );
                    })()
                  )}
                </td>
                <td className="py-4 px-4 text-gray-600 text-sm">{formatDate(whatsappNumber.createdAt)}</td>
                <td className="py-4 px-4">
                  {showForbidden ? (
                    <div className="flex items-center justify-end">
                      <div className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium">Anda tidak memiliki akses ke nomor ini</div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      {whatsappNumber.isActive && isWhatsAppConnected(whatsappNumber.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/whatsapp/chat/${whatsappNumber.id}`, '_blank')}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Buka Chat
                        </Button>
                      )}
                      {whatsappNumber.isActive && (() => {
                        const session = getSessionForWhatsApp(whatsappNumber.id);
                        const isConnected = isWhatsAppConnected(whatsappNumber.id);
                        if (isConnected && session) {
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDisconnectWhatsApp(whatsappNumber, session)}
                              disabled={isDisconnecting(session.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {isDisconnecting(session.id) ? (<Loader2 className="h-3 w-3 animate-spin" />) : (<PlugZap className="h-3 w-3" />)}
                              Disconnect
                            </Button>
                          );
                        }
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onConnectWhatsApp(whatsappNumber)}
                            disabled={isConnecting(whatsappNumber.id)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {isConnecting(whatsappNumber.id) ? (<Loader2 className="h-3 w-3 animate-spin" />) : (<Plug className="h-3 w-3" />)}
                            Connect
                          </Button>
                        );
                      })()}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(whatsappNumber)}
                        disabled={isToggling(whatsappNumber.id)}
                        className={cn("flex items-center gap-1", whatsappNumber.isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-700 hover:bg-green-50")}
                      >
                        {isToggling(whatsappNumber.id) ? (<Loader2 className="h-3 w-3 animate-spin" />) : whatsappNumber.isActive ? (<PowerOff className="h-3 w-3" />) : (<Power className="h-3 w-3" />)}
                        {whatsappNumber.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditWhatsApp(whatsappNumber)}
                        disabled={isUpdating(whatsappNumber.id)}
                      >
                        {isUpdating(whatsappNumber.id) ? (<Loader2 className="h-3 w-3 animate-spin" />) : (<Edit className="h-3 w-3" />)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteWhatsApp(whatsappNumber)}
                        disabled={isDeleting(whatsappNumber.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {isDeleting(whatsappNumber.id) ? (<Loader2 className="h-3 w-3 animate-spin" />) : (<Trash2 className="h-3 w-3" />)}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}</tbody>
        ]}</table>
    </div>
  );

  // Mobile Card View
  const MobileCards = () => (
    <div className="lg:hidden space-y-4">
      {whatsappNumbers.map((whatsappNumber) => {
        const hasAccess = hasPermission(whatsappNumber.id);
        const showForbidden = !isAdmin && !isLoadingPermissions && !hasAccess;
        return (
          <Card key={whatsappNumber.id} className={cn("p-4", showForbidden && "bg-red-50/50 border-red-200")}> 
            <CardContent className="p-0">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", showForbidden ? "bg-red-100" : "bg-green-100")}> 
                      {showForbidden ? (
                        <Lock className="h-4 w-4 text-red-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className={cn("font-medium", showForbidden ? "text-red-900" : "text-gray-900")}> 
                        {whatsappNumber.name}
                      </h3>
                      {isAdmin && (
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600 font-medium">Admin</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {showForbidden ? (
                      <>
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-600 font-medium text-sm">Tidak Ada Akses</span>
                      </>
                    ) : whatsappNumber.isActive ? (
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
  
                {/* Phone Number and Session Status */}
                <div className="space-y-2">
                  <div className={cn("flex items-center gap-2", showForbidden ? "text-red-600" : "text-gray-600")}>
                    <Phone className="h-4 w-4" />
                    <span className="font-mono">
                      {formatPhoneNumber(whatsappNumber.phoneNumber)}
                    </span>
                  </div>
                  
                  {/* Session Status */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Sesi:</span>
                    {showForbidden ? (
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 bg-red-400 rounded-full"></div>
                        <span className="text-red-500 text-sm">Terbatas</span>
                      </div>
                    ) : (() => {
                      const sessionStatus = getSessionStatus(whatsappNumber.id);
                      
                      if (!sessionStatus) {
                        return (
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-500 text-sm">Belum Ada</span>
                          </div>
                        );
                      }
                      
                      const statusConfig = {
                        'CONNECTED': { color: 'text-green-600', bg: 'bg-green-500', label: 'Terhubung' },
                        'DISCONNECTED': { color: 'text-red-600', bg: 'bg-red-500', label: 'Terputus' },
                        'PAIRING': { color: 'text-blue-600', bg: 'bg-blue-500', label: 'Pairing' },
                        'PENDING': { color: 'text-yellow-600', bg: 'bg-yellow-500', label: 'Menunggu' },
                        'ERROR': { color: 'text-red-600', bg: 'bg-red-500', label: 'Error' }
                      }[sessionStatus] || { color: 'text-gray-600', bg: 'bg-gray-500', label: sessionStatus };
                      
                      return (
                        <div className="flex items-center gap-1">
                          <div className={`h-1.5 w-1.5 ${statusConfig.bg} rounded-full`}></div>
                          <span className={`${statusConfig.color} text-sm`}>{statusConfig.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
  
                {/* Created Date */}
                <div className="text-sm text-gray-500">
                  Dibuat: {formatDate(whatsappNumber.createdAt)}
                </div>
  
                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  {showForbidden ? (
                    <div className="w-full">
                      <div className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium text-center">
                        Anda tidak memiliki akses ke nomor ini
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Connect/Disconnect Button - Only show if WhatsApp number is active */}
                      {whatsappNumber.isActive && (() => {
                        const session = getSessionForWhatsApp(whatsappNumber.id);
                        const isConnected = isWhatsAppConnected(whatsappNumber.id);
                        
                        if (isConnected && session) {
                          // Show Disconnect button
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDisconnectWhatsApp(whatsappNumber, session)}
                              disabled={isDisconnecting(session.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {isDisconnecting(session.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <PlugZap className="h-3 w-3" />
                              )}
                              Disconnect
                            </Button>
                          );
                        } else {
                          // Show Connect button
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onConnectWhatsApp(whatsappNumber)}
                              disabled={isConnecting(whatsappNumber.id)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {isConnecting(whatsappNumber.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plug className="h-3 w-3" />
                              )}
                              Connect
                            </Button>
                          );
                        }
                      })()}
                      
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
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
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
