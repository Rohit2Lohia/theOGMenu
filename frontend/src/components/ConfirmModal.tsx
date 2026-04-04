'use client';

import { useEffect, useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmModalProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      document.body.style.overflow = 'auto';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const btnColor = type === 'danger' ? 'var(--color-error)' : 'var(--color-primary)';
  const btnHover = type === 'danger' ? '#DC2626' : 'var(--color-primary-dark)';
  const iconBg = type === 'danger' ? 'var(--color-error-light)' : 'var(--color-primary-50)';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: 'white',
          borderRadius: '1.25rem',
          padding: '2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '100%',
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.5rem',
            color: btnColor
          }}>
            {type === 'danger' ? '⚠️' : '❓'}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '0.75rem' }}>
            {title}
          </h3>
          <p style={{ color: 'var(--color-gray-500)', lineHeight: '1.5', fontSize: '0.95rem' }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--color-gray-200)',
              backgroundColor: 'white',
              color: 'var(--color-gray-700)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.75rem',
              border: 'none',
              backgroundColor: btnColor,
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: `0 4px 10px ${type === 'danger' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(79, 70, 229, 0.3)'}`
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = btnHover}
            onMouseOut={e => e.currentTarget.style.backgroundColor = btnColor}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
