import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from '@/components/providers';
import { Navigation } from '@/components/layout/navigation';
import '@/app/globals.css';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-arabic',
});

export const metadata: Metadata = {
  title: 'ورثة | Warathah',
  description: 'منصة إدارة وتقسيم التركات والأوقاف',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'ar' | 'en')) notFound();
  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={`${ibmPlexArabic.variable} font-sans bg-background text-gray-900 min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navigation locale={locale} />
            <main className="pb-20 lg:pb-0 lg:ps-64">
              {children}
            </main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
