'use client';
import { createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import en from '@/locales/en';
import ar from '@/locales/ar';
import { swapLocaleInPath } from '@/lib/i18n';

const translations = { en, ar };

const LanguageContext = createContext(null);

export function LanguageProvider({ lang, children }) {
  const router = useRouter();
  const pathname = usePathname();

  const toggleLang = () => {
    const target = lang === 'en' ? 'ar' : 'en';
    router.push(swapLocaleInPath(pathname, target));
  };

  const t = (key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) val = val?.[k];
    return val ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
