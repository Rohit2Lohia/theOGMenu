import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is supported
  if (!locales.includes(locale as Locale)) {
    return { messages: {} };
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
