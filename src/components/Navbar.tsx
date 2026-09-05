import React from 'react';
import { ViewMode, JewelryProduct } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedProduct: JewelryProduct | null;
  onOpenShare: () => void;
  productCount: number;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  selectedProduct,
  onOpenShare,
  productCount,
  isAdmin,
  onOpenAdmin,
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-[#fcf8fb] border-b border-[#d0c5af]/30 glass-effect">
      <div className="flex items-center gap-3">
        {currentView !== 'home' ? (
          <button
            onClick={() => onViewChange('home')}
            className="p-2 hover:bg-[#eae7ea] rounded-full transition-colors text-[#735c00] active:scale-95 flex items-center justify-center"
            title={t('backToCatalog')}
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        ) : (
          <div className="p-2 text-[#735c00]">
            <span className="material-symbols-outlined text-2xl">diamond</span>
          </div>
        )}

        <div>
          <button
            onClick={() => onViewChange('home')}
            className="font-semibold text-lg md:text-xl text-[#735c00] hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            AiAi Gold
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <div className="flex items-center bg-[#f0edef] p-1 rounded-xl text-[11px] font-bold mr-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-2 py-1.5 rounded-lg transition-all ${
                lang === l.code
                  ? 'bg-white text-[#735c00] shadow-sm'
                  : 'text-[#4d4635] hover:text-[#1b1b1d]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <nav className="flex items-center bg-[#f0edef] p-1 rounded-xl text-xs md:text-sm font-medium mr-2">
          <button
            onClick={() => onViewChange('catalog')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'catalog'
                ? 'bg-white text-[#735c00] shadow-sm font-semibold'
                : 'text-[#4d4635] hover:text-[#1b1b1d]'
            }`}
          >
            {t('catalogTab')} ({productCount})
          </button>
          {currentView === 'detail' && (
            <button
              onClick={() => onViewChange('detail')}
              className="px-3 py-1.5 rounded-lg transition-all bg-white text-[#735c00] shadow-sm font-semibold"
            >
              {t('detailsTab')}
            </button>
          )}
        </nav>

        <button
          onClick={onOpenShare}
          className="p-2 hover:bg-[#eae7ea] rounded-full transition-all text-[#735c00] active:scale-95"
          title={t('share')}
        >
          <span className="material-symbols-outlined">share</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 hover:bg-[#eae7ea] rounded-full transition-all text-[#735c00] active:scale-95"
            title={t('moreOptions')}
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>

          {showMoreMenu && selectedProduct && (
            <div
              className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#d0c5af]/40 py-2 z-50 text-sm"
              onClick={() => setShowMoreMenu(false)}
            >
              <div className="px-4 py-2 border-b border-[#f0edef] text-xs font-semibold uppercase tracking-wider text-[#4d4635]">
                {t('actionsFor')} ({selectedProduct.sku})
              </div>
              <button
                onClick={onOpenShare}
                className="w-full text-left px-4 py-2.5 hover:bg-[#f6f3f5] text-[#1b1b1d] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-[#735c00]">picture_as_pdf</span>
                {t('exportPassport')}
              </button>
              <a
                href={selectedProduct.certificationUrl || 'https://www.gia.edu'}
                target="_blank"
                rel="noreferrer"
                className="w-full text-left px-4 py-2.5 hover:bg-[#f6f3f5] text-[#1b1b1d] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-[#735c00]">open_in_new</span>
                {t('checkCertificate')}
              </a>
            </div>
          )}
        </div>

        <button
          onClick={onOpenAdmin}
          className={`p-2 rounded-full transition-all active:scale-95 ${
            isAdmin
              ? 'bg-[#735c00] text-white hover:bg-[#574500]'
              : 'text-[#735c00] hover:bg-[#eae7ea]'
          }`}
          title={isAdmin ? t('adminLoggedIn') : t('adminLogin')}
        >
          <span className="material-symbols-outlined">admin_panel_settings</span>
        </button>
      </div>
    </header>
  );
};

