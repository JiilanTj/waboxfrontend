'use client';

import AuthGuard from '@/components/AuthGuard';
import { useUsers } from '@/hooks';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users as UsersIcon, 
  Search, 
  Loader2, 
  RefreshCw, 
  UserPlus, 
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateUserRequest, UpdateUserRequest, User } from '@/lib/types';

export default function UsersPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <UsersContent />
    </AuthGuard>
  );
}

interface CreateUserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface UpdateUserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserFormData>({ 
    name: '', 
    username: '', 
    email: '', 
    password: '', 
    role: 'USER' 
  });
  const [updateForm, setUpdateForm] = useState<UpdateUserFormData>({ 
    name: '', 
    username: '', 
    email: '', 
    password: '', 
    role: 'USER' 
  });

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput.trim() !== '') {
        setFilters({ search: searchInput.trim(), page: 1 });
      } else {
        setFilters({ search: '', page: 1 });
      }
    }, 500);
    return () => clearTimeout(handle);
  }, [searchInput, setFilters]);

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.username || !createForm.email || !createForm.password) {
      return;
    }

    const payload: CreateUserRequest = {
      name: createForm.name,
      username: createForm.username,
      email: createForm.email,
      password: createForm.password,
      role: createForm.role,
    };

    const result = await createUser(payload);
    if (result.success) {
      setCreateOpen(false);
      setCreateForm({ name: '', username: '', email: '', password: '', role: 'USER' });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const payload: UpdateUserRequest = {
      name: updateForm.name,
      username: updateForm.username,
      email: updateForm.email,
      role: updateForm.role,
    };

    // Only include password if it's provided
    if (updateForm.password.trim()) {
      payload.password = updateForm.password;
    }

    const result = await updateUser(editingUser.id, payload);
    if (result.success) {
      setEditingUser(null);
      setUpdateForm({ name: '', username: '', email: '', password: '', role: 'USER' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      await deleteUser(userId);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUpdateForm({
      name: user.name,
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
    });
  };

  const handleRoleFilter = (roleValue: string) => {
    setFilters({ role: roleValue || undefined, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <UsersIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manajemen Pengguna</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola akun pengguna sistem dan hak akses</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Tambah Pengguna
          </Button>
          <Button variant="outline" onClick={() => fetchUsers()} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-3 items-end">
        <div>
          <Label>Pencarian</Label>
          <div className="flex items-center gap-2 border rounded-md px-2 py-1.5 bg-white">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama, username, atau email..."
              className="border-0 p-0 focus-visible:ring-0"
            />
          </div>
        </div>
        <div>
          <Label>Role</Label>
          <select 
            value={role || ''} 
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>
        <div>
          <Label>Per Halaman</Label>
          <select 
            value={limit} 
            onChange={(e) => setFilters({ limit: parseInt(e.target.value), page: 1 })}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Pengguna</th>
                  <th className="text-left p-4 font-medium text-gray-900">Email</th>
                  <th className="text-left p-4 font-medium text-gray-900">Role</th>
                  <th className="text-left p-4 font-medium text-gray-900">Bergabung</th>
                  <th className="text-center p-4 font-medium text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: limit }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                          <div className="space-y-1">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                      <td className="p-4">
                        <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
                      </td>
                      <td className="p-4">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            user.role === 'ADMIN' ? 'bg-purple-100' : 'bg-blue-100'
                          )}>
                            {user.role === 'ADMIN' ? 
                              <Shield className="h-4 w-4 text-purple-600" /> : 
                              <UserIcon className="h-4 w-4 text-blue-600" />
                            }
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">{user.email}</td>
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          user.role === 'ADMIN' 
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-gray-100 text-gray-800"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            disabled={isUpdating(user.id)}
                            className="h-8 w-8"
                          >
                            {isUpdating(user.id) ? 
                              <Loader2 className="h-3 w-3 animate-spin" /> : 
                              <Edit className="h-3 w-3" />
                            }
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isDeleting(user.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            {isDeleting(user.id) ? 
                              <Loader2 className="h-3 w-3 animate-spin" /> : 
                              <Trash2 className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {users.length} dari {pagination.totalUsers} pengguna
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(page - 1)}
            >
              Sebelumnya
            </Button>
            <span className="flex items-center px-3 text-sm">
              Halaman {page} dari {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(page + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tambah Pengguna Baru</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCreateOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input
                    value={createForm.username}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Masukkan username"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Masukkan email"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Masukkan password"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <select 
                    value={createForm.role}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as 'USER' | 'ADMIN' }))}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleCreateUser}
                  disabled={isCreating || !createForm.name || !createForm.username || !createForm.email || !createForm.password}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Pengguna</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setEditingUser(null)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input
                    value={updateForm.name}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input
                    value={updateForm.username}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Masukkan username"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Masukkan email"
                  />
                </div>
                <div>
                  <Label>Password Baru (kosongkan jika tidak diubah)</Label>
                  <Input
                    type="password"
                    value={updateForm.password}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Masukkan password baru"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <select 
                    value={updateForm.role}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, role: e.target.value as 'USER' | 'ADMIN' }))}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleUpdateUser}
                  disabled={isUpdating(editingUser.id) || !updateForm.name || !updateForm.username || !updateForm.email}
                  className="flex-1"
                >
                  {isUpdating(editingUser.id) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters({ search: searchInput, page: 1 });
      fetchUsers({ search: searchInput, page: 1 });
    }, 450);
    return () => clearTimeout(handle);
  }, [searchInput, setFilters, fetchUsers]);

  const roleFilter = role || '';

  const onChangeRole = (val: string) => {
    setFilters({ role: val || undefined, page: 1 });
    fetchUsers({ role: val || undefined, page: 1 });
  };

  const onChangeLimit = (val: string) => {
    const l = parseInt(val) || 10;
    setFilters({ limit: l, page: 1 });
    fetchUsers({ limit: l, page: 1 });
  };

  const resetFilters = () => {
    setSearchInput('');
    setFilters({ role: undefined, search: '', page: 1 });
    fetchUsers({ role: undefined, search: '', page: 1 });
  };

  const skeletonRows = useMemo(() => Array.from({ length: limit }, (_, i) => i), [limit]);

  const handleCreate = async () => {
    if (!form.name || !form.username || !form.email || !form.password) return;
    setCreating(true);
    // TODO integrate create API via users hook when available
    setTimeout(() => {
      setCreating(false);
      setCreateOpen(false);
      setForm({ name: '', username: '', email: '', password: '', role: 'USER' });
      fetchUsers();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded-lg"><UsersIcon className="h-5 w-5 text-green-600" /></div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">Manajemen Pengguna</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola akun pengguna sistem dan hak akses.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Pengguna Baru
          </Button>
          <Button variant="outline" onClick={resetFilters} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} /> Reset
          </Button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6 items-start">
        <div className="md:col-span-2 lg:col-span-3 flex items-center gap-2 border rounded-md px-2 py-1.5 bg-white">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari nama / username / email..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          {searchInput && (
            <Button variant="ghost" size="sm" onClick={() => setSearchInput('')}>Clear</Button>
          )}
        </div>
        <Select value={roleFilter} onChange={onChangeRole} className="text-sm">
          <option value="">Semua Role</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </Select>
        <Select value={String(limit)} onChange={onChangeLimit} className="text-sm">
          {[10,20,30,50].map(l => <option key={l} value={l}>{l}/hal</option>)}
        </Select>
        <Button variant="outline" size="sm" onClick={() => fetchUsers()} disabled={isLoading} className="gap-2">
          <Loader2 className={cn('h-4 w-4', isLoading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {/* Data Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-600">
              <tr>
                <th className="py-3 px-4 text-left font-medium w-16">ID</th>
                <th className="py-3 px-4 text-left font-medium min-w-[160px]">Nama</th>
                <th className="py-3 px-4 text-left font-medium">Username</th>
                <th className="py-3 px-4 text-left font-medium min-w-[200px]">Email</th>
                <th className="py-3 px-4 text-left font-medium w-28">Role</th>
                <th className="py-3 px-4 text-left font-medium w-36">Dibuat</th>
                <th className="py-3 px-4 text-left font-medium w-14">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                skeletonRows.map(i => (
                  <tr key={i} className="border-b animate-pulse">
                    <td className="py-2 px-4"><div className="h-4 w-8 bg-gray-200 rounded" /></td>
                    <td className="py-2 px-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="py-2 px-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="py-2 px-4"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
                    <td className="py-2 px-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
                    <td className="py-2 px-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="py-2 px-4"><div className="h-6 w-6 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              )}
              {!isLoading && error && (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="space-y-3">
                      <p className="text-red-600 font-medium">{error}</p>
                      <Button size="sm" onClick={() => fetchUsers()} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Coba Lagi
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && !error && data.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <UsersIcon className="h-10 w-10 text-gray-300" />
                      <p className="font-medium">Belum ada pengguna</p>
                      <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" /> Tambah Pertama
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && !error && data.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-gray-700">{user.id}</td>
                  <td className="py-2 px-4 font-medium text-gray-900 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center text-xs font-semibold text-green-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate max-w-[160px]">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-gray-700">{user.username}</td>
                  <td className="py-2 px-4 text-gray-700">{user.email}</td>
                  <td className="py-2 px-4">
                    <Badge variant={user.role === 'ADMIN' ? 'admin' : 'default'}>
                      {user.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" /> ADMIN</span>
                      ) : (
                        <span className="inline-flex items-center gap-1"><UserIcon className="h-3 w-3" /> USER</span>
                      )}
                    </Badge>
                  </td>
                  <td className="py-2 px-4 text-gray-600 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && !isLoading && !error && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
          <div>
            Halaman <span className="font-medium text-gray-900">{pagination.currentPage}</span> dari <span className="font-medium text-gray-900">{pagination.totalPages}</span> · Total <span className="font-medium text-gray-900">{pagination.totalUsers}</span> pengguna
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => fetchUsers({ page: (pagination.currentPage - 1) })}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => fetchUsers({ page: (pagination.currentPage + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create User Dialog (simple custom) */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !creating && setCreateOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg border p-6 space-y-5 animate-in fade-in zoom-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Buat Pengguna Baru</h3>
              <Button variant="ghost" size="sm" onClick={() => !creating && setCreateOpen(false)}>X</Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Nama</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Username</label>
                <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="johndoe" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Email</label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Password</label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Role</label>
                <Select value={form.role} onChange={(val: string) => setForm(f => ({ ...f, role: val as 'USER' | 'ADMIN' }))} className="w-full">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" disabled={creating} onClick={() => setCreateOpen(false)}>Batal</Button>
              <Button onClick={handleCreate} disabled={creating || !form.name || !form.username || !form.email || !form.password} className="gap-2">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
