'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import styles from './page.module.css';

export default function DashboardOverview() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [loading, setLoading] = useState(true);
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null);
  const [statsData, setStatsData] = useState({
    totalScans: 0,
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
      const rests = await api.getMyRestaurants(token);
      if (rests && rests.length > 0) {
        const activeRest = rests[0];
        setRestaurantSlug(activeRest.slug);
        const stats = await api.getRestaurantStats(token, activeRest.id);
        setStatsData({
          totalScans: stats.total_scans,
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
    { key: 'totalScans', value: statsData.totalScans.toString(), icon: '📊', color: '#FF6B35' },
    { key: 'menuItems', value: statsData.menuItems.toString(), icon: '🍽️', color: '#22C55E' },
    { key: 'menus', value: statsData.menus.toString(), icon: '📜', color: '#F59E0B' },
    { key: 'galleryPhotos', value: statsData.galleryPhotos.toString(), icon: '📸', color: '#3B82F6' },
  ];

  const quickActions = [
    {
      key: 'addItem',
      icon: '➕',
      path: '/dashboard/menu-editor',
      gradient: 'linear-gradient(135deg, #FF6B35, #E55A25)',
    },
    {
      key: 'generateQR',
      icon: '📱',
      path: '/dashboard/qr-codes',
      gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    },
    {
      key: 'uploadPhoto',
      icon: '📸',
      path: '/dashboard/gallery',
      gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
    },
    {
      key: 'viewMenu',
      icon: '👁️',
      path: restaurantSlug ? `/r/${restaurantSlug}` : '#',
      gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
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

  return (
    <div className={styles.overview}>
      <div className={styles.header}>
        <h1>{t('welcome')}! 👋</h1>
        <p className={styles.headerSub}>
          Manage your restaurant menu, QR codes, and more.
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.key} className={`card ${styles.statCard}`}>
            <div
              className={styles.statIcon}
              style={{ background: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {loading ? '...' : stat.value}
              </span>
              <span className={styles.statLabel}>{t(`stats.${stat.key}`)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('quickActions.title')}</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action) => (
            <button
              key={action.key}
              className={styles.actionCard}
              onClick={() => handleAction(action)}
              style={{ background: action.gradient }}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionLabel}>
                {t(`quickActions.${action.key}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className={styles.section}>
        <div className={`card ${styles.guideCard}`}>
          <h3>🚀 Getting Started</h3>
          <div className={styles.guideSteps}>
            <div className={styles.guideStep}>
              <div className={styles.guideStepNum}>1</div>
              <div>
                <strong>Set up your restaurant</strong>
                <p>Add your restaurant details, logo, and operating hours</p>
              </div>
            </div>
            <div className={styles.guideStep}>
              <div className={styles.guideStepNum}>2</div>
              <div>
                <strong>Build your menu</strong>
                <p>Add categories and items with prices, photos, and descriptions</p>
              </div>
            </div>
            <div className={styles.guideStep}>
              <div className={styles.guideStepNum}>3</div>
              <div>
                <strong>Generate QR codes</strong>
                <p>Create branded QR codes and place them on your tables</p>
              </div>
            </div>
            <div className={styles.guideStep}>
              <div className={styles.guideStepNum}>4</div>
              <div>
                <strong>Go live! 🎉</strong>
                <p>Customers scan the QR code and see your beautiful digital menu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
