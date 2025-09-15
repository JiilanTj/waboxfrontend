'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Check, Loader2 } from 'lucide-react';
import { CreateUserRequest } from '@/lib/types';

interface CreateUserFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest) => Promise<void>;
  isCreating: boolean;
}

export function CreateUserModal({ isOpen, onClose, onSubmit, isCreating }: CreateUserModalProps) {
  const [form, setForm] = useState<CreateUserFormData>({ 
    name: '', 
    username: '', 
    email: '', 
    password: '', 
    role: 'USER' 
  });

  const handleSubmit = async () => {
    if (!form.name || !form.username || !form.email || !form.password) {
      return;
    }

    await onSubmit({
      name: form.name,
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role,
    });

    // Reset form after successful submission
    setForm({ name: '', username: '', email: '', password: '', role: 'USER' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tambah Pengguna Baru</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
              disabled={isCreating}
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
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Username</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Masukkan username"
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Masukkan email"
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Masukkan password"
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <select 
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as 'USER' | 'ADMIN' }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isCreating}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleSubmit}
              disabled={isCreating || !form.name || !form.username || !form.email || !form.password}
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
            <Button variant="outline" onClick={onClose} disabled={isCreating} className="flex-1">
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
