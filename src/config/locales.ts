export const locales = ["en", "hi", "pa"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  pa: "ਪੰਜਾਬੀ",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
