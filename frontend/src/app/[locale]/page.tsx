'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  QrCode, 
  Globe, 
  Camera, 
  Star, 
  MapPin, 
  Zap, 
  UtensilsCrossed,
  Crown,
  Shield,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { cn } from '@/lib/utils';

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

  const handleSeeDemo = () => {
    router.push('/m/demo');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <UtensilsCrossed size={20} />
            </div>
            <span className="font-display text-xl font-extrabold text-gray-900 tracking-tight">
              {t('common.appName')}
            </span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <a
              href="#pricing"
              className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
            >
              Pricing
            </a>
            <LanguageToggle />
            <button 
              className="btn btn-primary shadow-lg shadow-primary/20 hover:shadow-primary/40" 
              onClick={handleGetStarted}
            >
              {t('landing.hero.cta')}
            </button>
          </motion.div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute top-[20%] -left-[5%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[80px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        </div>

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6"
            >
              <Zap size={14} className="fill-primary" />
              <span>Free for Indian Restaurants</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="font-display text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6"
            >
              {t('landing.hero.title')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-dark to-accent">
                {t('landing.hero.titleHighlight')}
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg lg:text-xl text-gray-500 leading-relaxed mb-10 max-w-lg"
            >
              {t('landing.hero.subtitle')}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                className="btn btn-primary btn-lg group shadow-xl shadow-primary/25 hover:shadow-primary/40 h-14 px-8" 
                onClick={handleGetStarted}
              >
                {t('landing.hero.cta')}
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                className="btn btn-secondary btn-lg h-14 px-8 border-gray-200 hover:bg-gray-50"
                onClick={handleSeeDemo}
              >
                {t('landing.hero.secondaryCta')}
              </button>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="flex items-center gap-8 p-6 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-50 w-fit"
            >
              <div className="text-center">
                <div className="text-2xl font-extrabold text-gray-900">500+</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Restaurants</div>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-gray-900">10K+</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">QR Scans</div>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-gray-900">4.9★</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:block"
          >
            {/* Phone Mockup with floating effect */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto w-[300px] h-[600px] bg-gray-900 rounded-[40px] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-white/10"
            >
              <div className="w-full h-full bg-white rounded-[32px] overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100">
                  <div className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    Tandoori Nights <span className="text-base">🔥</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">All</span>
                    <span className="px-3 py-1 rounded-full border border-gray-100 text-gray-400 text-[10px] font-medium shrink-0">Starters</span>
                    <span className="px-3 py-1 rounded-full border border-gray-100 text-gray-400 text-[10px] font-medium shrink-0">Mains</span>
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                  <MenuItemPreview name="Butter Chicken" price="₹320" type="non-veg" badge="🏆 Bestseller" />
                  <MenuItemPreview name="Paneer Tikka" price="₹240" type="veg" badge="🌶️ Spicy" />
                  <MenuItemPreview name="Dal Makhani" price="₹180" type="veg" />
                  <MenuItemPreview name="Garlic Naan" price="₹40" type="veg" />
                </div>
              </div>
            </motion.div>
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-4 top-20 p-4 bg-white rounded-2xl shadow-2xl border border-gray-50 flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Zap size={20} className="fill-green-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Live Updates</div>
                <div className="text-[10px] text-gray-400 font-medium">Real-time menu sync</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────── */}
      <section className="py-24 lg:py-32 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
              {t('landing.features.title')}
            </h2>
            <p className="text-lg text-gray-500">Everything you need to modernize your restaurant experience and increase efficiency.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<QrCode className="text-primary" />}
              title={t('landing.features.qr.title')}
              description={t('landing.features.qr.description')}
            />
            <FeatureCard
              icon={<Globe className="text-blue-500" />}
              title={t('landing.features.multilingual.title')}
              description={t('landing.features.multilingual.description')}
            />
            <FeatureCard
              icon={<Camera className="text-purple-500" />}
              title={t('landing.features.gallery.title')}
              description={t('landing.features.gallery.description')}
            />
            <FeatureCard
              icon={<Star className="text-yellow-500" />}
              title={t('landing.features.reviews.title')}
              description={t('landing.features.reviews.description')}
            />
            <FeatureCard
              icon={<MapPin className="text-red-500" />}
              title={t('landing.features.google.title')}
              description={t('landing.features.google.description')}
            />
            <FeatureCard
              icon={<Zap className="text-orange-500" />}
              title={t('landing.features.realtime.title')}
              description={t('landing.features.realtime.description')}
            />
          </div>
        </div>
      </section>

      {/* ── Pricing Section ─────────────────────── */}
      <section id="pricing" className="py-24 lg:py-32 bg-gray-50/50 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/4 -left-[10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-1/4 -right-[10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

        <div className="container mx-auto px-6">
          {/* Heading */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5"
            >
              <Sparkles size={13} className="fill-primary" />
              Simple, transparent pricing
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl lg:text-5xl font-extrabold text-gray-900 mb-5"
            >
              Start free. Scale when ready.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-500"
            >
              No credit card required. Upgrade any time as your restaurant grows.
            </motion.p>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            <PricingCard
              icon={<Shield size={22} />}
              iconBg="from-gray-500 to-gray-700"
              name="Free"
              price={0}
              description="Everything you need to launch a beautiful digital menu."
              features={[
                '1 restaurant, 1 menu',
                'QR code digital menu',
                'Category & item management',
                'Restaurant profile page',
                'Single language',
              ]}
              limitations={[
                'No menu item images',
                'No online ordering',
                'No analytics',
              ]}
              ctaLabel="Get Started Free"
              ctaStyle="secondary"
              onCta={handleGetStarted}
              index={0}
            />
            <PricingCard
              icon={<Zap size={22} />}
              iconBg="from-blue-500 to-indigo-600"
              name="Standard"
              price={999}
              description="Grow with ordering, images, and analytics."
              features={[
                'All Free features',
                'Up to 3 restaurants & 3 menus',
                'Menu item images',
                'QR code with ordering',
                'Order management system',
                'Basic analytics dashboard',
                'Multi-language (5 languages)',
                'Employee role management',
              ]}
              limitations={[
                'No KDS',
                'No marketing automation',
              ]}
              ctaLabel="Upgrade to Standard"
              ctaStyle="primary"
              onCta={handleGetStarted}
              highlighted
              index={1}
            />
            <PricingCard
              icon={<Crown size={22} />}
              iconBg="from-amber-400 to-orange-500"
              name="Premium"
              price={2499}
              description="The full suite for serious restaurant operators."
              features={[
                'All Standard features',
                'Unlimited restaurants & menus',
                'Kitchen Display System (KDS)',
                'Basic inventory tracking',
                'Table reservations',
                'Advanced analytics & reporting',
                'Marketing automation (email/SMS)',
                'Customer feedback & ratings',
                'Priority support',
              ]}
              limitations={[]}
              ctaLabel="Go Premium"
              ctaStyle="amber"
              onCta={handleGetStarted}
              index={2}
            />
          </div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 max-w-3xl mx-auto text-center"
          >
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1.5"><Check size={15} className="text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Check size={15} className="text-green-500" /> Cancel anytime</span>
              <span className="flex items-center gap-1.5"><Check size={15} className="text-green-500" /> Free plan forever</span>
              <span className="flex items-center gap-1.5"><Check size={15} className="text-green-500" /> Instant setup</span>
            </div>
            <p className="text-gray-400 text-sm">
              Have questions?{' '}
              <a href="mailto:hello@theogmenu.com" className="text-primary font-semibold hover:underline">
                Talk to us
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="bg-secondary py-16 text-white/90">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                  <UtensilsCrossed size={20} />
                </div>
                <span className="font-display text-2xl font-extrabold tracking-tight">
                  {t('common.appName')}
                </span>
              </div>
              <p className="text-white/60 max-w-xs leading-relaxed">
                {t('common.tagline')}
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
              <p className="text-lg font-medium">Made with ❤️ for Indian Restaurants</p>
              <p className="text-white/40 text-sm">© 2026 theOGMenu. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────── */

function PricingCard({
  icon,
  iconBg,
  name,
  price,
  description,
  features,
  limitations,
  ctaLabel,
  ctaStyle,
  onCta,
  highlighted = false,
  index,
}: {
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limitations: string[];
  ctaLabel: string;
  ctaStyle: 'primary' | 'secondary' | 'amber';
  onCta: () => void;
  highlighted?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className={cn(
        'relative rounded-[2rem] p-8 flex flex-col transition-all duration-300',
        highlighted
          ? 'bg-white border-2 border-primary shadow-2xl shadow-primary/10 scale-[1.03] md:scale-[1.05] z-10'
          : 'bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50'
      )}
    >
      {/* Most Popular badge */}
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-primary/20 whitespace-nowrap">
            ✦ Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4', iconBg)}>
          {icon}
        </div>
        <h3 className="font-display text-xl font-extrabold text-gray-900">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          {price === 0 ? (
            <span className="text-3xl font-extrabold text-gray-900">Free</span>
          ) : (
            <>
              <span className="text-sm font-semibold text-gray-400">₹</span>
              <span className="text-3xl font-extrabold text-gray-900">{price.toLocaleString('en-IN')}</span>
              <span className="text-sm text-gray-400">/month</span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-5" />

      {/* Feature list */}
      <ul className="space-y-2.5 flex-1 mb-7">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
            <Check size={15} className="text-green-500 shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
        {limitations.map((l) => (
          <li key={l} className="flex items-start gap-2.5 text-sm text-gray-400">
            <X size={15} className="text-gray-300 shrink-0 mt-0.5" />
            <span>{l}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onCta}
        className={cn(
          'w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2',
          ctaStyle === 'primary' && 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02]',
          ctaStyle === 'secondary' && 'border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary',
          ctaStyle === 'amber' && 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200 hover:shadow-amber-300 hover:scale-[1.02]',
        )}
      >
        {ctaLabel} <ArrowRight size={15} />
      </button>
    </motion.div>
  );
}

function LanguageToggle() {
  const router = useRouter();

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
      <button 
        className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm rounded-full transition-all" 
        onClick={() => router.push('/en')}
      >
        EN
      </button>
      <button 
        className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm rounded-full transition-all" 
        onClick={() => router.push('/hi')}
      >
        हिं
      </button>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 group"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <div className="scale-125">
          {icon}
        </div>
      </div>
      <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
    </motion.div>
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
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
      <div className={cn(
        "w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5",
        type === 'veg' ? 'border-green-600' : 'border-red-600'
      )}>
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          type === 'veg' ? 'bg-green-600' : 'bg-red-600'
        )} />
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold text-gray-800 flex items-center gap-2 flex-wrap">
          {name}
          {badge && <span className="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        <div className="text-xs font-extrabold text-primary mt-1">{price}</div>
      </div>
    </div>
  );
}
