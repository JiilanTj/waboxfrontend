'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { useWhatsApp } from '@/hooks';
import { WhatsAppNumber, CreateWhatsAppRequest, UpdateWhatsAppRequest } from '@/lib/types';
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

  const [searchInput, setSearchInput] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingWhatsApp, setEditingWhatsApp] = useState<WhatsAppNumber | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* WhatsApp Numbers Table */}
      <WhatsAppTable
        whatsappNumbers={whatsappNumbers}
        isLoading={isLoading}
        limit={limit}
        onEditWhatsApp={handleEditWhatsApp}
        onDeleteWhatsApp={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        isToggling={isToggling}
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
    </div>
  );
}
