'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { useWhatsApp, useWhatsAppSession, useWAPermission, useAuth } from '@/hooks';
import { WhatsAppNumber, CreateWhatsAppRequest, UpdateWhatsAppRequest, WhatsAppSession } from '@/lib/types';
import {
  WhatsAppHeader,
  WhatsAppFilters, 
  WhatsAppTable,
  WhatsAppPaginationComponent,
  CreateWhatsAppModal,
  EditWhatsAppModal,
  QRCodeModal
} from '@/components/whatsapp/index';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function WhatsAppPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <WhatsAppContent />
    </AuthGuard>
  );
}

function WhatsAppContent() {
  const { 
    data: whatsappNumbers, 
    pagination, 
    isLoading, 
    error, 
    fetchWhatsApp, 
    setFilters, 
    createWhatsApp,
    updateWhatsApp,
    deleteWhatsApp,
    toggleWhatsAppStatus,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
    limit, 
    isActive,
    page
  } = useWhatsApp({ autoFetch: true });

  const {
    createSession,
    getSession,
    getQRCode,
    deleteSession,
    isCreating: isCreatingSession,
    isDeleting: isDeletingSession,
    allSessions,
    getAllSessions,
    isLoadingAllSessions,
    allSessionsError,
  } = useWhatsAppSession();

  // Get user permissions for WhatsApp numbers
  const { user } = useAuth();
  const { 
    myPermissions, 
    isLoading: isLoadingPermissions 
  } = useWAPermission({ autoFetch: true });

  const isAdmin = user?.role === 'ADMIN';

  // Check if user has permission to access a WhatsApp number
  const hasPermission = useCallback((whatsappNumberId: number): boolean => {
    // Admin users have access to all numbers
    if (isAdmin) {
      return true;
    }

    // Check if user has explicit permission for this number
    return myPermissions.some(permission => 
      permission.whatsappNumberId === whatsappNumberId
    );
  }, [isAdmin, myPermissions]);

  const [searchInput, setSearchInput] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingWhatsApp, setEditingWhatsApp] = useState<WhatsAppNumber | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    whatsappNumber: WhatsAppNumber | null;
  }>({ open: false, whatsappNumber: null });
  
  const [connectConfirm, setConnectConfirm] = useState<{
    open: boolean;
    whatsappNumber: WhatsAppNumber | null;
  }>({ open: false, whatsappNumber: null });

  const [qrCodeModal, setQrCodeModal] = useState<{
    open: boolean;
    qrCode: string | null;
    whatsappNumber: WhatsAppNumber | null;
    sessionId: string | null;
    session: WhatsAppSession | null;
  }>({ 
    open: false, 
    qrCode: null, 
    whatsappNumber: null,
    sessionId: null,
    session: null
  });

  // Debounced search with useCallback
  const debouncedSearch = useCallback((value: string) => {
    if (value.trim() !== '') {
      setFilters({ search: value.trim(), page: 1 });
    } else {
      setFilters({ search: '', page: 1 });
    }
  }, [setFilters]);

  useEffect(() => {
    const handle = setTimeout(() => {
      debouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(handle);
  }, [searchInput, debouncedSearch]);

  const denyIfNotAdmin = () => {
    if (!isAdmin) {
      toast.error('Akses ditolak. Hanya ADMIN yang dapat melakukan tindakan ini.');
      return true;
    }
    return false;
  };

  const handleCreateWhatsApp = async (data: CreateWhatsAppRequest) => {
    if (denyIfNotAdmin()) return;
    const result = await createWhatsApp(data);
    if (result.success) {
      setCreateModalOpen(false);
      toast.success('Nomor WhatsApp berhasil ditambahkan!');
    } else {
      toast.error(result.error?.message || 'Gagal menambahkan nomor WhatsApp');
    }
  };

  const handleUpdateWhatsApp = async (id: number, data: UpdateWhatsAppRequest) => {
    if (denyIfNotAdmin()) return;
    const result = await updateWhatsApp(id, data);
    if (result.success) {
      setEditingWhatsApp(null);
      toast.success('Nomor WhatsApp berhasil diperbarui!');
    } else {
      toast.error(result.error?.message || 'Gagal memperbarui nomor WhatsApp');
    }
  };

  const handleDeleteWhatsApp = async (whatsappId: number) => {
    if (denyIfNotAdmin()) return;
    const result = await deleteWhatsApp(whatsappId);
    if (result.success) {
      setDeleteConfirm({ open: false, whatsappNumber: null });
      toast.success('Nomor WhatsApp berhasil dihapus!');
    } else {
      toast.error(result.error?.message || 'Gagal menghapus nomor WhatsApp');
    }
  };

  const handleToggleStatus = async (whatsappNumber: WhatsAppNumber) => {
    if (denyIfNotAdmin()) return;
    const result = await toggleWhatsAppStatus(whatsappNumber.id);
    if (result.success) {
      const statusText = whatsappNumber.isActive ? 'dinonaktifkan' : 'diaktifkan';
      toast.success(`Nomor WhatsApp berhasil ${statusText}!`);
    } else {
      toast.error(result.error?.message || 'Gagal mengubah status nomor WhatsApp');
    }
  };

  const handleDeleteClick = (whatsappNumber: WhatsAppNumber) => {
    if (!isAdmin) {
      toast.error('Akses ditolak. Hanya ADMIN yang dapat menghapus nomor.');
      return;
    }
    setDeleteConfirm({ open: true, whatsappNumber });
  };

  const handleConnectClick = (whatsappNumber: WhatsAppNumber) => {
    if (!isAdmin) {
      toast.error('Akses ditolak. Hanya ADMIN yang dapat menghubungkan WhatsApp.');
      return;
    }
    setConnectConfirm({ open: true, whatsappNumber });
  };

  const handleConnectWhatsApp = async (whatsappId: number) => {
    if (denyIfNotAdmin()) return;
    try {
      toast.loading('Membuat sesi koneksi...', { id: 'connecting' });
      // 1. Create session (POST)
      const createResult = await createSession(whatsappId);
      if (!createResult.success) {
        toast.error(createResult.error?.message || 'Gagal membuat sesi', { id: 'connecting' });
        return;
      }

      toast.success('Sesi berhasil dibuat, mengambil QR code...', { id: 'connecting' });

      // 2. Get session to retrieve QR code (GET)
      const sessionResult = await getSession(whatsappId);
      if (!sessionResult.success || !sessionResult.data) {
        toast.error('Gagal mengambil data sesi', { id: 'connecting' });
        return;
      }

      const sessionData = sessionResult.data.data;
      const whatsappNumber = whatsappNumbers.find(wa => wa.id === whatsappId);
      
      // 3. Show QR code in modal if available
      if (sessionData.qrCode) {
        setQrCodeModal({
          open: true,
          qrCode: sessionData.qrCode,
          whatsappNumber: whatsappNumber || null,
          sessionId: sessionData.id,
          session: sessionData
        });
        toast.success('QR Code siap untuk dipindai!', { id: 'connecting' });
      } else {
        toast.success('Sesi berhasil dibuat, menunggu QR code...', { id: 'connecting' });
      }

      // Refresh sessions data
      getAllSessions();
      
    } catch (error) {
      console.error('Connect error:', error);
      toast.error('Terjadi kesalahan saat menghubungkan', { id: 'connecting' });
    } finally {
      setConnectConfirm({ open: false, whatsappNumber: null });
    }
  };

  const isConnecting = (id: number) => isCreatingSession(id);
  const isDisconnecting = (sessionId: string) => isDeletingSession(sessionId);

  const handleDisconnectWhatsApp = async (whatsappNumber: WhatsAppNumber, session: WhatsAppSession) => {
    if (denyIfNotAdmin()) return;
    try {
      toast.loading('Memutus koneksi WhatsApp...', { id: 'disconnecting' });
      
      const result = await deleteSession(session.id);
      if (result.success) {
        toast.success('WhatsApp berhasil diputus!', { id: 'disconnecting' });
        getAllSessions(); // Refresh sessions to update UI
      } else {
        toast.error(result.error?.message || 'Gagal memutus WhatsApp', { id: 'disconnecting' });
      }
      
    } catch (error) {
      console.error('Failed to disconnect WhatsApp:', error);
      toast.error('Gagal memutus koneksi WhatsApp', { id: 'disconnecting' });
    }
  };

  const handleEditWhatsApp = (whatsappNumber: WhatsAppNumber) => {
    if (!isAdmin) {
      toast.error('Akses ditolak. Hanya ADMIN yang dapat mengedit nomor.');
      return;
    }
    setEditingWhatsApp(whatsappNumber);
  };

  const handleStatusFilter = useCallback((statusValue: string) => {
    if (statusValue === 'all') {
      setFilters({ isActive: undefined, page: 1 });
    } else {
      setFilters({ isActive: statusValue === 'active', page: 1 });
    }
  }, [setFilters]);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters({ page: newPage });
  }, [setFilters]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setFilters({ limit: newLimit, page: 1 });
  }, [setFilters]);

  // Auto-fetch sessions when component mounts
  useEffect(() => {
    getAllSessions();
  }, [getAllSessions]);

  // Refetch sessions when WhatsApp numbers change
  useEffect(() => {
    if (whatsappNumbers.length > 0) {
      getAllSessions();
    }
  }, [whatsappNumbers, getAllSessions]);

  // QR Code modal handlers
  const handleRefreshQR = async (sessionId: string) => {
    try {
      const qrResult = await getQRCode(sessionId);
      if (qrResult.success && qrResult.data) {
        setQrCodeModal(prev => ({
          ...prev,
          qrCode: qrResult.data!.data.qrCode
        }));
      }
    } catch (error) {
      console.error('Failed to refresh QR:', error);
      throw error;
    }
  };

  const handleRefreshSession = async (whatsappNumberId: number) => {
    try {
      const sessionResult = await getSession(whatsappNumberId);
      if (sessionResult.success && sessionResult.data) {
        const sessionData = sessionResult.data.data;
        setQrCodeModal(prev => ({
          ...prev,
          session: sessionData,
          qrCode: sessionData.qrCode || prev.qrCode
        }));
        
        // If connected, close modal after a delay
        if (sessionData.status === 'CONNECTED') {
          setTimeout(() => {
            setQrCodeModal({
              open: false,
              qrCode: null,
              whatsappNumber: null,
              sessionId: null,
              session: null
            });
          }, 3000);
        }
      }
      getAllSessions(); // Refresh all sessions
    } catch (error) {
      console.error('Failed to refresh session:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <WhatsAppHeader
        onCreateWhatsApp={() => {
          if (!isAdmin) {
            toast.error('Akses ditolak. Hanya ADMIN yang dapat membuat nomor WhatsApp.');
            return;
          }
          setCreateModalOpen(true);
        }}
        onRefresh={() => fetchWhatsApp()}
        isLoading={isLoading}
        isAdmin={isAdmin}
      />

      {/* Filters */}
      <WhatsAppFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        isActive={isActive}
        onStatusChange={handleStatusFilter}
        limit={limit}
        onLimitChange={handleLimitChange}
      />

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <strong>WhatsApp Error:</strong> {error}
        </div>
      )}
      
      {allSessionsError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          <strong>Session Error:</strong> {allSessionsError}
        </div>
      )}

      {/* WhatsApp Numbers Table */}
      <WhatsAppTable
        whatsappNumbers={whatsappNumbers}
        sessions={allSessions}
        isLoading={isLoading || isLoadingAllSessions}
        limit={limit}
        onEditWhatsApp={handleEditWhatsApp}
        onDeleteWhatsApp={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        onConnectWhatsApp={handleConnectClick}
        onDisconnectWhatsApp={handleDisconnectWhatsApp}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        isToggling={isToggling}
        isConnecting={isConnecting}
        isDisconnecting={isDisconnecting}
        hasPermission={hasPermission}
        isAdmin={isAdmin}
        isLoadingPermissions={isLoadingPermissions}
      />

      {/* Pagination */}
      {pagination && (
        <WhatsAppPaginationComponent
          pagination={pagination}
          currentPage={page}
          onPageChange={handlePageChange}
          totalNumbers={whatsappNumbers.length}
        />
      )}

      {/* Create WhatsApp Modal */}
      <CreateWhatsAppModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateWhatsApp}
        isCreating={isCreating}
      />

      {/* Edit WhatsApp Modal */}
      <EditWhatsAppModal
        whatsappNumber={editingWhatsApp}
        onClose={() => setEditingWhatsApp(null)}
        onSubmit={handleUpdateWhatsApp}
        isUpdating={editingWhatsApp ? isUpdating(editingWhatsApp.id) : false}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, whatsappNumber: null })}
        title="Hapus Nomor WhatsApp"
        description={
          deleteConfirm.whatsappNumber 
            ? `Apakah Anda yakin ingin menghapus nomor WhatsApp "${deleteConfirm.whatsappNumber.name}" (${deleteConfirm.whatsappNumber.phoneNumber})? Tindakan ini tidak dapat dibatalkan.`
            : 'Apakah Anda yakin ingin menghapus nomor WhatsApp ini?'
        }
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
        onConfirm={() => {
          if (deleteConfirm.whatsappNumber) {
            return handleDeleteWhatsApp(deleteConfirm.whatsappNumber.id);
          }
        }}
        isLoading={deleteConfirm.whatsappNumber ? isDeleting(deleteConfirm.whatsappNumber.id) : false}
      />

      {/* Connect Confirmation Dialog */}
      <ConfirmDialog
        open={connectConfirm.open}
        onOpenChange={(open) => setConnectConfirm({ open, whatsappNumber: null })}
        title="Hubungkan WhatsApp"
        description={
          connectConfirm.whatsappNumber 
            ? `Apakah Anda yakin ingin menghubungkan nomor WhatsApp "${connectConfirm.whatsappNumber.name}" (${connectConfirm.whatsappNumber.phoneNumber})? Pastikan WhatsApp sudah siap untuk dipindai QR code.`
            : 'Apakah Anda yakin ingin menghubungkan nomor WhatsApp ini?'
        }
        confirmText="Hubungkan"
        cancelText="Batal"
        variant="default"
        onConfirm={() => {
          if (connectConfirm.whatsappNumber) {
            return handleConnectWhatsApp(connectConfirm.whatsappNumber.id);
          }
        }}
        isLoading={connectConfirm.whatsappNumber ? isConnecting(connectConfirm.whatsappNumber.id) : false}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        open={qrCodeModal.open}
        onClose={() => setQrCodeModal({
          open: false,
          qrCode: null,
          whatsappNumber: null,
          sessionId: null,
          session: null
        })}
        qrCode={qrCodeModal.qrCode}
        whatsappNumber={qrCodeModal.whatsappNumber}
        sessionId={qrCodeModal.sessionId}
        session={qrCodeModal.session}
        onRefreshQR={handleRefreshQR}
        onRefreshSession={handleRefreshSession}
      />
    </div>
  );
}
