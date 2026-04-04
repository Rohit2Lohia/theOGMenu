'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import Toast, { ToastType } from '@/components/Toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function QRCodesPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [qr, setQr] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customText, setCustomText] = useState('Scan for Menu');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const token = getAccessToken();
    if (!token) return;

    try {
      setLoading(true);
      // 1. Get restaurant
      const rests = await api.getMyRestaurants(token);
      if (rests.length === 0) return;
      const rest = rests[0];
      setRestaurant(rest);

      // 2. Get or Create stable QR
      const qrData = await api.createQRCode(token, rest.id, {});
      setQr(qrData);

      // 3. Get menus for the switcher
      const fetchedMenus = await api.getMenus(token, rest.id);
      setMenus(fetchedMenus);
    } catch (err) {
      console.error('Error loading QR data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetActiveMenu(menuId: string) {
    const token = getAccessToken();
    if (!token) return;

    try {
      // Set this menu as default (is_default: true)
      await api.updateMenu(token, menuId, { is_default: true });
      
      // Refresh menus to see the change
      const fetchedMenus = await api.getMenus(token, restaurant.id);
      setMenus(fetchedMenus);
      setToast({ message: 'Active menu updated successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Failed to update active menu: ' + err.message, type: 'error' });
    }
  }

  const downloadPdf = (template: string) => {
    if (!qr) return;
    let url = `${API_BASE}/qr/${qr.id}/pdf?template=${template}`;
    if (template === 'with_custom' && customText) {
      url += `&custom_text=${encodeURIComponent(customText)}`;
    }
    window.open(url, '_blank');
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading QR Dashboard...</div>;
  if (!restaurant) return <div style={{ padding: '2rem' }}>Please create a restaurant first.</div>;

  const activeMenu = menus.find(m => m.is_default) || menus[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>📱 Restaurant QR Code</h1>
        <p style={{ color: 'var(--color-gray-500)' }}>Your permanent QR code that always points to your active menu.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left: QR Preview & Status */}
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ 
            width: '250px', height: '250px', margin: '0 auto 1.5rem', 
            background: 'white', padding: '1rem', borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            border: '1px solid var(--color-gray-100)'
          }}>
            {qr && (
              <img 
                src={`${API_BASE}/qr/${qr.id}/image?t=${Date.now()}`} 
                alt="QR Code" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            )}
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>{restaurant.name}</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 600, wordBreak: 'break-all', marginBottom: '1.5rem' }}>
            {qr?.target_url}
          </p>
          
          <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Currently pointing to:
            </p>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
              background: 'var(--color-primary-50)', color: 'var(--color-primary)',
              padding: '0.5rem 1rem', borderRadius: '999px', fontWeight: 600
            }}>
              📋 {activeMenu?.name || 'Main Menu'}
            </div>
          </div>
        </div>

        {/* Right: Controls & Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Menu Selection */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: 'var(--text-lg)' }}>🔄 Switch Linked Menu</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: '1.5rem' }}>
              Select which menu customers see when they scan your QR code.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {menus.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSetActiveMenu(m.id)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: m.is_default ? '2px solid var(--color-primary)' : '1px solid var(--color-gray-200)',
                    background: m.is_default ? 'var(--color-primary-50)' : 'white',
                    color: m.is_default ? 'var(--color-primary)' : 'var(--color-gray-700)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {m.name} {m.is_default && ' ✓'}
                </button>
              ))}
            </div>
          </div>

          {/* PDF Templates */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: 'var(--text-lg)' }}>🖨️ Download Print-Ready PDF (A4)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              
              {/* Plain Template */}
              <div style={{ textAlign: 'center', border: '1px solid var(--color-gray-100)', borderRadius: 'var(--radius-lg)', padding: '1rem', background: 'var(--color-gray-50)' }}>
                <div style={{ height: '80px', background: 'white', marginBottom: '1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  🔲
                </div>
                <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>Plain QR</p>
                <button onClick={() => downloadPdf('plain')} className="btn btn-outline btn-sm" style={{ width: '100%' }}>Download</button>
              </div>

              {/* With Name Template */}
              <div style={{ textAlign: 'center', border: '1px solid var(--color-gray-100)', borderRadius: 'var(--radius-lg)', padding: '1rem', background: 'var(--color-gray-50)' }}>
                <div style={{ height: '80px', background: 'white', marginBottom: '1rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', gap: '5px' }}>
                  <div style={{ width: '60%', height: '4px', background: '#eee' }}></div>
                  <div style={{ fontSize: '1.5rem' }}>🔲</div>
                </div>
                <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>With Name</p>
                <button onClick={() => downloadPdf('with_name')} className="btn btn-outline btn-sm" style={{ width: '100%' }}>Download</button>
              </div>

              {/* Custom Text Template */}
              <div style={{ textAlign: 'center', border: '1px solid var(--color-gray-100)', borderRadius: 'var(--radius-lg)', padding: '1rem', background: 'var(--color-gray-50)' }}>
                <div style={{ height: '80px', background: 'white', marginBottom: '1rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', gap: '5px' }}>
                  <div style={{ fontSize: '1.5rem' }}>🔲</div>
                  <div style={{ width: '60%', height: '4px', background: 'var(--color-primary-100)' }}></div>
                </div>
                <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>Custom Text</p>
                <button onClick={() => downloadPdf('with_custom')} className="btn btn-primary btn-sm" style={{ width: '100%' }}>Download</button>
              </div>

            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-gray-100)' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: 'var(--text-sm)' }}>Custom Footer Text (for 3rd template)</label>
              <input 
                type="text" 
                className="input" 
                value={customText} 
                onChange={e => setCustomText(e.target.value)}
                placeholder="e.g. Scan to see our special menu"
              />
            </div>

          </div>

        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
