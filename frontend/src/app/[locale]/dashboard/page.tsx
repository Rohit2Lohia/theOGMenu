'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus, 
  QrCode, 
  Camera, 
  Eye, 
  BarChart3, 
  Utensils, 
  ScrollText, 
  Image as ImageIcon,
  Rocket,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function DashboardOverview() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [loading, setLoading] = useState(true);
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>('free');
  const [statsData, setStatsData] = useState({
    todayScans: 0,
    menuItems: 0,
    menus: 0,
    galleryPhotos: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const token = getAccessToken();
    if (!token) return;

    try {
      setLoading(true);
      const [rests, me] = await Promise.all([
        api.getMyRestaurants(token),
        api.getMe(token),
      ]);
      if (me?.tier) setUserTier(me.tier);
      if (rests && rests.length > 0) {
        const activeRest = rests[0];
        setRestaurantSlug(activeRest.slug);
        const stats = await api.getRestaurantStats(token, activeRest.id);
        setStatsData({
          todayScans: stats.today_scans,
          menuItems: stats.total_items,
          menus: stats.total_menus,
          galleryPhotos: stats.total_gallery_photos,
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { key: 'todayScans', value: statsData.todayScans.toString(), icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
    { key: 'menuItems', value: statsData.menuItems.toString(), icon: Utensils, color: 'text-green-600', bg: 'bg-green-100' },
    { key: 'menus', value: statsData.menus.toString(), icon: ScrollText, color: 'text-amber-600', bg: 'bg-amber-100' },
    { key: 'galleryPhotos', value: statsData.galleryPhotos.toString(), icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const quickActions = [
    {
      key: 'addItem',
      icon: Plus,
      path: '/dashboard/menu-editor',
      gradient: 'from-primary to-primary-dark',
    },
    {
      key: 'generateQR',
      icon: QrCode,
      path: '/dashboard/qr-codes',
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      key: 'uploadPhoto',
      icon: Camera,
      path: '/dashboard/gallery',
      gradient: 'from-green-500 to-green-700',
    },
    {
      key: 'viewMenu',
      icon: Eye,
      path: restaurantSlug ? `/r/${restaurantSlug}` : '#',
      gradient: 'from-purple-500 to-purple-700',
      external: true
    },
  ];

  const handleAction = (action: any) => {
    if (action.key === 'viewMenu') {
      if (restaurantSlug) {
        window.open(`/${locale}/r/${restaurantSlug}`, '_blank');
      }
      return;
    }
    router.push(action.path);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <motion.div 
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight">
            {t('welcome')}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your restaurant menu, QR codes, and more.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           Live Status
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                <Icon size={28} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-extrabold text-gray-900 truncate">
                  {loading ? (
                    <div className="w-12 h-8 bg-gray-100 animate-pulse rounded-md" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate mt-1">
                  {t(`stats.${stat.key}`)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upgrade Banner — free tier only */}
      {!loading && userTier === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary/5 via-amber-50 to-primary/5 rounded-3xl p-5 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Unlock More Features</h3>
              <p className="text-sm text-gray-500">Get menu images, ordering, analytics & more with Standard plan</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/subscription')}
            className="btn btn-primary flex items-center gap-2 shrink-0"
          >
            Explore Plans <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="font-display text-xl font-extrabold text-gray-900">{t('quickActions.title')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(action)}
                className={cn(
                  "relative h-40 rounded-[2.5rem] p-6 text-white overflow-hidden shadow-lg group",
                  "bg-gradient-to-br",
                  action.gradient
                )}
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all duration-500">
                  <Icon size={80} />
                </div>
                <div className="relative h-full flex flex-col justify-between">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <span className="font-bold text-lg leading-tight text-left">
                    {t(`quickActions.${action.key}`)}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Getting Started Guide */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Rocket size={200} />
        </div>
        
        <div className="relative">
          <h3 className="font-display text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
            <Rocket className="text-primary" />
            Getting Started Guide
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <GuideStep 
              number="1" 
              title="Set up your restaurant" 
              description="Add your restaurant details, logo, and operating hours" 
            />
            <GuideStep 
              number="2" 
              title="Build your menu" 
              description="Add categories and items with prices, photos, and descriptions" 
            />
            <GuideStep 
              number="3" 
              title="Generate QR codes" 
              description="Create branded QR codes and place them on your tables" 
            />
            <GuideStep 
              number="4" 
              title="Go live! 🎉" 
              description="Customers scan the QR code and see your beautiful digital menu" 
              isLast
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function GuideStep({ 
  number, 
  title, 
  description, 
  isLast = false 
}: { 
  number: string; 
  title: string; 
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative group">
      {!isLast && (
        <div className="hidden lg:block absolute top-6 left-12 w-full h-[2px] bg-gray-100 group-hover:bg-primary/20 transition-colors duration-500" />
      )}
      <div className="relative flex flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-display font-extrabold text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
          {number}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
