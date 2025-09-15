'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Check, Loader2 } from 'lucide-react';
import { UpdateUserRequest, User } from '@/lib/types';

interface UpdateUserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateUserRequest) => Promise<void>;
  isUpdating: boolean;
}

export function EditUserModal({ user, onClose, onSubmit, isUpdating }: EditUserModalProps) {
  const [form, setForm] = useState<UpdateUserFormData>(() => ({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'USER'
  }));

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        username: user.username,
        email: user.email,
        password: '',
        role: user.role
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !form.name || !form.username || !form.email) {
      return;
    }

    const payload: UpdateUserRequest = {
      name: form.name,
      username: form.username,
      email: form.email,
      role: form.role,
    };

    // Only include password if it's provided
    if (form.password.trim()) {
      payload.password = form.password;
    }

    await onSubmit(user.id, payload);
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Edit Pengguna</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
              disabled={isUpdating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Username</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Masukkan username"
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Masukkan email"
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Password Baru</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Kosongkan jika tidak diubah"
                disabled={isUpdating}
              />
              <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah password</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <select 
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as 'USER' | 'ADMIN' }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isUpdating}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleSubmit}
              disabled={isUpdating || !form.name || !form.username || !form.email}
              className="flex-1"
            >
              {isUpdating ? (
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
            <Button variant="outline" onClick={onClose} disabled={isUpdating} className="flex-1">
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
