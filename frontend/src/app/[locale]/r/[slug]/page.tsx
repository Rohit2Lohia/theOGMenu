'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from '../../m/[restaurantId]/page.module.css'; // Reuse existing styles
import FoodTypeIcon from '@/components/FoodTypeIcon';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function StableCustomerMenuPage({ params }: { params: { slug: string } }) {
  const [menu, setMenu] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div style={{ minHeight: '100vh', background: 'var(--color-gray-50)' }}>
      {/* Header Info */}
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 10, padding: '1rem', borderBottom: '1px solid var(--color-gray-200)', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', textAlign: 'center', fontSize: 'var(--text-xl)', color: 'var(--color-gray-900)' }}>
          {restaurant?.name || menu.name}
        </h1>
        
        {/* Category navigator (Pill Menu) */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', marginTop: '1rem', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {menu.categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                background: activeCategory === cat.id ? 'var(--color-primary)' : 'var(--color-gray-100)',
                color: activeCategory === cat.id ? 'var(--color-white)' : 'var(--color-gray-700)',
                padding: '0.5rem 1.25rem',
                fontSize: 'var(--text-sm)',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: activeCategory === cat.id ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              {cat.name}
            </button>
          ))}
          {gallery.length > 0 && (
             <button
              onClick={() => {
                setActiveCategory('gallery');
                document.getElementById(`gallery-section`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                background: activeCategory === 'gallery' ? 'var(--color-primary)' : 'var(--color-gray-100)',
                color: activeCategory === 'gallery' ? 'var(--color-white)' : 'var(--color-gray-700)',
                padding: '0.5rem 1.25rem',
                fontSize: 'var(--text-sm)',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
             >
               Photo Gallery
             </button>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search dishes, tags, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-gray-200)',
                background: 'var(--color-gray-50)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-gray-200)')}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-gray-400)',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main style={{ padding: '1rem', paddingBottom: '6rem' }}>
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
            <div key={cat.id} id={`cat-${cat.id}`} style={{ marginBottom: '2.5rem', scrollMarginTop: '180px' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.25rem', color: 'var(--color-gray-800)', borderBottom: '2px solid var(--color-primary-100)', paddingBottom: '0.5rem', display: 'inline-block' }}>{cat.name}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredItems.map((item: any) => (
                  <div key={item.id} className="card hover-effect" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <FoodTypeIcon type={item.food_type} />
                        <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-900)' }}>{item.name}</strong>
                        {item.calories && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', fontWeight: 500, marginLeft: '0.25rem' }}>
                            ({item.calories} kcal)
                          </span>
                        )}
                      </div>
                      {item.description && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginTop: '0.25rem', marginBottom: '0.25rem', lineHeight: '1.4' }}>{item.description}</p>}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>₹{item.price}</div>
                    </div>
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
