'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated, getStoredUser, logout } from '@/lib/auth';
import styles from './layout.module.css';

const navItems = [
  { key: 'overview', path: '/dashboard', icon: '📊' },
  { key: 'menuEditor', path: '/dashboard/menu-editor', icon: '📋' },
  { key: 'gallery', path: '/dashboard/gallery', icon: '📸' },
  { key: 'qrCodes', path: '/dashboard/qr-codes', icon: '📱' },
  { key: 'reviews', path: '/dashboard/reviews', icon: '⭐' },
  { key: 'settings', path: '/dashboard/settings', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth');
      return;
    }
    setUser(getStoredUser());
  }, [router]);

  const isActive = (path: string) => {
    const cleanPath = pathname.replace(/^\/(en|hi)/, '');
    if (path === '/dashboard') return cleanPath === '/dashboard';
    return cleanPath.startsWith(path);
  };

  return (
    <div className={styles.dashboard}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span>🍽️</span>
            <span className={styles.logoText}>theOGMenu</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`${styles.navItem} ${isActive(item.path) ? styles.navItemActive : ''}`}
              onClick={() => {
                router.push(item.path);
                setSidebarOpen(false);
              }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{t(`nav.${item.key}`)}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topbar}>
          <button
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className={styles.topbarRight}>
            <span className={styles.userName}>
              {user?.name || 'Restaurant Owner'}
            </span>
            <div className={styles.avatar}>
              {(user?.name?.[0] || 'R').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
