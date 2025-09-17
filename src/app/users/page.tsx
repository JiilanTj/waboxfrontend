'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { useUsers, useWAPermission, useWhatsApp } from '@/hooks';
import { useAuthContext } from '@/hooks/AuthContext';
import Forbidden from '@/components/ui/forbidden';
import { User, CreateUserRequest, UpdateUserRequest } from '@/lib/types';
import {
  UsersHeader,
  UsersFilters, 
  UsersTable,
  UsersPaginationComponent,
  CreateUserModal,
  EditUserModal,
  ManagePermissionsModal
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
  const { user, isLoading } = useAuthContext();

  // While auth is loading, keep layout clean
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return <Forbidden title="403 Forbidden" description="Anda tidak memiliki akses ke halaman ini" />;
  }

  return <AdminUsersContent />;
}

function AdminUsersContent() {
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

  const {
    userPermissions,
    fetchPermissionsByUserId,
    createPermission,
    deletePermission,
    isLoading: isLoadingPermissions,
    isCreating: isCreatingPermission,
    isDeletingPermission
  } = useWAPermission({ autoFetch: false });

  const {
    data: whatsappNumbers,
    fetchWhatsApp
  } = useWhatsApp({ autoFetch: false });

  const [searchInput, setSearchInput] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [managingPermissionsUser, setManagingPermissionsUser] = useState<User | null>(null);
  const [managePermissionsConfirm, setManagePermissionsConfirm] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
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

  const handleManagePermissions = (user: User) => {
    setManagePermissionsConfirm({ open: true, user });
  };

  const handleConfirmManagePermissions = async (user: User) => {
    setManagePermissionsConfirm({ open: false, user: null });
    setManagingPermissionsUser(user);
    await Promise.all([
      fetchPermissionsByUserId(user.id),
      fetchWhatsApp()
    ]);
  };

  const handleCreatePermission = async (userId: number, whatsappNumberId: number) => {
    const result = await createPermission({ userId, whatsappNumberId });
    if (result) {
      toast.success('Izin WhatsApp berhasil ditambahkan!');
      // Refresh permissions after creation
      await fetchPermissionsByUserId(userId);
    } else {
      toast.error('Gagal menambahkan izin WhatsApp');
    }
  };

  const handleRemovePermission = async (permissionId: number) => {
    const result = await deletePermission(permissionId);
    if (result) {
      toast.success('Izin WhatsApp berhasil dihapus!');
      // Refresh permissions after deletion
      if (managingPermissionsUser) {
        await fetchPermissionsByUserId(managingPermissionsUser.id);
      }
    } else {
      toast.error('Gagal menghapus izin WhatsApp');
    }
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
        onManagePermissions={handleManagePermissions}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        isLoadingPermissions={isLoadingPermissions}
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

      {/* Manage Permissions Confirmation Dialog */}
      <ConfirmDialog
        open={managePermissionsConfirm.open}
        onOpenChange={(open) => setManagePermissionsConfirm({ open, user: null })}
        title="Kelola Izin WhatsApp"
        description={
          managePermissionsConfirm.user 
            ? `Apakah Anda ingin mengelola izin WhatsApp untuk pengguna "${managePermissionsConfirm.user.name}"? Anda dapat menambah atau menghapus akses nomor WhatsApp untuk pengguna ini.`
            : 'Apakah Anda ingin mengelola izin WhatsApp untuk pengguna ini?'
        }
        confirmText="Kelola Izin"
        cancelText="Batal"
        variant="default"
        onConfirm={() => {
          if (managePermissionsConfirm.user) {
            return handleConfirmManagePermissions(managePermissionsConfirm.user);
          }
        }}
        isLoading={managePermissionsConfirm.user ? isLoadingPermissions : false}
      />

      {/* Manage Permissions Modal */}
      <ManagePermissionsModal
        open={!!managingPermissionsUser}
        onClose={() => setManagingPermissionsUser(null)}
        user={managingPermissionsUser}
        permissions={userPermissions}
        availableWhatsApps={whatsappNumbers}
        isLoading={isLoadingPermissions}
        isCreating={isCreatingPermission}
        isDeletingPermission={isDeletingPermission}
        onCreatePermission={handleCreatePermission}
        onRemovePermission={handleRemovePermission}
      />
    </div>
  );
}
