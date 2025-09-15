'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MessageSquare } from 'lucide-react';
import { CreateWhatsAppRequest } from '@/lib/types';

interface CreateWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWhatsAppRequest) => Promise<void>;
  isCreating: boolean;
}

export function CreateWhatsAppModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}: CreateWhatsAppModalProps) {
  const [formData, setFormData] = useState<CreateWhatsAppRequest>({
    name: '',
    phoneNumber: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Nomor WhatsApp wajib diisi';
    } else {
      // Basic phone number validation
      const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s+/g, ''))) {
        newErrors.phoneNumber = 'Format nomor WhatsApp tidak valid (contoh: +6281234567890)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = {
      ...formData,
      phoneNumber: formData.phoneNumber.replace(/\s+/g, ''), // Remove spaces
    };

    try {
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error creating WhatsApp number:', error);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFormData({
        name: '',
        phoneNumber: '',
        isActive: true,
      });
      setErrors({});
      onClose();
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove non-numeric characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phoneNumber: formatted }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-full">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Tambah Nomor WhatsApp
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Tambahkan nomor WhatsApp baru untuk sistem multi-account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nama <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Contoh: Customer Service 1"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isCreating}
              className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Contoh: +6281234567890"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              disabled={isCreating}
              className={errors.phoneNumber ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600">{errors.phoneNumber}</p>
            )}
            <p className="text-xs text-gray-500">
              Format: +62xxxxxxxxxx atau 08xxxxxxxxxx
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              disabled={isCreating}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Aktifkan nomor WhatsApp setelah dibuat
            </Label>
          </div>
        </form>

        <DialogFooter className="gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Batal
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isCreating}
            className="bg-green-600 hover:bg-green-700 min-w-[120px]"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menyimpan...
              </>
            ) : (
              'Tambah WhatsApp'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
