import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'ru'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

// Import messages from the messages file
import { messages } from './messages';

export function getMessages(locale: string) {
  if (!locales.includes(locale as any)) {
    notFound();
  }
  
  return messages[locale as keyof typeof messages];
}
