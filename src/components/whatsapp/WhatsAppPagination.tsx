'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { WhatsAppPagination } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WhatsAppPaginationComponentProps {
  pagination: WhatsAppPagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalNumbers: number;
}

export function WhatsAppPaginationComponent({
  pagination,
  currentPage,
  onPageChange,
}: WhatsAppPaginationComponentProps) {
  const {
    totalPages,
    totalNumbers: totalFromPagination,
    limit,
    hasNextPage,
    hasPrevPage,
  } = pagination;

  const startItem = ((currentPage - 1) * limit) + 1;
  const endItem = Math.min(currentPage * limit, totalFromPagination);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (start > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }
      
      if (end < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Info */}
          <div className="text-sm text-gray-600">
            Menampilkan {startItem} - {endItem} dari {totalFromPagination} nomor WhatsApp
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!hasPrevPage}
              className="p-2"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {getVisiblePages().map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  disabled={page === '...'}
                  className={cn(
                    "min-w-[2rem] h-8",
                    page === currentPage && "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  {page}
                </Button>
              ))}
            </div>

            {/* Mobile: Current page display */}
            <div className="sm:hidden px-3 py-1 text-sm text-gray-600 bg-gray-50 rounded">
              {currentPage} / {totalPages}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={!hasNextPage}
              className="p-2"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
