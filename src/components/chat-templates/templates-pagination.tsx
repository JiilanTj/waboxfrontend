"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ChatTemplateListResponse } from '@/lib/types/chat-template';
import { cn } from '@/lib/utils';

interface TemplatesPaginationProps {
  pagination: ChatTemplateListResponse['pagination'];
  currentPage: number;
  onPageChange: (page: number) => void;
  totalItems?: number; // not used, kept for API compatibility
}

export function TemplatesPagination({ pagination, currentPage, onPageChange }: TemplatesPaginationProps) {
  const { totalPages, totalItems, itemsPerPage } = pagination;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      for (let i = start; i <= end; i++) pages.push(i);
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
          <div className="text-sm text-gray-600">
            Menampilkan {startItem} - {endItem} dari {totalItems} template
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1}
              className="p-2"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="hidden sm:flex items-center gap-1">
              {getVisiblePages().map((page, idx) => (
                <Button
                  key={`${page}-${idx}`}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  disabled={page === '...'}
                  className={cn(
                    'min-w-[2rem] h-8',
                    page === currentPage && 'bg-green-600 hover:bg-green-700 text-white'
                  )}
                >
                  {page}
                </Button>
              ))}
            </div>

            <div className="sm:hidden px-3 py-1 text-sm text-gray-600 bg-gray-50 rounded">
              {currentPage} / {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
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
