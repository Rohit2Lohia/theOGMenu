'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Image as ImageIcon, 
  QrCode, 
  User, 
  LogOut, 
  Menu, 
  X,
  UtensilsCrossed,
  Crown
} from 'lucide-react';
import { isAuthenticated, getStoredUser, logout } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'overview', path: '/dashboard', icon: LayoutDashboard },
  { key: 'menuEditor', path: '/dashboard/menu-editor', icon: ClipboardList },
  { key: 'gallery', path: '/dashboard/gallery', icon: ImageIcon },
  { key: 'qrCodes', path: '/dashboard/qr-codes', icon: QrCode },
  { key: 'subscription', path: '/dashboard/subscription', icon: Crown },
  { key: 'profile', path: '/dashboard/profile', icon: User },
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
    // Refresh user profile to get latest tier info
    import('@/lib/api').then(({ api }) => {
      const token = getStoredUser() ? localStorage.getItem('theogmenu_access_token') : null;
      if (token) {
        api.getMe(token).then((me: any) => {
          setUser((prev: any) => ({ ...prev, ...me }));
        }).catch(() => {});
      }
    });
  }, [router]);

  const isActive = (path: string) => {
    const cleanPath = pathname.replace(/^\/(en|hi)/, '');
    if (path === '/dashboard') return cleanPath === '/dashboard';
    return cleanPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transition-transform duration-300 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <UtensilsCrossed size={20} />
              </div>
              <span className="font-display text-xl font-extrabold text-gray-900 tracking-tight">theOGMenu</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.key}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                    active 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => {
                    router.push(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={20} className={active ? "text-primary" : "text-gray-400"} />
                  <span>{t(`nav.${item.key}`)}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-50">
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200" 
              onClick={logout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-30">
          <button
            className="p-2 -ml-2 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex-1 lg:hidden ml-4">
             <span className="font-display font-bold text-lg text-gray-900">Dashboard</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold text-gray-900 leading-none">
                {user?.name || 'Restaurant Owner'}
              </div>
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block',
                user?.tier === 'premium' ? 'bg-amber-100 text-amber-700' :
                user?.tier === 'standard' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              )}>
                {user?.tier || 'free'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              {(user?.name?.[0] || 'R').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
