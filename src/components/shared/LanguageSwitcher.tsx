"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { ChangeEvent, useTransition } from 'react';

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    
    // startTransition prevents the UI from freezing during the route change
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <select
      defaultValue={locale}
      disabled={isPending}
      onChange={onSelectChange}
      className="bg-transparent text-brand-secondary text-sm font-medium cursor-pointer hover:text-sand-700 outline-none transition-colors disabled:opacity-50"
    >
      <option value="pt">🇧🇷 PT</option>
      <option value="en">🇬🇧 EN</option>
    </select>
  );
};