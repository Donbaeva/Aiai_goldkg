import React from 'react';
import { ViewMode } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../i18n/translations';
import {
  WHATSAPP_NUMBER,
  INSTAGRAM_USERNAME,
  PHONE_NUMBER,
  PHONE_HREF,
} from '../config';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  productCount: number;
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  productCount,
  cartCount,
  onOpenCart,
  isAdmin,
  onOpenAdmin,
}) => {
  const [showContacts, setShowContacts] = React.useState(false);
  const [showLangMenu, setShowLangMenu] = React.useState(false);
  const contactsRef = React.useRef<HTMLDivElement>(null);
  const langRef = React.useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useLanguage();

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (contactsRef.current && !contactsRef.current.contains(e.target as Node)) {
        setShowContacts(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}`;
  const instagramHref = `https://instagram.com/${INSTAGRAM_USERNAME}`;
  const currentLangLabel = LANGUAGES.find((l) => l.code === lang)?.label ?? lang;
  const otherLanguages = LANGUAGES.filter((l) => l.code !== lang);

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-[#c9a227]/25 glass-effect">
      <div className="relative h-[5.5rem] sm:h-24 md:h-28 lg:h-32 flex items-center justify-between px-2 sm:px-4 md:px-8">
        {/* Left: back (home has nothing here now — catalog button removed) */}
        <div className="flex items-center gap-0.5 min-w-0 z-10 flex-shrink-0">
          {currentView !== 'home' && (
            <button
              onClick={() => onViewChange('home')}
              className="p-1.5 sm:p-2 hover:bg-[#efe8da] rounded-full transition-colors text-[#9a7b1a] active:scale-95 flex-shrink-0"
              title={t('backToCatalog')}
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">arrow_back</span>
            </button>
          )}

          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangMenu((v) => !v)}
              className="flex items-center gap-0.5 pl-2.5 pr-1.5 py-1.5 bg-[#efe8da]/80 hover:bg-[#efe8da] rounded-full text-[10px] font-semibold text-[#9a7b1a] transition-all"
            >
              {currentLangLabel}
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>

            {showLangMenu && (
              <div className="absolute left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-[#c9a227]/25 overflow-hidden z-50 min-w-[52px] animate-fade-up">
                {otherLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setShowLangMenu(false);
                    }}
                    className="block w-full text-center px-3 py-2 text-[10px] font-semibold text-[#6b6356] hover:bg-[#efe8da] hover:text-[#1a1a1a] transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center brand — Tiffany-style, large */}
        <button
          onClick={() => onViewChange('home')}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center group max-w-[58vw] sm:max-w-[68vw] md:max-w-[75vw]"
          aria-label="AiAi Gold"
        >
          <span className="brand-mark block leading-none text-[#9a7b1a] group-hover:text-[#c9a227] transition-colors whitespace-nowrap text-[1.5rem] tracking-[0.06em] sm:text-[2.5rem] sm:tracking-[0.12em] md:text-[3.75rem] md:tracking-[0.16em] lg:text-[5rem] lg:tracking-[0.2em]">
            AiAi Gold
          </span>
          <span className="hidden sm:block text-[9px] md:text-[10px] font-sans font-light uppercase tracking-[0.35em] text-[#6b6356] mt-1 md:mt-2">
            {t('brandTagline')}
          </span>
        </button>

        {/* Right: contact + cart + admin */}
        <div className="flex items-center gap-0 sm:gap-0.5 md:gap-1 z-10 flex-shrink-0">
          <div className="relative" ref={contactsRef}>
            <button
              onClick={() => setShowContacts((v) => !v)}
              className="inline-flex items-center gap-1.5 px-1.5 sm:px-2.5 md:px-3 py-2 text-[10px] md:text-xs font-medium uppercase tracking-[0.16em] text-[#9a7b1a] hover:bg-[#efe8da] rounded-full transition-all"
              title={t('contactUs')}
            >
              <span className="material-symbols-outlined text-lg sm:text-xl md:text-[22px]">call</span>
              <span className="hidden md:inline">{t('contactUs')}</span>
            </button>

            {showContacts && (
              <div className="absolute right-0 mt-2 w-72 bg-[#f7f3eb] rounded-sm shadow-xl border border-[#c9a227]/30 py-3 z-50 text-sm animate-fade-up">
                <div className="px-4 pb-2 mb-1 border-b border-[#c9a227]/20">
                  <p className="brand-mark text-sm text-[#9a7b1a] tracking-[0.2em]">AiAi Gold</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#6b6356] mt-1">
                    {t('contactUs')}
                  </p>
                </div>
                <a
                  href={PHONE_HREF}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#efe8da] text-[#1a1a1a] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#9a7b1a]">phone_in_talk</span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-wider text-[#6b6356]">
                      {t('phoneLabel')}
                    </span>
                    {PHONE_NUMBER}
                  </span>
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#efe8da] text-[#1a1a1a] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#25D366]">chat</span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-wider text-[#6b6356]">
                      WhatsApp
                    </span>
                    +{WHATSAPP_NUMBER}
                  </span>
                </a>
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#efe8da] text-[#1a1a1a] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#9a7b1a]">photo_camera</span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-wider text-[#6b6356]">
                      Instagram
                    </span>
                    @{INSTAGRAM_USERNAME}
                  </span>
                </a>
              </div>
            )}
          </div>

          <button
            onClick={onOpenCart}
            className="relative p-1.5 sm:p-2 hover:bg-[#efe8da] rounded-full transition-all text-[#9a7b1a] active:scale-95"
            title={t('cart')}
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c9a227] text-white text-[10px] font-semibold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAdmin}
            className={`p-1.5 sm:p-2 rounded-full transition-all active:scale-95 ${
              isAdmin
                ? 'bg-[#9a7b1a] text-white hover:bg-[#7a6214]'
                : 'text-[#9a7b1a]/70 hover:bg-[#efe8da]'
            }`}
            title={isAdmin ? t('adminLoggedIn') : t('adminLogin')}
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">admin_panel_settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

