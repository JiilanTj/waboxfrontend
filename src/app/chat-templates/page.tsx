'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { useAuthContext } from '@/hooks/AuthContext';
import Forbidden from '@/components/ui/forbidden';
import { useChatTemplate } from '@/hooks/useChatTemplate';
import { TemplatesHeader } from '@/components/chat-templates/templates-header';
import { TemplatesFilters } from '@/components/chat-templates/templates-filters';
import { TemplatesTable } from '@/components/chat-templates/templates-table';
import { TemplatesPagination } from '@/components/chat-templates/templates-pagination';
import { CreateTemplateModal } from '@/components/chat-templates/templates-create-modal';
import { EditTemplateModal } from '@/components/chat-templates/templates-edit-modal';
import type { CreateChatTemplateRequest, UpdateChatTemplateRequest, ChatTemplate } from '@/lib/types/chat-template';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ChatTemplatesPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <ChatTemplatesContent />
    </AuthGuard>
  );
}

function ChatTemplatesContent() {
  const { user, isLoading: isAuthLoading } = useAuthContext();

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return <Forbidden title="403 Forbidden" description="Anda tidak memiliki akses ke halaman ini" />;
  }

  return <AdminChatTemplatesContent />;
}

function AdminChatTemplatesContent() {
  const {
    data,
    pagination,
    isLoading,
    error,
    fetchTemplates,
    setFilters,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isCreating,
    isUpdating,
    isDeleting,
    page,
    limit,
  } = useChatTemplate({ autoFetch: true });

  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ChatTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item: ChatTemplate | null }>({ open: false, item: null });

  // Debounced search
  const debouncedSearch = useCallback((value: string) => {
    if (value.trim() !== '') {
      setFilters({ search: value.trim(), page: 1 });
    } else {
      setFilters({ search: '', page: 1 });
    }
  }, [setFilters]);

  useEffect(() => {
    const handle = setTimeout(() => debouncedSearch(searchInput), 500);
    return () => clearTimeout(handle);
  }, [searchInput, debouncedSearch]);

  // Status filter
  useEffect(() => {
    if (statusFilter === 'ALL') setFilters({ isActive: undefined, page: 1 });
    if (statusFilter === 'ACTIVE') setFilters({ isActive: true, page: 1 });
    if (statusFilter === 'INACTIVE') setFilters({ isActive: false, page: 1 });
  }, [statusFilter, setFilters]);

  const handleCreate = async (payload: CreateChatTemplateRequest) => {
    const res = await createTemplate(payload);
    if (res.success) {
      setCreateOpen(false);
      toast.success('Template berhasil ditambahkan!');
    } else {
      toast.error(res.error?.message || 'Gagal menambahkan template');
    }
  };

  const handleUpdate = async (id: number, payload: UpdateChatTemplateRequest) => {
    const res = await updateTemplate(id, payload);
    if (res.success) {
      setEditing(null);
      toast.success('Template berhasil diperbarui!');
    } else {
      toast.error(res.error?.message || 'Gagal memperbarui template');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteTemplate(id);
    if (res.success) {
      setDeleteConfirm({ open: false, item: null });
      toast.success('Template berhasil dihapus!');
    } else {
      toast.error(res.error?.message || 'Gagal menghapus template');
    }
  };

  const handlePageChange = (newPage: number) => setFilters({ page: newPage });
  const handleLimitChange = (newLimit: number) => setFilters({ limit: newLimit, page: 1 });

  return (
    <div className="space-y-6">
      <TemplatesHeader
        onCreate={() => setCreateOpen(true)}
        onRefresh={() => fetchTemplates()}
        isLoading={isLoading}
      />

      <TemplatesFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        limit={limit}
        onLimitChange={handleLimitChange}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      )}

      <TemplatesTable
        data={data}
        isLoading={isLoading}
        onEdit={(item: ChatTemplate) => setEditing(item)}
        onDelete={(item: ChatTemplate) => setDeleteConfirm({ open: true, item })}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      {pagination && (
        <TemplatesPagination
          pagination={pagination}
          currentPage={page}
          onPageChange={handlePageChange}
          totalItems={data.length}
        />
      )}

      <CreateTemplateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />

      <EditTemplateModal
        open={!!editing}
        onClose={() => setEditing(null)}
        template={editing}
        onSubmit={(payload: UpdateChatTemplateRequest) => editing ? handleUpdate(editing.id, payload) : undefined}
        isSubmitting={editing ? isUpdating(editing.id) : false}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
        title="Hapus Template"
        description={deleteConfirm.item ? `Apakah Anda yakin ingin menghapus template "${deleteConfirm.item.name}"?` : ''}
        confirmText="Hapus"
        variant="destructive"
        isLoading={deleteConfirm.item ? isDeleting(deleteConfirm.item.id) : false}
        onConfirm={async () => {
          if (deleteConfirm.item) {
            await handleDelete(deleteConfirm.item.id);
          }
        }}
      />
    </div>
  );
}
