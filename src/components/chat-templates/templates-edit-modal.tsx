'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '../ui/textarea';
import { Loader2, Pencil } from 'lucide-react';
import type { ChatTemplate, UpdateChatTemplateRequest } from '@/lib/types/chat-template';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  commands: z.string().min(2, 'Command wajib diisi').regex(/^\//, "Harus diawali '/'"),
  content: z.string().min(1, 'Konten wajib diisi'),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EditTemplateModalProps {
  open: boolean;
  onClose: () => void;
  template: ChatTemplate | null;
  onSubmit: (payload: UpdateChatTemplateRequest) => Promise<unknown> | void;
  isSubmitting?: boolean;
}

export function EditTemplateModal({ open, onClose, template, onSubmit, isSubmitting }: EditTemplateModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: template?.name ?? '',
      commands: template?.commands ?? '',
      content: template?.content ?? '',
      isActive: template?.isActive ?? true,
    },
    values: template ? {
      name: template.name,
      commands: template.commands,
      content: template.content,
      isActive: template.isActive,
    } : undefined,
  });

  useEffect(() => {
    if (!open) {
      form.reset({ name: template?.name ?? '', commands: template?.commands ?? '', content: template?.content ?? '', isActive: template?.isActive ?? true });
    }
  }, [open, form, template]);

  const handleSubmit = form.handleSubmit(async (values: FormValues) => {
    const payload: UpdateChatTemplateRequest = {
      name: values.name,
      commands: values.commands,
      content: values.content,
      isActive: values.isActive,
    };
    await onSubmit(payload);
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-full">
              <Pencil className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Edit Template</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Ubah data template balasan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Salam Pembuka" {...field} disabled={!!isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commands"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Command</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: /salam" {...field} disabled={!!isSubmitting} />
                  </FormControl>
                  <p className="text-xs text-gray-500">Harus diawali dengan karakter /</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konten</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Tulis isi template..." {...field} disabled={!!isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.watch('isActive')}
                onChange={(e) => form.setValue('isActive', e.target.checked)}
                disabled={!!isSubmitting}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Aktifkan template
              </Label>
            </div>

            <DialogFooter className="gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={!!isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={!!isSubmitting} className="bg-green-600 hover:bg-green-700 min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
