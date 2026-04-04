'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from '../../m/[restaurantId]/page.module.css'; // Reuse existing styles
import FoodTypeIcon from '@/components/FoodTypeIcon';
import MenuHero from '@/components/MenuHero';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function StableCustomerMenuPage({ params }: { params: { slug: string } }) {
  const [menu, setMenu] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    async function loadPublicData() {
      try {
        // 1. Fetch Menu by Restaurant Slug (Stable URL)
        const menuRes = await fetch(`${API_BASE}/public/restaurant/${params.slug}/menu`);
        if (!menuRes.ok) throw new Error('Menu fetch failed');
        const menuData = await menuRes.json();
        setMenu(menuData);
        
        if (menuData.categories?.length > 0) {
          setActiveCategory(menuData.categories[0].id);
        }

        // 2. Fetch Restaurant Data for Maps link and Info
        if (menuData.restaurant_id) {
          const restRes = await fetch(`${API_BASE}/restaurants/public/id/${menuData.restaurant_id}`);
          if (restRes.ok) {
            setRestaurant(await restRes.json());
          }

          // 3. Fetch Gallery
          const galRes = await fetch(`${API_BASE}/restaurants/${menuData.restaurant_id}/gallery`);
          if (galRes.ok) {
            setGallery(await galRes.json());
          }
        }
      } catch (err) {
        console.error('Error loading stable menu:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-gray-50)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
        <h3>Menu not found 😕</h3>
        <p>This restaurant might not have an active menu yet.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-white)' }}>
      {/* Hero Section */}
      <MenuHero 
        restaurantName={restaurant?.name || menu.name}
        logoUrl={restaurant?.logo_url}
        tagline={restaurant?.description}
        images={gallery.map(img => img.url)}
      />

      {/* Header / Navigation */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'var(--color-secondary)', 
        padding: '0.75rem 0',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '1rem'
        }}>
          {/* Category navigator (Sleek Horizontal Scroll) */}
          <div style={{ 
            display: 'flex', 
            overflowX: 'auto', 
            gap: '1.5rem', 
            padding: '0 0.5rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            flex: 1,
            opacity: isSearchExpanded ? 0.3 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: isSearchExpanded ? 'none' : 'auto'
          }}>
            {menu.categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const el = document.getElementById(`cat-${cat.id}`);
                  if (el) {
                    const offset = 80; // height of sticky header
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = el.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
                style={{
                  color: activeCategory === cat.id ? 'var(--color-accent)' : '#94A3B8',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 0,
                  border: 'none',
                  borderBottom: activeCategory === cat.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.5rem 0',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Improved Expandable Search Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            position: 'relative',
            width: isSearchExpanded ? '100%' : '40px',
            maxWidth: isSearchExpanded ? '280px' : '40px',
            height: '40px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            marginLeft: 'auto'
          }}>
            <button
              onClick={() => setIsSearchExpanded(true)}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                background: 'none',
                border: 'none',
                color: isSearchExpanded ? 'var(--color-accent)' : '#94A3B8',
                fontSize: '1.2rem',
                cursor: 'pointer',
                zIndex: 10,
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: isSearchExpanded ? 'none' : 'auto',
                transition: 'color 0.3s ease'
              }}
            >
              🔍
            </button>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setIsSearchExpanded(false); }}
              style={{
                width: isSearchExpanded ? '100%' : '0',
                padding: isSearchExpanded ? '0.5rem 2.5rem 0.5rem 2.5rem' : '0',
                opacity: isSearchExpanded ? 1 : 0,
                borderRadius: 'var(--radius-full)',
                border: isSearchExpanded ? '1px solid var(--color-gray-700)' : '1px solid transparent',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: isSearchExpanded ? 'text' : 'pointer'
              }}
              autoFocus={isSearchExpanded}
            />
            {isSearchExpanded && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchExpanded(false);
                }}
                style={{
                  position: 'absolute',
                  right: '0.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  zIndex: 11
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="container" style={{ paddingBottom: '6rem', marginTop: '3rem' }}>
        {menu.categories.map((cat: any) => {
          const filteredItems = cat.items.filter((item: any) => {
            if (!item.is_available) return false;
            if (!searchQuery.trim()) return true;
            
            const query = searchQuery.toLowerCase();
            const nameMatch = item.name.toLowerCase().includes(query);
            const descMatch = item.description?.toLowerCase().includes(query);
            const tagsMatch = item.tags?.some((tag: string) => tag.toLowerCase().includes(query));
            
            return nameMatch || descMatch || tagsMatch;
          });

          if (searchQuery.trim() && filteredItems.length === 0) return null;

          return (
            <div key={cat.id} id={`cat-${cat.id}`} style={{ marginBottom: '4rem', scrollMarginTop: '180px' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 className="menu-category-title">{cat.name}</h2>
              </div>
              <div className="menu-grid">
                {filteredItems.map((item: any) => (
                  <div key={item.id} style={{ marginBottom: '1.5rem' }}>
                    <div className="menu-item-header">
                      <div className="menu-item-name-box">
                        <FoodTypeIcon type={item.food_type} size={14} />
                        <span className="menu-item-name">
                          {item.name}
                          {item.calories && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', fontWeight: 400, marginLeft: '0.5rem', fontFamily: 'var(--font-primary)' }}>
                              ({item.calories} kcal)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="menu-item-dots"></div>
                      <span className="menu-item-price">₹{item.price}</span>
                    </div>
                    {item.description && <p className="menu-item-desc">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* No Results Message */}
        {searchQuery.trim() && !menu.categories.some((cat: any) => 
          cat.items.some((item: any) => {
            if (!item.is_available) return false;
            const query = searchQuery.toLowerCase();
            return item.name.toLowerCase().includes(query) || 
                   item.description?.toLowerCase().includes(query) || 
                   item.tags?.some((tag: string) => tag.toLowerCase().includes(query));
          })
        ) && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-gray-500)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥗</div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>No dishes found</h3>
            <p>Try searching for something else or browse the categories.</p>
            <button 
              onClick={() => setSearchQuery('')}
              style={{ marginTop: '1.5rem', color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Gallery Section */}
        {gallery.length > 0 && (
          <div id="gallery-section" style={{ marginBottom: '2.5rem', scrollMarginTop: '140px' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.25rem', color: 'var(--color-gray-800)', borderBottom: '2px solid var(--color-primary-100)', paddingBottom: '0.5rem', display: 'inline-block' }}>Photo Gallery</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {gallery.map(img => (
                <div key={img.id} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '1', boxShadow: 'var(--shadow-sm)' }}>
                  <img src={img.thumbnail_url || img.url} alt={img.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Linkage Area */}
        {restaurant?.google_maps_url && (
          <div style={{ marginTop: '3rem', padding: '2rem 1rem', background: 'var(--color-white)', borderRadius: 'var(--radius-xl)', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>Love our food?</h3>
            <p style={{ color: 'var(--color-gray-500)', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>Help us grow by leaving a review on Google Maps.</p>
            <a 
              href={restaurant.google_maps_url} 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: 'inline-block',
                background: 'var(--color-primary)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '999px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
                transition: 'all 0.2s ease'
              }}
            >
              ⭐️ Leave a Review
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
