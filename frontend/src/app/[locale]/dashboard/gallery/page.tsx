'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function GalleryPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      await api.deleteGalleryImage(token, imageId);
      setImages(images.filter(img => img.id !== imageId));
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
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

      {images.length === 0 && !uploading && (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
          <p>No images uploaded yet.</p>
          <p style={{ fontSize: 'var(--text-sm)', marginTop: '0.5rem' }}>Upload high-quality photos of your food and ambience.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {images.map(img => (
          <div key={img.id} className="card" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1', borderRadius: 'var(--radius-lg)' }}>
            <img 
              src={img.thumbnail_url || img.url} 
              alt={img.caption || 'Gallery image'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <button 
              onClick={() => handleDelete(img.id)}
              style={{
                position: 'absolute', top: '0.5rem', right: '0.5rem',
                background: 'rgba(255,255,255,0.9)', border: 'none',
                width: '32px', height: '32px', borderRadius: '50%',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)', color: 'var(--color-danger)'
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
