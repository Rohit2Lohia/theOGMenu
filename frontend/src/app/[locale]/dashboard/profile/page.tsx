'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Zap, Shield, ArrowRight, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ── Tier visual helpers ────────────────────────────────

const TIER_CONFIG: Record<string, { icon: React.ElementType; badge: string; gradient: string; label: string }> = {
  free:     { icon: Shield,  badge: 'bg-gray-100 text-gray-600',    gradient: 'from-gray-500 to-gray-700',    label: 'Free Plan' },
  standard: { icon: Zap,     badge: 'bg-blue-100 text-blue-700',    gradient: 'from-blue-500 to-indigo-600',  label: 'Standard Plan' },
  premium:  { icon: Crown,   badge: 'bg-amber-100 text-amber-700',  gradient: 'from-amber-400 to-orange-500', label: 'Premium Plan' },
};

function UsageBar({ used, limit, colorClass }: { used: number; limit: number; colorClass: string }) {
  const pct = limit === -1 ? 20 : Math.min(100, (used / limit) * 100);
  const atLimit = limit !== -1 && used >= limit;
  return (
    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', atLimit ? 'bg-red-400' : colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tierUsage, setTierUsage] = useState<any>(null);
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
    brand_accent_color: '#C5A059'
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const token = getAccessToken();
    if (!token) return;

    try {
      setLoading(true);
      const [rests, me, usage] = await Promise.all([
        api.getMyRestaurants(token),
        api.getMe(token),
        api.getMyTierUsage(token),
      ]);

      setUserProfile(me);
      setTierUsage(usage);

      let activeRest = rests[0];
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

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const phonePattern = /^\+?[0-9\s-]{10,20}$/;

    if (formData.phone_number && !phonePattern.test(formData.phone_number)) {
      alert('Please enter a valid phone number'); return;
    }
    if (formData.whatsapp_number && !phonePattern.test(formData.whatsapp_number)) {
      alert('Please enter a valid WhatsApp number'); return;
    }
    if (formData.instagram_url && !urlPattern.test(formData.instagram_url)) {
      alert('Please enter a valid Instagram URL'); return;
    }
    if (formData.facebook_url && !urlPattern.test(formData.facebook_url)) {
      alert('Please enter a valid Facebook URL'); return;
    }

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

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  const currentTier = tierUsage?.current_tier || 'free';
  const tierConf = TIER_CONFIG[currentTier] || TIER_CONFIG.free;
  const TierIcon = tierConf.icon;
  const barColor = currentTier === 'premium' ? 'bg-amber-400' : currentTier === 'standard' ? 'bg-blue-500' : 'bg-gray-400';

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-8">
      <header>
        <h1 className="font-display mb-2 text-3xl font-bold">👤 Profile & Account</h1>
        <p className="text-gray-500">Manage your account info, subscription, and restaurant brand identity.</p>
      </header>

      {/* ── Account & Subscription Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
      >
        <h2 className="font-display text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          Account Information
        </h2>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar + user info */}
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shrink-0 shadow-md"
              style={{ background: `linear-gradient(135deg, ${formData.brand_accent_color}, #8B5CF6)` }}
            >
              {getInitials(userProfile?.name || formData.name || 'OG')}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">{userProfile?.name || '—'}</p>
              <p className="text-sm text-gray-500">{userProfile?.phone_number || '—'}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Current Plan */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', tierConf.gradient)}>
              <TierIcon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{tierConf.label}</span>
                <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', tierConf.badge)}>
                  Active
                </span>
              </div>
              {tierUsage && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {tierUsage.restaurants_used} / {tierUsage.restaurants_limit === -1 ? '∞' : tierUsage.restaurants_limit} restaurants
                  &nbsp;·&nbsp;
                  {tierUsage.menus_used} / {tierUsage.menus_limit === -1 ? '∞' : tierUsage.menus_limit} menus
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentTier !== 'premium' && (
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
              >
                Upgrade <ArrowRight size={14} />
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard/subscription')}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-200 hover:border-primary hover:text-primary px-4 py-2 rounded-xl transition-all duration-200"
            >
              View Plans <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Usage bars */}
        {tierUsage && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500">Restaurants Used</span>
                <span className="text-xs font-bold text-gray-700">
                  {tierUsage.restaurants_used} / {tierUsage.restaurants_limit === -1 ? '∞' : tierUsage.restaurants_limit}
                </span>
              </div>
              <UsageBar used={tierUsage.restaurants_used} limit={tierUsage.restaurants_limit} colorClass={barColor} />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500">Total Menus Used</span>
                <span className="text-xs font-bold text-gray-700">
                  {tierUsage.menus_used} / {tierUsage.menus_limit === -1 ? '∞' : tierUsage.menus_limit}
                </span>
              </div>
              <UsageBar used={tierUsage.menus_used} limit={tierUsage.menus_limit} colorClass={barColor} />
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Restaurant Profile Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h2 className="font-display text-lg font-extrabold text-gray-900 mb-6">🍽️ Restaurant Profile</h2>

        <form onSubmit={handleSave}>
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            <div className="flex-1 flex flex-col gap-8 w-full">
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

              {/* Contact & Social */}
              <section className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📞 Contact & Social</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Business Phone</label>
                    <input type="tel" placeholder="+91..." className="input" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>WhatsApp Number</label>
                    <input type="tel" placeholder="WhatsApp for orders" className="input" value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Business Email</label>
                  <input type="email" placeholder="contact@restaurant.com" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Instagram Username</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }}>@</span>
                      <input type="text" style={{ paddingLeft: '2rem' }} className="input" placeholder="username" value={formData.instagram_url} onChange={e => setFormData({...formData, instagram_url: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Facebook Page</label>
                    <input type="text" className="input" placeholder="facebook.com/page" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} />
                  </div>
                </div>
              </section>

              {/* Location & Hours */}
              <section className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 Location & Hours</h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Address</label>
                  <textarea className="input" rows={2} placeholder="Full physical address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Opening Hours</label>
                  <input type="text" placeholder="e.g. Mon-Sun: 11 AM - 11 PM" className="input" value={formData.opening_hours} onChange={e => setFormData({...formData, opening_hours: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Google Maps Link</label>
                  <input type="url" placeholder="https://maps.google.com/..." className="input" value={formData.google_maps_url} onChange={e => setFormData({...formData, google_maps_url: e.target.value})} />
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
            <div className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-[100px]">
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
      </motion.div>
    </div>
  );
}
