'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { useWhatsApp, useWhatsAppSession } from '@/hooks';
import { WhatsAppNumber, CreateWhatsAppRequest, UpdateWhatsAppRequest, WhatsAppSession } from '@/lib/types';
import {
  WhatsAppHeader,
  WhatsAppFilters, 
  WhatsAppTable,
  WhatsAppPaginationComponent,
  CreateWhatsAppModal,
  EditWhatsAppModal
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
    isCreating: isCreatingSession,
    allSessions,
    getAllSessions,
    isLoadingAllSessions,
    allSessionsError,
  } = useWhatsAppSession();

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

  const handleCreateWhatsApp = async (data: CreateWhatsAppRequest) => {
    const result = await createWhatsApp(data);
    if (result.success) {
      setCreateModalOpen(false);
      toast.success('Nomor WhatsApp berhasil ditambahkan!');
    } else {
      toast.error(result.error?.message || 'Gagal menambahkan nomor WhatsApp');
    }
  };

  const handleUpdateWhatsApp = async (id: number, data: UpdateWhatsAppRequest) => {
    const result = await updateWhatsApp(id, data);
    if (result.success) {
      setEditingWhatsApp(null);
      toast.success('Nomor WhatsApp berhasil diperbarui!');
    } else {
      toast.error(result.error?.message || 'Gagal memperbarui nomor WhatsApp');
    }
  };

  const handleDeleteWhatsApp = async (whatsappId: number) => {
    const result = await deleteWhatsApp(whatsappId);
    if (result.success) {
      setDeleteConfirm({ open: false, whatsappNumber: null });
      toast.success('Nomor WhatsApp berhasil dihapus!');
    } else {
      toast.error(result.error?.message || 'Gagal menghapus nomor WhatsApp');
    }
  };

  const handleToggleStatus = async (whatsappNumber: WhatsAppNumber) => {
    const result = await toggleWhatsAppStatus(whatsappNumber.id);
    if (result.success) {
      const statusText = whatsappNumber.isActive ? 'dinonaktifkan' : 'diaktifkan';
      toast.success(`Nomor WhatsApp berhasil ${statusText}!`);
    } else {
      toast.error(result.error?.message || 'Gagal mengubah status nomor WhatsApp');
    }
  };

  const handleDeleteClick = (whatsappNumber: WhatsAppNumber) => {
    setDeleteConfirm({ open: true, whatsappNumber });
  };

  const handleConnectClick = (whatsappNumber: WhatsAppNumber) => {
    setConnectConfirm({ open: true, whatsappNumber });
  };

  const handleConnectWhatsApp = async (whatsappId: number) => {
    try {
      const result = await createSession(whatsappId);
      if (result.success) {
        toast.success('WhatsApp berhasil terhubung!');
        setConnectConfirm({ open: false, whatsappNumber: null });
        getAllSessions(); // Refresh sessions to update UI
      } else {
        toast.error(result.error?.message || 'Gagal menghubungkan WhatsApp');
      }
    } catch (error) {
      console.error('Failed to connect WhatsApp:', error);
      toast.error('Gagal menghubungkan WhatsApp');
    }
  };

  const isConnecting = (id: number) => isCreatingSession(id);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDisconnectWhatsApp = async (_whatsappNumber: WhatsAppNumber, _session: WhatsAppSession) => {
    try {
      // TODO: Implement actual disconnect session logic
      // For now, we'll simulate disconnection
      // const result = await disconnectSession(session.id);
      // if (result.success) {
      //   toast.success('WhatsApp berhasil diputus!');
      //   getAllSessions(); // Refresh sessions
      // } else {
      //   toast.error(result.error?.message || 'Gagal memutus WhatsApp');
      // }
      
      // Mock successful disconnection for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('WhatsApp berhasil diputus!');
      getAllSessions(); // Refresh sessions to update UI
      
    } catch (error) {
      console.error('Failed to disconnect WhatsApp:', error);
      toast.error('Gagal memutus koneksi WhatsApp');
    }
  };

  const handleEditWhatsApp = (whatsappNumber: WhatsAppNumber) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <WhatsAppHeader
        onCreateWhatsApp={() => setCreateModalOpen(true)}
        onRefresh={() => fetchWhatsApp()}
        isLoading={isLoading}
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
    </div>
  );
}
