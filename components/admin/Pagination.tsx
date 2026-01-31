'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    hasMore: boolean;
}

export function Pagination({ currentPage, hasMore }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `?${params.toString()}`;
    };

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(createPageURL(currentPage - 1))}
                disabled={currentPage <= 1}
                className="bg-transparent border-gray-800 text-white hover:bg-gray-800 hover:text-white"
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>
            <div className="text-sm text-gray-400">
                Page {currentPage}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(createPageURL(currentPage + 1))}
                disabled={!hasMore}
                className="bg-transparent border-gray-800 text-white hover:bg-gray-800 hover:text-white"
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
