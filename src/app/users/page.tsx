'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { useUsers } from '@/hooks';
import { User, CreateUserRequest, UpdateUserRequest } from '@/lib/types';
import {
  UsersHeader,
  UsersFilters, 
  UsersTable,
  UsersPaginationComponent,
  CreateUserModal,
  EditUserModal
} from '@/components/users';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function UsersPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <UsersContent />
    </AuthGuard>
  );
}

function UsersContent() {
  const { 
    data: users, 
    pagination, 
    isLoading, 
    error, 
    fetchUsers, 
    setFilters, 
    createUser,
    updateUser,
    deleteUser,
    isCreating,
    isUpdating,
    isDeleting,
    limit, 
    role,
    page
  } = useUsers({ autoFetch: true });

  const [searchInput, setSearchInput] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });

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

  const handleCreateUser = async (data: CreateUserRequest) => {
    const result = await createUser(data);
    if (result.success) {
      setCreateModalOpen(false);
      toast.success('Pengguna berhasil ditambahkan!');
    } else {
      toast.error(result.error?.message || 'Gagal menambahkan pengguna');
    }
  };

  const handleUpdateUser = async (id: number, data: UpdateUserRequest) => {
    const result = await updateUser(id, data);
    if (result.success) {
      setEditingUser(null);
      toast.success('Pengguna berhasil diperbarui!');
    } else {
      toast.error(result.error?.message || 'Gagal memperbarui pengguna');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await deleteUser(userId);
    if (result.success) {
      setDeleteConfirm({ open: false, user: null });
      toast.success('Pengguna berhasil dihapus!');
    } else {
      toast.error(result.error?.message || 'Gagal menghapus pengguna');
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeleteConfirm({ open: true, user });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleRoleFilter = useCallback((roleValue: string) => {
    setFilters({ role: roleValue || undefined, page: 1 });
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
      <UsersHeader
        onCreateUser={() => setCreateModalOpen(true)}
        onRefresh={() => fetchUsers()}
        isLoading={isLoading}
      />

      {/* Filters */}
      <UsersFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        role={role}
        onRoleChange={handleRoleFilter}
        limit={limit}
        onLimitChange={handleLimitChange}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Users Table */}
      <UsersTable
        users={users}
        isLoading={isLoading}
        limit={limit}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteClick}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      {/* Pagination */}
      {pagination && (
        <UsersPaginationComponent
          pagination={pagination}
          currentPage={page}
          onPageChange={handlePageChange}
          totalUsers={users.length}
        />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        isCreating={isCreating}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
        isUpdating={editingUser ? isUpdating(editingUser.id) : false}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, user: null })}
        title="Hapus Pengguna"
        description={
          deleteConfirm.user 
            ? `Apakah Anda yakin ingin menghapus pengguna "${deleteConfirm.user.name}"? Tindakan ini tidak dapat dibatalkan.`
            : 'Apakah Anda yakin ingin menghapus pengguna ini?'
        }
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
        onConfirm={() => {
          if (deleteConfirm.user) {
            return handleDeleteUser(deleteConfirm.user.id);
          }
        }}
        isLoading={deleteConfirm.user ? isDeleting(deleteConfirm.user.id) : false}
      />
    </div>
  );
}
