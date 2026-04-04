'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import styles from './page.module.css';

export default function LandingPage() {
  const t = useTranslations();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Navbar ──────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🍽️</span>
            <span className={styles.logoText}>{t('common.appName')}</span>
          </div>
          <div className={styles.navLinks}>
            <LanguageToggle />
            <button className="btn btn-primary" onClick={handleGetStarted}>
              {t('landing.hero.cta')}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />
          <div className={styles.heroPattern} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              {t('landing.hero.title')}
              <br />
              <span className={styles.heroHighlight}>
                {t('landing.hero.titleHighlight')}
              </span>
            </h1>
            <p className={styles.heroSubtitle}>{t('landing.hero.subtitle')}</p>
            <div className={styles.heroCta}>
              <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                {t('landing.hero.cta')}
                <span className={styles.ctaArrow}>→</span>
              </button>
              <button className="btn btn-secondary btn-lg">
                {t('landing.hero.secondaryCta')}
              </button>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Restaurants</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNumber}>10K+</span>
                <span className={styles.statLabel}>QR Scans</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNumber}>4.9★</span>
                <span className={styles.statLabel}>Rating</span>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.phoneFrame}>
              <div className={styles.phoneScreen}>
                <div className={styles.menuPreview}>
                  <div className={styles.menuHeader}>
                    <div className={styles.menuRestName}>Tandoori Nights 🔥</div>
                    <div className={styles.menuCategories}>
                      <span className={styles.menuCatActive}>All</span>
                      <span>Starters</span>
                      <span>Main Course</span>
                      <span>Desserts</span>
                    </div>
                  </div>
                  <div className={styles.menuItems}>
                    <MenuItemPreview
                      name="Butter Chicken"
                      price="₹320"
                      type="non-veg"
                      badge="🏆 Bestseller"
                    />
                    <MenuItemPreview
                      name="Paneer Tikka"
                      price="₹240"
                      type="veg"
                      badge="🌶️ Spicy"
                    />
                    <MenuItemPreview
                      name="Dal Makhani"
                      price="₹180"
                      type="veg"
                      badge=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────── */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>{t('landing.features.title')}</h2>
          <div className={styles.featureGrid}>
            <FeatureCard
              icon="📱"
              title={t('landing.features.qr.title')}
              description={t('landing.features.qr.description')}
            />
            <FeatureCard
              icon="🌐"
              title={t('landing.features.multilingual.title')}
              description={t('landing.features.multilingual.description')}
            />
            <FeatureCard
              icon="📸"
              title={t('landing.features.gallery.title')}
              description={t('landing.features.gallery.description')}
            />
            <FeatureCard
              icon="⭐"
              title={t('landing.features.reviews.title')}
              description={t('landing.features.reviews.description')}
            />
            <FeatureCard
              icon="📍"
              title={t('landing.features.google.title')}
              description={t('landing.features.google.description')}
            />
            <FeatureCard
              icon="⚡"
              title={t('landing.features.realtime.title')}
              description={t('landing.features.realtime.description')}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <span className={styles.logoIcon}>🍽️</span>
              <span className={styles.logoText}>{t('common.appName')}</span>
              <p className={styles.footerTagline}>{t('common.tagline')}</p>
            </div>
            <div className={styles.footerLinks}>
              <p>Made with ❤️ for Indian Restaurants</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────── */

function LanguageToggle() {
  const router = useRouter();

  return (
    <div className={styles.langToggle}>
      <button className={styles.langBtn} onClick={() => router.push('/en')}>EN</button>
      <button className={styles.langBtn} onClick={() => router.push('/hi')}>हिं</button>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className={`card ${styles.featureCard}`}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{description}</p>
    </div>
  );
}

function MenuItemPreview({
  name,
  price,
  type,
  badge,
}: {
  name: string;
  price: string;
  type: string;
  badge: string;
}) {
  return (
    <div className={styles.previewItem}>
      <div className={`food-type-indicator ${type}`} />
      <div className={styles.previewItemInfo}>
        <div className={styles.previewItemName}>
          {name}
          {badge && <span className={styles.previewBadge}>{badge}</span>}
        </div>
        <div className={styles.previewItemPrice}>{price}</div>
      </div>
    </div>
  );
}
