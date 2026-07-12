import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', isDanger = false, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isDanger && <AlertTriangle size={24} style={{ color: 'hsl(var(--error))' }} />}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
          </div>
          <button onClick={onCancel} style={{ color: 'hsl(var(--text-muted))' }}><X size={20} /></button>
        </div>
        <p style={{ marginBottom: '1.5rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={onConfirm}
            style={{ 
              backgroundColor: isDanger ? 'hsl(var(--error))' : undefined,
              borderColor: isDanger ? 'hsl(var(--error))' : undefined
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
