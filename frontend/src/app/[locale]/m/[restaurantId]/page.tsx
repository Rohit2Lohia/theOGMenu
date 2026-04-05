'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';
import FoodTypeIcon from '@/components/FoodTypeIcon';
import MenuHero from '@/components/MenuHero';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function CustomerMenuPage({ params }: { params: { restaurantId: string } }) {
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
        // 1. Fetch Menu
        const menuRes = await fetch(`${API_BASE}/public/menus/${params.restaurantId}`);
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
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, [params.restaurantId]);

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
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--color-white)',
      '--color-accent': restaurant?.brand_accent_color || '#C5A059'
    } as any}>
      {/* Hero Section */}
      <MenuHero 
        restaurantName={restaurant?.name || menu.name}
        logoUrl={restaurant?.logo_url}
        coverUrl={restaurant?.cover_url}
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
                  borderBottom: activeCategory === cat.id ? '3.5px solid var(--color-accent)' : '3.5px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0.75rem 0.25rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            width: isSearchExpanded ? '100%' : '44px',
            maxWidth: isSearchExpanded ? '280px' : '44px',
            height: '44px',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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
                width: '44px',
                height: '44px',
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
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchExpanded(true)}
              onBlur={() => { if (!searchQuery) setIsSearchExpanded(false); }}
              style={{
                width: isSearchExpanded ? '100%' : '0',
                padding: isSearchExpanded ? '0.6rem 2.5rem 0.6rem 2.8rem' : '0',
                opacity: isSearchExpanded ? 1 : 0,
                borderRadius: 'var(--radius-full)',
                border: isSearchExpanded ? '2px solid var(--color-accent)' : '2px solid transparent',
                background: 'rgba(255, 255, 255, 0.12)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                outline: 'none',
                boxShadow: isSearchExpanded ? '0 0 15px rgba(197, 160, 89, 0.2)' : 'none',
                transition: 'all 0.3s ease',
                cursor: 'text'
              }}
            />
            {isSearchExpanded && searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.4rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
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
          <div id="gallery-section" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 className="menu-category-title" style={{ fontSize: '1.75rem' }}>Photo Gallery</h2>
              <div style={{ width: '30px', height: '2px', background: 'var(--color-accent)', margin: '0.5rem auto' }}></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {gallery.map((img: any) => (
                <div key={img.id} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '1', boxShadow: 'var(--shadow-sm)' }}>
                  <img src={img.url} alt={img.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New "Our Story" & Info Section */}
        {restaurant && (restaurant.our_story || restaurant.address || restaurant.phone_number || restaurant.instagram_url) && (
          <section style={{ 
            marginTop: '6rem', 
            padding: '5rem 2rem', 
            background: '#FDFCFB', // Very light warm paper/parchment feel
            borderRadius: '3rem',
            textAlign: 'center',
            border: '1px solid #F1E9DB',
            boxShadow: 'inset 0 0 100px rgba(197,160,89,0.03)'
          }}>
            {restaurant.our_story && (
              <div style={{ marginBottom: '5rem', maxWidth: '800px', margin: '0 auto 5rem', position: 'relative' }}>
                {/* Decorative Quotes */}
                <div style={{ 
                  fontSize: '8rem', 
                  fontFamily: 'var(--font-serif)', 
                  color: 'var(--color-accent)', 
                  opacity: 0.1, 
                  position: 'absolute', 
                  top: '-3rem', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  zIndex: 0,
                  userSelect: 'none'
                }}>“</div>
                
                <h2 className="menu-category-title" style={{ 
                  fontSize: '2.5rem', 
                  marginBottom: '2.5rem', 
                  position: 'relative', 
                  zIndex: 1, 
                  borderBottom: 'none',
                  color: 'var(--color-secondary)'
                }}>
                  Our Story
                </h2>
                
                <p style={{ 
                  fontFamily: 'var(--font-serif)', 
                  lineHeight: '2.1', 
                  color: 'var(--color-gray-800)',
                  fontSize: '1.35rem',
                  whiteSpace: 'pre-wrap',
                  fontStyle: 'italic',
                  position: 'relative',
                  zIndex: 1,
                  padding: '0 1rem'
                }}>
                  {restaurant.our_story}
                </p>
                
                <div style={{ 
                  width: '80px', 
                  height: '2px', 
                  background: 'var(--color-accent)', 
                  margin: '3rem auto 0',
                  opacity: 0.4
                }}></div>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '3rem',
              borderTop: '1px solid #EEE',
              paddingTop: '4rem'
            }}>
              {/* Social Links */}
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                {restaurant.whatsapp_number && (
                  <a href={`https://wa.me/${restaurant.whatsapp_number}`} target="_blank" rel="noopener noreferrer" 
                     style={{ width: '50px', height: '50px', background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', borderRadius: '50%', fontSize: '1.5rem' }} title="WhatsApp">
                    💬
                  </a>
                )}
                {restaurant.instagram_url && (
                  <a href={`https://instagram.com/${restaurant.instagram_url}`} target="_blank" rel="noopener noreferrer" 
                     style={{ width: '50px', height: '50px', background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', borderRadius: '50%', fontSize: '1.5rem' }} title="Instagram">
                    📸
                  </a>
                )}
                {restaurant.facebook_url && (
                  <a href={restaurant.facebook_url} target="_blank" rel="noopener noreferrer" 
                     style={{ width: '50px', height: '50px', background: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', borderRadius: '50%', fontSize: '1.5rem' }} title="Facebook">
                    📘
                  </a>
                )}
              </div>

              <div style={{ maxWidth: '450px' }}>
                {restaurant.address && (
                  <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    📍 {restaurant.address}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {restaurant.phone_number && (
                    <a href={`tel:${restaurant.phone_number}`} className="btn btn-outline" style={{ padding: '0.5rem 1.5rem' }}>
                      📞 Call Us
                    </a>
                  )}
                  {restaurant.google_maps_url && (
                    <a 
                      href={restaurant.google_maps_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        padding: '0.6rem 1.5rem',
                        background: 'var(--color-accent)',
                        color: 'white',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                        textDecoration: 'none',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      🗺️ Get Directions
                    </a>
                  )}
                </div>
              </div>

              {restaurant.opening_hours && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem 2.5rem', 
                  borderRadius: '1.5rem', 
                  background: 'white', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  border: '1px solid #F1F5F9'
                }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.02em' }}>
                    🕒 {restaurant.opening_hours}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
