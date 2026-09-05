import React, { useState } from 'react';
import { JewelryProduct } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { buildOrderMessage } from '../i18n/translations';
import { WHATSAPP_NUMBER, INSTAGRAM_USERNAME } from '../config';

interface OrderBarProps {
  products: JewelryProduct[];
  favoriteIds: string[];
  onClearFavorites: () => void;
}

export const OrderBar: React.FC<OrderBarProps> = ({ products, favoriteIds, onClearFavorites }) => {
  const { lang, t } = useLanguage();
  const [showChoices, setShowChoices] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  if (favoriteIds.length === 0) return null;

  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));
  const skus = favoriteProducts.map((p) => p.sku || p.name);
  const message = buildOrderMessage(lang, skus);

  const sendWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    setShowChoices(false);
  };

  const sendInstagram = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 4000);
    } catch {
      // clipboard may be unavailable — still open Instagram
    }
    window.open(`https://ig.me/m/${INSTAGRAM_USERNAME}`, '_blank');
    setShowChoices(false);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 sm:p-6 glass-effect z-40 border-t border-[#d0c5af]/30 shadow-2xl">
      <div className="max-w-screen-xl mx-auto">
        {copiedNotice && (
          <div className="mb-2 text-xs text-center bg-[#735c00]/10 text-[#735c00] rounded-xl py-2 px-3">
            {t('instagramCopied')}
          </div>
        )}

        {showChoices ? (
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium text-[#4d4635] hidden sm:block">
              {t('chooseWhere')}
            </span>
            <button
              onClick={sendWhatsApp}
              className="flex-1 sm:flex-none bg-[#25D366] text-white px-5 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">chat</span>
              {t('whatsapp')}
            </button>
            <button
              onClick={sendInstagram}
              className="flex-1 sm:flex-none bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white px-5 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">photo_camera</span>
              {t('instagram')}
            </button>
            <button
              onClick={() => setShowChoices(false)}
              className="p-3.5 rounded-2xl border border-[#d0c5af] text-[#4d4635] hover:bg-[#eae7ea]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#ba1a1a]/10 text-[#ba1a1a] flex-shrink-0">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-xs text-[#4d4635] truncate">{t('orderCount')}</p>
                <p className="text-sm font-bold text-[#1b1b1d]">{favoriteIds.length}</p>
              </div>
            </div>
            <button
              onClick={onClearFavorites}
              className="p-2 text-[#4d4635] hover:bg-[#eae7ea] rounded-full"
              title={t('removeFromFavorites')}
            >
              <span className="material-symbols-outlined">delete_outline</span>
            </button>
            <button
              onClick={() => setShowChoices(true)}
              className="bg-[#735c00] text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#574500] active:scale-[0.98] transition-all shadow-lg shadow-[#735c00]/25"
            >
              <span className="material-symbols-outlined text-xl">send</span>
              {t('orderButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

