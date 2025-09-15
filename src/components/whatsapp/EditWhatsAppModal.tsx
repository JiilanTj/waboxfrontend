'use client';

import { useState, useEffect } from 'react';
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
import { WhatsAppNumber, UpdateWhatsAppRequest } from '@/lib/types';

interface EditWhatsAppModalProps {
  whatsappNumber: WhatsAppNumber | null;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateWhatsAppRequest) => Promise<void>;
  isUpdating: boolean;
}

export function EditWhatsAppModal({
  whatsappNumber,
  onClose,
  onSubmit,
  isUpdating,
}: EditWhatsAppModalProps) {
  const [formData, setFormData] = useState<UpdateWhatsAppRequest>({
    name: '',
    phoneNumber: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when whatsappNumber changes
  useEffect(() => {
    if (whatsappNumber) {
      setFormData({
        name: whatsappNumber.name,
        phoneNumber: whatsappNumber.phoneNumber,
        isActive: whatsappNumber.isActive,
      });
      setErrors({});
    }
  }, [whatsappNumber]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!formData.phoneNumber?.trim()) {
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

    if (!whatsappNumber || !validateForm()) return;

    const submitData = {
      ...formData,
      phoneNumber: formData.phoneNumber?.replace(/\s+/g, ''), // Remove spaces
    };

    try {
      await onSubmit(whatsappNumber.id, submitData);
      handleClose();
    } catch (error) {
      console.error('Error updating WhatsApp number:', error);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
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

  if (!whatsappNumber) return null;

  return (
    <Dialog open={!!whatsappNumber} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-full">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Edit Nomor WhatsApp
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Perbarui informasi nomor WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
              Nama <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              type="text"
              placeholder="Contoh: Customer Service 1"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isUpdating}
              className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-phoneNumber" className="text-sm font-medium text-gray-700">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-phoneNumber"
              type="tel"
              placeholder="Contoh: +6281234567890"
              value={formData.phoneNumber || ''}
              onChange={handlePhoneChange}
              disabled={isUpdating}
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
              id="edit-isActive"
              type="checkbox"
              checked={formData.isActive || false}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              disabled={isUpdating}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <Label htmlFor="edit-isActive" className="text-sm font-medium text-gray-700">
              Nomor WhatsApp aktif
            </Label>
          </div>

          {/* Created Date Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Dibuat:</span>{' '}
              {new Date(whatsappNumber.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </form>

        <DialogFooter className="gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUpdating}
          >
            Batal
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700 min-w-[120px]"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
