'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({ name: '', google_maps_url: '', address: '' });

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
        address: activeRest.address || ''
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
        address: updated.address || ''
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>⚙️ Profile & Settings</h1>
        <p style={{ color: 'var(--color-gray-500)' }}>Manage your restaurant's public details.</p>
      </header>

      <form className="card" style={{ padding: '2rem' }} onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Restaurant Name</label>
            <input 
              type="text" 
              className="input" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Address</label>
            <input 
              type="text" 
              placeholder="123 Main Street, City"
              className="input" 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Google Maps URL</label>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>
              Add a link to your Google Maps review page. Customers will see a button to leave reviews.
            </p>
            <input 
              type="url" 
              placeholder="https://g.page/r/XYZ..."
              className="input" 
              value={formData.google_maps_url} 
              onChange={e => setFormData({...formData, google_maps_url: e.target.value})} 
            />
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-gray-100)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && <span style={{ color: 'var(--color-success, #22c55e)', fontWeight: 500 }}>✓ Saved successfully!</span>}
          </div>
        </div>
      </form>
    </div>
  );
}
