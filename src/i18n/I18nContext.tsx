import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const SPANISH_TIMEZONES = [
  'Europe/Madrid',
  'Africa/Ceuta',
  'Atlantic/Canary',
  'America/Mexico_City',
  'America/Bogota',
  'America/Buenos_Aires',
  'America/Santiago',
  'America/Lima',
  'America/Caracas',
  'America/Montevideo',
  'America/Asuncion',
  'America/La_Paz',
  'America/Guayaquil',
  'America/Guatemala',
  'America/Havana',
  'America/Santo_Domingo',
  'America/Tegucigalpa',
  'America/El_Salvador',
  'America/Managua',
  'America/Costa_Rica',
  'America/Panama',
  'America/Puerto_Rico',
];

export const detectLocationLanguage = (): Language => {
  // 1. Stored user preference always takes precedence
  const stored = localStorage.getItem('kuroscan_lang');
  if (stored === 'es' || stored === 'en') {
    return stored;
  }

  try {
    // 2. Check Browser/System Locale
    const navLangs = navigator.languages || [navigator.language || ''];
    for (const l of navLangs) {
      if (l.toLowerCase().startsWith('es')) {
        return 'es';
      }
    }

    // 3. Check System Timezone / Location
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (SPANISH_TIMEZONES.some((tz) => timeZone.toLowerCase().includes(tz.toLowerCase()))) {
      return 'es';
    }
  } catch {
    // Fallback safely
  }

  // Any non-Spanish speaking country directly defaults to English
  return 'en';
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => detectLocationLanguage());

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('kuroscan_lang', newLang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text: string = dict[key] || translations.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
