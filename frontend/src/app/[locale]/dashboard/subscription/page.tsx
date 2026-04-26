'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Zap,
  Rocket,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Shield,
  Star,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────

interface Tier {
  name: string;
  slug: string;
  price_monthly: number;
  price_currency: string;
  max_restaurants: number;
  max_menus_per_restaurant: number;
  features: string[];
  limitations: string[];
}

interface TierUsage {
  current_tier: string;
  tier_name: string;
  restaurants_used: number;
  restaurants_limit: number;
  menus_used: number;
  menus_limit: number;
}

// ── Comparison table rows ──────────────────────────────

const COMPARISON_ROWS = [
  { label: 'Restaurants', key: 'restaurants' },
  { label: 'Menus per restaurant', key: 'menus' },
  { label: 'QR Code menu', key: 'qr' },
  { label: 'Menu item images', key: 'images' },
  { label: 'Online ordering', key: 'ordering' },
  { label: 'Order management', key: 'order_mgmt' },
  { label: 'Basic analytics', key: 'analytics' },
  { label: 'Multi-language (5 langs)', key: 'multilang' },
  { label: 'Kitchen Display (KDS)', key: 'kds' },
  { label: 'Inventory tracking', key: 'inventory' },
  { label: 'Table reservations', key: 'reservations' },
  { label: 'Marketing automation', key: 'marketing' },
  { label: 'Priority support', key: 'support' },
];

const COMPARISON_VALUES: Record<string, Record<string, string | boolean>> = {
  free:     { restaurants: '1', menus: '1', qr: true,  images: false, ordering: false, order_mgmt: false, analytics: false, multilang: false, kds: false, inventory: false, reservations: false, marketing: false, support: false },
  standard: { restaurants: '3', menus: '3', qr: true,  images: true,  ordering: true,  order_mgmt: true,  analytics: true,  multilang: true,  kds: false, inventory: false, reservations: false, marketing: false, support: false },
  premium:  { restaurants: '∞', menus: '∞', qr: true,  images: true,  ordering: true,  order_mgmt: true,  analytics: true,  multilang: true,  kds: true,  inventory: true,  reservations: true,  marketing: true,  support: true  },
};

// ── Tier visual config ─────────────────────────────────

const TIER_CONFIG: Record<string, {
  icon: React.ElementType;
  gradient: string;
  cardBg: string;
  badge: string;
  buttonGradient: string;
  accentColor: string;
}> = {
  free:     { icon: Shield,  gradient: 'from-gray-500 to-gray-700',    cardBg: 'bg-white',                         badge: 'bg-gray-100 text-gray-600',     buttonGradient: 'from-gray-500 to-gray-700',    accentColor: 'text-gray-600' },
  standard: { icon: Zap,     gradient: 'from-blue-500 to-indigo-600',  cardBg: 'bg-white',                         badge: 'bg-blue-100 text-blue-700',     buttonGradient: 'from-blue-500 to-indigo-600',  accentColor: 'text-blue-600' },
  premium:  { icon: Crown,   gradient: 'from-amber-400 to-orange-500', cardBg: 'bg-gradient-to-br from-amber-50 to-orange-50', badge: 'bg-amber-100 text-amber-700', buttonGradient: 'from-amber-400 to-orange-500', accentColor: 'text-amber-600' },
};

// ── Sub-components ─────────────────────────────────────

