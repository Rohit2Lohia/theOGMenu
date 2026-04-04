'use client';

import React from 'react';

export type FoodType = 'veg' | 'non-veg' | 'egg' | 'vegan';

interface FoodTypeIconProps {
  type: FoodType;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const FoodTypeIcon: React.FC<FoodTypeIconProps> = ({ 
  type, 
  size = 18, 
  showLabel = false,
  className = ''
}) => {
  const colors = {
    veg: '#22C55E',
    'non-veg': '#EF4444',
    egg: '#B45309',
    vegan: '#10B981',
  };

  const getIcon = () => {
    const color = colors[type] || colors.veg;
    
    switch (type) {
      case 'veg':
        return (
          <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
            <circle cx="10" cy="10" r="4" fill={color} />
          </svg>
        );
      case 'non-veg':
        return (
          <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
            <path d="M10 6L14 13H6L10 6Z" fill={color} />
          </svg>
        );
      case 'egg':
        return (
          <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
            <ellipse cx="10" cy="10.5" rx="3.5" ry="4.5" fill={color} />
          </svg>
        );
      case 'vegan':
        return (
          <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
            <path d="M10 6C10 6 10 9 7 11C7 11 8.5 14 10 14C11.5 14 13 11 13 11C10 9 10 6 10 6Z" fill={color} />
            <path d="M10 6V14" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const labels = {
    veg: 'Veg',
    'non-veg': 'Non-Veg',
    egg: 'Egg',
    vegan: 'Vegan'
  };

  return (
    <div className={`food-type-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      {getIcon()}
      {showLabel && (
        <span style={{ 
          fontSize: '0.875rem', 
          fontWeight: 600, 
          color: 'var(--color-gray-700)',
          textTransform: 'capitalize'
        }}>
          {labels[type]}
        </span>
      )}
    </div>
  );
};

export default FoodTypeIcon;
