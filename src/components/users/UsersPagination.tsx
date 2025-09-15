'use client';

import { Button } from '@/components/ui/button';
import { UsersPagination } from '@/lib/types';

interface UsersPaginationProps {
  pagination: UsersPagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalUsers: number;
}

export function UsersPaginationComponent({ 
  pagination, 
  currentPage, 
  onPageChange, 
  totalUsers 
}: UsersPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Menampilkan {totalUsers} dari {pagination.totalUsers} pengguna
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Sebelumnya
        </Button>
        <span className="flex items-center px-3 text-sm">
          Halaman {currentPage} dari {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}
