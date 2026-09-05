import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lang, t as translate, statusLabel as statusLabelFor } from '../i18n/translations';

const STORAGE_KEY = 'aiaigold_lang';

function detectDefaultLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'ky' || saved === 'en') return saved;
  } catch {
    // localStorage unavailable — fall through to default
  }
  return 'ru';
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  statusLabel: (status: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ru',
  setLang: () => {},
  t: (key) => key,
  statusLabel: (status) => status,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(detectDefaultLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: (key: string) => translate(lang, key),
        statusLabel: (status: string) => statusLabelFor(lang, status),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}

