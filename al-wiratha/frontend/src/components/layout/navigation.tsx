'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/logo';
import { Calculator, Building2, Mosque, LogIn, UserPlus } from 'lucide-react';

interface NavigationProps {
  locale: string;
}

const navItems = [
  { key: 'inheritance', href: '/inheritance', icon: Calculator },
  { key: 'estates', href: '/estates', icon: Building2 },
  { key: 'waqf', href: '/waqf', icon: Mosque },
];

export function Navigation({ locale }: NavigationProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const isActive = (href: string) => pathname.includes(href);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 flex-col bg-primary text-white z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-primary-600">
          <Logo size={36} variant="dark" />
          <div>
            <h1 className="text-xl font-bold text-secondary">ورثة</h1>
            <p className="text-xs text-primary-200 leading-tight">منصة المواريث الشرعية</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ key, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={key}
                href={`/${locale}${href}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-secondary text-primary font-semibold'
                    : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                }`}
              >
                <Icon size={20} className={active ? 'text-primary' : 'text-primary-300 group-hover:text-white'} />
                <span className="text-sm">{t(key as 'inheritance' | 'estates' | 'waqf')}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth Links */}
        <div className="px-4 pb-6 space-y-2 border-t border-primary-600 pt-4">
          <Link
            href={`/${locale}/login`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary-100 hover:bg-primary-600 hover:text-white transition-all duration-200 text-sm"
          >
            <LogIn size={18} />
            <span>{t('login')}</span>
          </Link>
          <Link
            href={`/${locale}/register`}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary text-primary font-semibold text-sm hover:bg-secondary-400 transition-all duration-200"
          >
            <UserPlus size={18} />
            <span>{t('register')}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ key, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={key}
                href={`/${locale}${href}`}
                className="flex flex-col items-center gap-1 px-3 py-2 min-w-0 flex-1"
              >
                <Icon
                  size={22}
                  className={active ? 'text-primary' : 'text-gray-400'}
                />
                <span className={`text-xs truncate ${active ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                  {t(key as 'inheritance' | 'estates' | 'waqf')}
                </span>
              </Link>
            );
          })}
          <Link
            href={`/${locale}/login`}
            className="flex flex-col items-center gap-1 px-3 py-2 min-w-0 flex-1"
          >
            <LogIn size={22} className="text-gray-400" />
            <span className="text-xs text-gray-400">{t('login')}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
