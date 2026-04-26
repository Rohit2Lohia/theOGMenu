import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/styles/globals.css';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return {
    title: 'theOGMenu — Digital QR Menus for Indian Restaurants',
    description:
      'Create beautiful, multi-lingual digital menus with QR codes for your restaurant. Free for Indian restaurants. Veg/Non-veg filters, photo gallery, customer reviews, and Google Maps integration.',
    keywords: 'QR menu, digital menu, restaurant menu, Indian restaurant, food menu, QR code',
    openGraph: {
      title: 'theOGMenu — Digital QR Menus for Indian Restaurants',
      description: 'Create beautiful digital menus with QR codes. Free for Indian restaurants.',
      type: 'website',
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#FF6B35" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
