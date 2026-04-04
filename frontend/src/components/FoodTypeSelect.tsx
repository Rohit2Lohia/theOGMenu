'use client';

import React, { useState, useRef, useEffect } from 'react';
import FoodTypeIcon, { FoodType } from './FoodTypeIcon';

interface Option {
  value: FoodType;
  label: string;
}

const options: Option[] = [
  { value: 'veg', label: 'Veg' },
  { value: 'non-veg', label: 'Non-Veg' },
  { value: 'egg', label: 'Egg' },
  { value: 'vegan', label: 'Vegan' },
];

interface FoodTypeSelectProps {
  value: FoodType;
  onChange: (value: FoodType) => void;
  className?: string;
}

export default function FoodTypeSelect({ value, onChange, className = '' }: FoodTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div 
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{ 
        position: 'relative', 
        width: '100%',
        minWidth: '120px'
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.625rem 1rem',
          backgroundColor: 'white',
          border: '1px solid var(--color-gray-200)',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 2px var(--color-primary-100)' : 'none',
          borderColor: isOpen ? 'var(--color-primary)' : 'var(--color-gray-200)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FoodTypeIcon type={selectedOption.value} size={18} />
          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-gray-800)' }}>
            {selectedOption.label}
          </span>
        </div>
        <svg 
          style={{ 
            transition: 'transform 0.2s', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--color-gray-400)'
          }} 
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--color-gray-100)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: value === opt.value ? 'var(--color-primary-50)' : 'transparent',
                color: value === opt.value ? 'var(--color-primary)' : 'var(--color-gray-700)',
                fontWeight: value === opt.value ? 600 : 500
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = value === opt.value ? 'var(--color-primary-50)' : 'var(--color-gray-50)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = value === opt.value ? 'var(--color-primary-50)' : 'transparent'}
            >
              <FoodTypeIcon type={opt.value} size={18} />
              <span style={{ fontSize: '0.95rem' }}>{opt.label}</span>
              {value === opt.value && (
                <svg style={{ marginLeft: 'auto' }} width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50001 14.1667L3.33334 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
