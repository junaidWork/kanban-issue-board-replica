import React from 'react';
import { Button } from './Button';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];

  // Always show first page
  pages.push(1);

  // Show pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pages.includes(i)) {
      if (i > pages[pages.length - 1] + 1) {
        pages.push(-1); // Ellipsis
      }
      pages.push(i);
    }
  }

  // Always show last page
  if (totalPages > 1) {
    if (totalPages > pages[pages.length - 1] + 1) {
      pages.push(-1); // Ellipsis
    }
    pages.push(totalPages);
  }

  return (
    <div className='pagination'>
      <Button variant='ghost' size='small' onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </Button>

      <div className='pagination-pages'>
        {pages.map((page, index) =>
          page === -1 ? (
            <span key={`ellipsis-${index}`} className='pagination-ellipsis'>
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}
      </div>

      <Button
        variant='ghost'
        size='small'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};
