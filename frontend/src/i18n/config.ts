export const locales = ['en', 'hi'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
