'use client';

import React from 'react';

interface MenuHeroProps {
  restaurantName: string;
  logoUrl?: string;
  tagline?: string;
  images?: string[];
}

const MenuHero: React.FC<MenuHeroProps> = ({ restaurantName, logoUrl, tagline, images }) => {
  const bgImage = images && images.length > 0 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000'; // Classy dark cocktails/restaurant vibe

  return (
    <section style={{
      position: 'relative',
      height: '40vh',
      minHeight: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFFFFF', // Force white text
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      {/* Background Image with Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.7,
        zIndex: 1,
        filter: 'grayscale(0.3) brightness(0.5) contrast(1.1)', // Vintage effect
        animation: 'slowZoom 20s infinite alternate ease-in-out'
      }} />
      
      <style jsx>{`
        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
      `}</style>
      
      {/* Gradient Overlay for Readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
        zIndex: 2
      }} />

      {/* Logo Overlay */}
      <div style={{ position: 'relative', zIndex: 10, marginBottom: '1.5rem' }}>
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Logo" 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              border: '4px solid white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              objectFit: 'cover'
            }} 
          />
        ) : (
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '0.05em'
          }}>
            {restaurantName
              .split(' ')
              .map(word => word[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '0 1rem' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: 'var(--text-5xl)', 
          letterSpacing: '0.05em',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)',
          marginBottom: '0.5rem',
          color: '#FFFFFF' // Ensure always white
        }}>
          {restaurantName}
        </h1>
        {tagline && (
          <p style={{ 
            fontFamily: 'var(--font-primary)', 
            fontSize: 'var(--text-lg)', 
            fontStyle: 'italic',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto',
            color: '#F3F4F6', // Light gray/white for tagline
            textShadow: '0 1px 4px rgba(0,0,0,0.5)'
          }}>
            {tagline}
          </p>
        )}
      </div>
    </section>
  );
};

export default MenuHero;
