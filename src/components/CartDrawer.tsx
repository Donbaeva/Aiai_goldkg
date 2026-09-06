import React, { useState } from 'react';
import { JewelryProduct } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { buildOrderMessage } from '../i18n/translations';
import { WHATSAPP_NUMBER, INSTAGRAM_USERNAME } from '../config';
import { formatPrice, isVideoSrc } from '../utils/format';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: JewelryProduct[];
  favoriteIds: string[];
  onClearFavorites: () => void;
  onRemoveFavorite: (id: string) => void;
  onSelectProduct: (product: JewelryProduct) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  products,
  favoriteIds,
  onClearFavorites,
  onRemoveFavorite,
  onSelectProduct,
}) => {
  const { lang, t } = useLanguage();
  const [showChoices, setShowChoices] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  if (!isOpen) return null;

  const items = products.filter((p) => favoriteIds.includes(p.id));
  const skus = items.map((p) => p.sku || p.name);
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
      // ignore
    }
    window.open(`https://ig.me/m/${INSTAGRAM_USERNAME}`, '_blank');
    setShowChoices(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <aside className="relative w-full max-w-md h-full bg-[#f7f3eb] shadow-2xl border-l border-[#c9a227]/25 flex flex-col animate-fade-up">
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#c9a227]/20">
          <div>
            <p className="brand-mark text-lg text-[#9a7b1a] tracking-[0.22em]">AiAi Gold</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b6356] mt-1">
              {t('cart')} · {items.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#efe8da] text-[#9a7b1a]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <span className="material-symbols-outlined text-4xl text-[#c9a227] mb-3 block">
                shopping_bag
              </span>
              <p className="text-sm text-[#6b6356]">{t('cartEmpty')}</p>
            </div>
          ) : (
            items.map((product) => {
              const cover = product.images[0];
              return (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 bg-white/60 border border-[#c9a227]/15"
                >
                  <button
                    type="button"
                    className="w-20 h-20 shrink-0 overflow-hidden bg-[#efe8da]"
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                  >
                    {cover ? (
                      isVideoSrc(cover) ? (
                        <video src={cover} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={cover} alt="" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full bg-[#efe8da]" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-[#6b6356]">
                      {product.sku}
                    </p>
                    <p className="font-medium text-sm text-[#1a1a1a] truncate">{product.name}</p>
                    <p className="text-sm text-[#9a7b1a] font-semibold mt-1">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveFavorite(product.id)}
                    className="self-start p-1 text-[#6b6356] hover:text-[#9a7b1a]"
                    title={t('removeFromFavorites')}
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#c9a227]/20 p-5 space-y-3">
            {copiedNotice && (
              <p className="text-xs text-center bg-[#c9a227]/10 text-[#9a7b1a] py-2 px-3">
                {t('instagramCopied')}
              </p>
            )}
            {showChoices ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-center text-[#6b6356] uppercase tracking-wider">
                  {t('chooseWhere')}
                </p>
                <button
                  onClick={sendWhatsApp}
                  className="w-full bg-[#25D366] text-white py-3.5 font-semibold text-sm tracking-wide"
                >
                  WhatsApp
                </button>
                <button
                  onClick={sendInstagram}
                  className="w-full bg-[#1a1a1a] text-white py-3.5 font-semibold text-sm tracking-wide"
                >
                  Instagram
                </button>
                <button
                  onClick={() => setShowChoices(false)}
                  className="text-xs text-[#6b6356] py-2"
                >
                  {t('cartCancel')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onClearFavorites}
                  className="px-4 py-3.5 border border-[#c9a227]/40 text-[#6b6356] text-xs uppercase tracking-wider hover:bg-[#efe8da]"
                >
                  {t('cartClear')}
                </button>
                <button
                  onClick={() => setShowChoices(true)}
                  className="flex-1 bg-[#9a7b1a] text-white py-3.5 font-semibold text-sm tracking-[0.12em] uppercase hover:bg-[#7a6214] transition-colors"
                >
                  {t('orderButton')}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
