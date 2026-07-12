import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
      <button 
        className="btn btn-outline btn-sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ padding: '0.4rem', border: 'none', background: currentPage === 1 ? 'transparent' : 'hsl(var(--surface-raised))' }}
      >
        <ChevronLeft size={16} />
      </button>
      
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>
        Page {currentPage} of {totalPages}
      </span>

      <button 
        className="btn btn-outline btn-sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ padding: '0.4rem', border: 'none', background: currentPage === totalPages ? 'transparent' : 'hsl(var(--surface-raised))' }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
