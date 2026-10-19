import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@/config/locales";
import CustomerCareWidget from "@/components/chat/CustomerCareWidget";

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><div lang={locale}>{children}</div><CustomerCareWidget locale={locale} /></>;
}
