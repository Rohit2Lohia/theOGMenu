'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function GalleryPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'info' | 'error' | 'success' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      if (!activeRest) {
        activeRest = await api.createRestaurant(token, {
          name: 'My Restaurant',
          slug: 'my-restaurant-' + Math.floor(Math.random() * 1000)
        });
      }

      setRestaurant(activeRest);
      const gallery = await api.getGallery(token, activeRest.id);
      setImages(gallery);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0 || !restaurant) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('category', 'food');

      const uploaded = await api.uploadGalleryImage(token, restaurant.id, formData);
      setImages([uploaded, ...images]);
    } catch (err: any) {
      showNotification('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function showNotification(message: string, type: 'info' | 'error' | 'success' = 'info') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }
  
  async function handleDelete(img: any) {
    const isLogo = restaurant?.logo_url === img.url;
    if (isLogo) {
      showNotification("Cannot delete the active restaurant logo. Change your logo first.", 'error');
      return;
    }
    
    setDeletingId(img.id);
  }

  async function confirmDelete(imageId: string) {
    const token = getAccessToken();
    if (!token) return;

    try {
      await api.deleteGalleryImage(token, imageId);
      setImages(images.filter(img => img.id !== imageId));
      showNotification('Image deleted successfully', 'success');
    } catch (err: any) {
      showNotification('Failed to delete: ' + err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetAsLogo(imageUrl: string) {
    if (!restaurant) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      const updated = await api.updateRestaurant(token, restaurant.id, { logo_url: imageUrl });
      setRestaurant(updated);
      showNotification('Logo updated successfully!', 'success');
    } catch (err: any) {
      showNotification('Failed to set logo: ' + err.message, 'error');
    }
  }

  async function handleRemoveLogo() {
    if (!restaurant) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      const updated = await api.updateRestaurant(token, restaurant.id, { logo_url: null });
      setRestaurant(updated);
      showNotification('Logo removed. Reverting to initials.', 'info');
    } catch (err: any) {
      showNotification('Failed to remove logo: ' + err.message, 'error');
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading gallery...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>🖼️ Photo Gallery</h1>
          <p style={{ color: 'var(--color-gray-500)' }}>Manage the visual identity of your restaurant.</p>
        </div>
        <div>
          <button 
            className="btn btn-primary" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleFileSelect} 
          />
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          padding: '1rem 2rem',
          borderRadius: 'var(--radius-lg)',
          background: notification.type === 'error' ? 'var(--color-error)' : 
                     notification.type === 'success' ? 'var(--color-success)' : 'var(--color-secondary)',
          color: 'white',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1000,
          animation: 'slideInRight 0.3s ease-out',
          fontWeight: 600,
          fontSize: 'var(--text-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {notification.type === 'error' ? '⚠️' : notification.type === 'success' ? '✅' : 'ℹ️'}
          {notification.message}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
          <p>No images uploaded yet.</p>
          <p style={{ fontSize: 'var(--text-sm)', marginTop: '0.5rem' }}>Upload high-quality photos of your food and ambience.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {images.map(img => {
          const isLogo = restaurant?.logo_url === img.url;
          return (
            <div key={img.id} className="card" style={{ 
              position: 'relative', 
              overflow: 'hidden', 
              aspectRatio: '1', 
              borderRadius: 'var(--radius-lg)',
              border: isLogo ? '3px solid var(--color-primary)' : 'none'
            }}>
              <img 
                src={img.url} 
                alt={img.caption || 'Gallery image'} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              
              {/* Logo Badge */}
              {isLogo && (
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  left: '0.5rem',
                  background: 'var(--color-primary)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  boxShadow: 'var(--shadow-sm)',
                  zIndex: 5
                }}>
                  Logo
                </div>
              )}

              {/* Actions Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '0.75rem',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: 1, // Visible on mobile, can be changed to hover on desktop if needed
                transition: 'opacity 0.2s'
              }}>
                <button 
                  onClick={() => isLogo ? handleRemoveLogo() : handleSetAsLogo(img.url)}
                  style={{
                    background: isLogo ? 'var(--color-danger)' : 'white',
                    color: isLogo ? 'white' : 'var(--color-gray-800)',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s'
                  }}
                >
                  {isLogo ? 'Remove as Logo' : 'Set as Logo'}
                </button>

                <button 
                  onClick={() => handleDelete(img)}
                  disabled={isLogo}
                  title={isLogo ? "Active logo cannot be deleted" : "Delete Image"}
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: isLogo ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isLogo ? 'var(--color-gray-300)' : 'var(--color-danger)',
                    opacity: isLogo ? 0.5 : 1
                  }}
                >
                  🗑️
                </button>
              </div>

              {/* Custom Deletion Confirmation Overlay */}
              {deletingId === img.id && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.85)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  zIndex: 20,
                  textAlign: 'center',
                  backdropFilter: 'blur(4px)',
                  animation: 'fadeIn 0.2s'
                }}>
                  <p style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>Delete image?</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setDeletingId(null)}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => confirmDelete(img.id)}
                      style={{
                        background: 'var(--color-error)',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
