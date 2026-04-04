'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation and notify parent
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        background: bgColor,
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontWeight: 600,
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <span>{icon}</span>
      <span>{message}</span>
      <button 
        onClick={() => setIsVisible(false)} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'rgba(255,255,255,0.7)', 
          cursor: 'pointer', 
          padding: '0 0 0 0.5rem', 
          fontSize: '1rem',
          lineHeight: '1',
          marginLeft: 'auto'
        }}
        onMouseOver={e => e.currentTarget.style.color = 'white'}
        onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
      >
        ×
      </button>
    </div>
  );
}
