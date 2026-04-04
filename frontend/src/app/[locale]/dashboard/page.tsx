'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function DashboardOverview() {
  const t = useTranslations('dashboard');
  const router = useRouter();

  const stats = [
    { key: 'totalScans', value: '0', icon: '📊', color: '#FF6B35' },
    { key: 'menuItems', value: '0', icon: '🍽️', color: '#22C55E' },
    { key: 'reviews', value: '0', icon: '⭐', color: '#F59E0B' },
    { key: 'galleryPhotos', value: '0', icon: '📸', color: '#3B82F6' },
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
      path: '/menu/demo',
      gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    },
  ];

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
              <span className={styles.statValue}>{stat.value}</span>
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
              onClick={() => router.push(action.path)}
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