function UsageBar({ used, limit, color }: { used: number; limit: number; color: string }) {
  const pct = limit === -1 ? 30 : Math.min(100, (used / limit) * 100);
  const isAtLimit = limit !== -1 && used >= limit;
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', isAtLimit ? 'bg-red-400' : color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TierCard({
  tier,
  currentTier,
  onUpgrade,
  index,
}: {
  tier: Tier;
  currentTier: string;
  onUpgrade: (tier: Tier) => void;
  index: number;
}) {
  const config = TIER_CONFIG[tier.slug] || TIER_CONFIG.free;
  const Icon = config.icon;
  const isCurrent = tier.slug === currentTier;
  const tierOrder = ['free', 'standard', 'premium'];
  const isUpgrade = tierOrder.indexOf(tier.slug) > tierOrder.indexOf(currentTier);
  const isDowngrade = tierOrder.indexOf(tier.slug) < tierOrder.indexOf(currentTier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
      className={cn(
        'relative rounded-3xl border-2 p-7 flex flex-col transition-all duration-300',
        config.cardBg,
        isCurrent
          ? 'border-primary shadow-xl shadow-primary/10 scale-[1.02]'
          : 'border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200'
      )}
    >
      {/* Current badge */}
      {isCurrent && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-md shadow-primary/20 whitespace-nowrap">
            ✦ Current Plan
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4', config.gradient)}>
          <Icon size={22} />
        </div>
        <h3 className="font-display text-xl font-extrabold text-gray-900">{tier.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          {tier.price_monthly === 0 ? (
            <span className="text-3xl font-extrabold text-gray-900">Free</span>
          ) : (
            <>
              <span className="text-sm font-semibold text-gray-400">₹</span>
              <span className="text-3xl font-extrabold text-gray-900">{tier.price_monthly.toLocaleString('en-IN')}</span>
              <span className="text-sm text-gray-400">/month</span>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {tier.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm text-gray-700">
            <Check size={15} className="text-green-500 shrink-0 mt-0.5" />
            <span>{feat}</span>
          </li>
        ))}
        {tier.limitations.map((lim) => (
          <li key={lim} className="flex items-start gap-2.5 text-sm text-gray-400">
            <X size={15} className="text-gray-300 shrink-0 mt-0.5" />
            <span>{lim}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrent ? (
        <button
          disabled
          className="w-full py-3 rounded-2xl bg-primary/10 text-primary font-bold text-sm cursor-default"
        >
          Current Plan
        </button>
      ) : isUpgrade ? (
        <button
          onClick={() => onUpgrade(tier)}
          className={cn(
            'w-full py-3 rounded-2xl text-white font-bold text-sm bg-gradient-to-r transition-all duration-200 flex items-center justify-center gap-2',
            'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
            config.buttonGradient
          )}
        >
          Upgrade to {tier.name} <ArrowRight size={15} />
        </button>
      ) : (
        <button
          disabled
          className="w-full py-3 rounded-2xl bg-gray-50 text-gray-400 font-bold text-sm cursor-not-allowed"
        >
          {isDowngrade ? 'Lower Tier' : 'Unavailable'}
        </button>
      )}
    </motion.div>
  );
}

// ── Upgrade Modal ──────────────────────────────────────

function UpgradeModal({
  tier,
  onClose,
  onConfirm,
  loading,
  success,
}: {
  tier: Tier;
  onClose: () => void;
  onConfirm: (message: string) => void;
  loading: boolean;
  success: boolean;
}) {
  const [message, setMessage] = useState('');
  const config = TIER_CONFIG[tier.slug] || TIER_CONFIG.free;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
        >
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-gray-900 mb-2">Request Sent!</h3>
              <p className="text-gray-500 mb-6">
                Our team will contact you shortly to complete your upgrade to <strong>{tier.name}</strong>.
              </p>
              <button onClick={onClose} className="btn btn-primary px-8">
                Got it
              </button>
            </div>
          ) : (
            <>
              <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-5', config.gradient)}>
                <Icon size={24} />
              </div>
              <h3 className="font-display text-2xl font-extrabold text-gray-900 mb-1">
                Upgrade to {tier.name}
              </h3>
              <p className="text-gray-500 mb-1">
                {tier.price_monthly === 0 ? 'Free' : `₹${tier.price_monthly.toLocaleString('en-IN')}/month`}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Our team will reach out to set up payment and activate your plan. You can leave a message below.
              </p>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                className="input w-full"
                rows={3}
                placeholder="e.g. I manage 2 restaurants and need images for my menu..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(message)}
                  disabled={loading}
                  className={cn(
                    'flex-1 py-3 rounded-2xl text-white font-bold text-sm bg-gradient-to-r transition-all duration-200',
                    config.buttonGradient,
                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:scale-[1.02]'
                  )}
                >
                  {loading ? 'Sending...' : `Request ${tier.name} Upgrade`}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ──────────────────────────────────────────

export default function SubscriptionPage() {
  const router = useRouter();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [usage, setUsage] = useState<TierUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const token = getAccessToken();
    try {
      setLoading(true);
      const [tiersData, usageData] = await Promise.all([
        api.getTiers(token || undefined),
        token ? api.getMyTierUsage(token) : Promise.resolve(null),
      ]);
      setTiers(tiersData.tiers || []);
      setUsage(usageData);
    } catch (err) {
      console.error('Failed to load tier data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgradeConfirm(message: string) {
    if (!selectedTier) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      setUpgradeLoading(true);
      await api.requestTierUpgrade(token, selectedTier.slug, message);
      setUpgradeSuccess(true);
    } catch (err: any) {
      console.error('Upgrade request failed:', err);
      alert(err.message || 'Failed to submit upgrade request. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  }

  function closeModal() {
    setSelectedTier(null);
    setUpgradeSuccess(false);
    setUpgradeLoading(false);
  }

  const currentTier = usage?.current_tier || 'free';
  const currentTierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG.free;
  const CurrentIcon = currentTierConfig.icon;

  // ── Loading skeleton ────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="h-9 w-48 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-10">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
          Plans & Subscription
        </h1>
        <p className="text-gray-500">Review your plan and upgrade to unlock more features for your restaurant.</p>
      </motion.div>

      {/* Current Plan Banner */}
      {usage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className={cn(
            'rounded-3xl p-6 border',
            currentTier === 'premium'
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
              : currentTier === 'standard'
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shrink-0', currentTierConfig.gradient)}>
                <CurrentIcon size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-display text-xl font-extrabold text-gray-900">{usage.tier_name} Plan</span>
                  <span className={cn('text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', currentTierConfig.badge)}>
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {usage.restaurants_used} / {usage.restaurants_limit === -1 ? '∞' : usage.restaurants_limit} restaurants
                  &nbsp;·&nbsp;
                  {usage.menus_used} / {usage.menus_limit === -1 ? '∞' : usage.menus_limit} menus
                </p>
              </div>
            </div>
            {currentTier !== 'premium' && (
              <button
                onClick={() => {
                  const nextTier = tiers.find((t) => t.slug === (currentTier === 'free' ? 'standard' : 'premium'));
                  if (nextTier) setSelectedTier(nextTier);
                }}
                className="flex items-center gap-2 text-sm font-bold bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-700 px-5 py-2.5 rounded-2xl transition-all duration-200 shadow-sm hover:shadow whitespace-nowrap"
              >
                <Sparkles size={15} /> Upgrade Plan
              </button>
            )}
          </div>

          {/* Usage bars */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-gray-500">Restaurants</span>
                <span className="text-xs font-bold text-gray-700">
                  {usage.restaurants_used} / {usage.restaurants_limit === -1 ? '∞' : usage.restaurants_limit}
                </span>
              </div>
              <UsageBar
                used={usage.restaurants_used}
                limit={usage.restaurants_limit}
                color={currentTier === 'premium' ? 'bg-amber-400' : currentTier === 'standard' ? 'bg-blue-500' : 'bg-gray-500'}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-gray-500">Total Menus</span>
                <span className="text-xs font-bold text-gray-700">
                  {usage.menus_used} / {usage.menus_limit === -1 ? '∞' : usage.menus_limit}
                </span>
              </div>
              <UsageBar
                used={usage.menus_used}
                limit={usage.menus_limit}
                color={currentTier === 'premium' ? 'bg-amber-400' : currentTier === 'standard' ? 'bg-blue-500' : 'bg-gray-500'}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tier Cards */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-xl font-extrabold text-gray-900 mb-6"
        >
          Choose Your Plan
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, i) => (
            <TierCard
              key={tier.slug}
              tier={tier}
              currentTier={currentTier}
              onUpgrade={setSelectedTier}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-extrabold text-gray-900">Feature Comparison</h2>
          <p className="text-sm text-gray-500 mt-1">See exactly what's included in each plan.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 w-1/2">Feature</th>
                {tiers.map((tier) => {
                  const config = TIER_CONFIG[tier.slug] || TIER_CONFIG.free;
                  return (
                    <th key={tier.slug} className="py-4 px-4 text-center">
                      <span className={cn('text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full', config.badge)}>
                        {tier.name}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.key} className={cn('border-b border-gray-50', i % 2 === 0 ? 'bg-gray-50/30' : 'bg-white')}>
                  <td className="py-3.5 px-6 text-sm font-medium text-gray-700">{row.label}</td>
                  {tiers.map((tier) => {
                    const val = COMPARISON_VALUES[tier.slug]?.[row.key];
                    return (
                      <td key={tier.slug} className="py-3.5 px-4 text-center">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check size={18} className="text-green-500 mx-auto" />
                          ) : (
                            <X size={18} className="text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-bold text-gray-800">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA footer */}
        {currentTier !== 'premium' && (
          <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <Rocket size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Ready to grow?</p>
                  <p className="text-xs text-gray-500">Upgrade today and unlock your restaurant's full potential.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const nextTier = tiers.find((t) => t.slug === (currentTier === 'free' ? 'standard' : 'premium'));
                  if (nextTier) setSelectedTier(nextTier);
                }}
                className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Star size={15} /> Upgrade Now
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Upgrade Modal */}
      {selectedTier && (
        <UpgradeModal
          tier={selectedTier}
          onClose={closeModal}
          onConfirm={handleUpgradeConfirm}
          loading={upgradeLoading}
          success={upgradeSuccess}
        />
      )}
    </div>
  );
}
