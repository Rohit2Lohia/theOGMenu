'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function ProfilePage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    google_maps_url: '', 
    address: '',
    our_story: '',
    phone_number: '',
    email: '',
    instagram_url: '',
    whatsapp_number: '',
    facebook_url: '',
    opening_hours: '',
    description: '',
    brand_accent_color: '#C5A059' // Default gold
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const token = getAccessToken();
    if (!token) return;

    try {
      setLoading(true);
      let rests = await api.getMyRestaurants(token);
      let activeRest = rests[0];

      // Auto-create a restaurant if none exists
      if (!activeRest) {
        activeRest = await api.createRestaurant(token, {
          name: 'My Restaurant',
          slug: 'my-restaurant-' + Math.floor(Math.random() * 1000)
        });
      }

      setRestaurant(activeRest);
      setFormData({
        name: activeRest.name || '',
        google_maps_url: activeRest.google_maps_url || '',
        address: activeRest.address || '',
        our_story: activeRest.our_story || '',
        phone_number: activeRest.phone_number || '',
        email: activeRest.email || '',
        instagram_url: activeRest.instagram_url || '',
        whatsapp_number: activeRest.whatsapp_number || '',
        facebook_url: activeRest.facebook_url || '',
        opening_hours: activeRest.opening_hours || '',
        description: activeRest.description || '',
        brand_accent_color: activeRest.brand_accent_color || '#C5A059'
      });
    } catch (err) {
      console.error('Settings load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurant) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      setSaving(true);
      setSaved(false);
      const updated = await api.updateRestaurant(token, restaurant.id, formData);
      setRestaurant(updated);
      setFormData({
        name: updated.name || '',
        google_maps_url: updated.google_maps_url || '',
        address: updated.address || '',
        our_story: updated.our_story || '',
        phone_number: updated.phone_number || '',
        email: updated.email || '',
        instagram_url: updated.instagram_url || '',
        whatsapp_number: updated.whatsapp_number || '',
        facebook_url: updated.facebook_url || '',
        opening_hours: updated.opening_hours || '',
        description: updated.description || '',
        brand_accent_color: updated.brand_accent_color || '#C5A059'
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontSize: '2rem' }}>👤 Restaurant Profile</h1>
        <p style={{ color: 'var(--color-gray-500)' }}>Manage your brand identity and contact information for your customers.</p>
      </header>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Branding & Story */}
            <section className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✨ Brand Identity</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Restaurant Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Our Story</label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>
                  Share your passion, heritage, and what makes your kitchen special.
                </p>
                <textarea 
                  className="input" 
                  rows={6}
                  placeholder="e.g. Founded in 1995, our family-owned restaurant has been serving authentic flavors of..."
                  value={formData.our_story} 
                  onChange={e => setFormData({...formData, our_story: e.target.value})} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Public Tagline</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="A short punchy line for your menu banner"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
            </section>

            {/* Content & Social */}
            <section className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📞 Contact & Social</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Business Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+91..."
                    className="input" 
                    value={formData.phone_number} 
                    onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>WhatsApp Number</label>
                  <input 
                    type="tel" 
                    placeholder="WhatsApp for orders"
                    className="input" 
                    value={formData.whatsapp_number} 
                    onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Business Email</label>
                <input 
                  type="email" 
                  placeholder="contact@restaurant.com"
                  className="input" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Instagram Username</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }}>@</span>
                    <input 
                      type="text" 
                      style={{ paddingLeft: '2rem' }}
                      className="input" 
                      placeholder="username"
                      value={formData.instagram_url} 
                      onChange={e => setFormData({...formData, instagram_url: e.target.value})} 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Facebook Page</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="facebook.com/page"
                    value={formData.facebook_url} 
                    onChange={e => setFormData({...formData, facebook_url: e.target.value})} 
                  />
                </div>
              </div>
            </section>

            {/* Location & Hours */}
            <section className="card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 Location & Hours</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Address</label>
                <textarea 
                  className="input" 
                  rows={2}
                  placeholder="Full physical address..."
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Opening Hours</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mon-Sun: 11 AM - 11 PM"
                  className="input" 
                  value={formData.opening_hours} 
                  onChange={e => setFormData({...formData, opening_hours: e.target.value})} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Google Maps Link</label>
                <input 
                  type="url" 
                  placeholder="https://maps.google.com/..."
                  className="input" 
                  value={formData.google_maps_url} 
                  onChange={e => setFormData({...formData, google_maps_url: e.target.value})} 
                />
              </div>
            </section>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2.5rem' }} disabled={saving}>
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
              {saved && <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>⚡ Profile Updated!</span>}
            </div>
          </div>

          {/* Right Sidebar: Logo & Branding Preview */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h4 style={{ marginBottom: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logo Preview</h4>
              
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                margin: '0 auto 1.5rem',
                background: restaurant?.logo_url ? `url(${restaurant.logo_url})` : `linear-gradient(135deg, ${formData.brand_accent_color}, var(--color-secondary))`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)',
                border: '4px solid white'
              }}>
                {!restaurant?.logo_url && (
                  <span style={{ fontSize: '2.5rem', color: 'white', fontWeight: 800 }}>
                    {getInitials(formData.name || 'OG')}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Brand Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={formData.brand_accent_color}
                    onChange={e => setFormData({...formData, brand_accent_color: e.target.value})}
                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    className="input sm" 
                    value={formData.brand_accent_color}
                    onChange={e => setFormData({...formData, brand_accent_color: e.target.value})}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', lineHeight: 1.5 }}>
                Logo can be uploaded in the Gallery section. If no logo is set, we'll use your restaurant initials.
              </p>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
