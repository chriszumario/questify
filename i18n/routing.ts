import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export type AppLocale = (typeof routing.locales)[number];

export function isAppLocale(locale: string): locale is AppLocale {
  return routing.locales.some((supportedLocale) => supportedLocale === locale);
}

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
