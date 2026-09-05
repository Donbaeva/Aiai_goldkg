import React from 'react';
import { JewelryProduct } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice } from '../utils/format';
import { WHATSAPP_NUMBER, INSTAGRAM_USERNAME } from '../config';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1689070901068-a7cae2bbc36f?auto=format&fit=crop&w=1600&q=80';

const CATEGORY_IMAGES: Record<string, string> = {
  'Кольца': 'https://images.unsplash.com/photo-1689070901068-a7cae2bbc36f?auto=format&fit=crop&w=800&q=80',
  'Колье и Цепи': 'https://images.unsplash.com/photo-1611107683227-e9060eccd846?auto=format&fit=crop&w=800&q=80',
  'Серьги': 'https://images.unsplash.com/photo-1704445010872-2faefdd733aa?auto=format&fit=crop&w=800&q=80',
  'Браслеты': 'https://images.unsplash.com/photo-1583315528236-b893494a35ee?auto=format&fit=crop&w=800&q=80',
  'Жесткие браслеты': 'https://images.unsplash.com/photo-1583315528236-b893494a35ee?auto=format&fit=crop&w=800&q=80',
};
const FALLBACK_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1611107683227-e9060eccd846?auto=format&fit=crop&w=800&q=80';

interface HomePageProps {
  products: JewelryProduct[];
  categories: string[];
  onShopNow: () => void;
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: JewelryProduct) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  onShopNow,
  onSelectCategory,
  onSelectProduct,
}) => {
  const { t } = useLanguage();

  const featured = products.filter((p) => p.status !== 'ПРОДАНО').slice(0, 4);
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}`;
  const instagramHref = `https://instagram.com/${INSTAGRAM_USERNAME}`;

  return (
    <div className="bg-[#fcf8fb]">
      {/* Announcement bar */}
      <div className="bg-[#735c00] text-white text-center text-xs md:text-sm py-2.5 px-4">
        {t('homeAnnouncement')}{' '}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="underline font-semibold">
          {t('homeAnnouncementCta')}
        </a>
      </div>

      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="h-[360px] lg:h-[560px] overflow-hidden">
          <img src={HERO_IMAGE} alt="AiAi Gold" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center justify-center p-8 md:p-16 bg-[#f6f3f5]">
          <div className="max-w-md">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#735c00]">
              {t('homeHeroKicker')}
            </span>
            <h1 className="text-3xl md:text-5xl font-semibold text-[#1b1b1d] mt-3 mb-5 leading-tight">
              {t('homeHeroTitle')}
            </h1>
            <p className="text-sm md:text-base text-[#4d4635] leading-relaxed mb-8">
              {t('homeHeroText')}
            </p>
            <button
              onClick={onShopNow}
              className="bg-[#735c00] text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#574500] transition-all shadow-lg shadow-[#735c00]/20 active:scale-95"
            >
              {t('homeHeroCta')}
            </button>
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1b1b1d] text-center mb-10">
          {t('homeCategoriesTitle')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className="group text-left"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#e0e0db]">
                <img
                  src={CATEGORY_IMAGES[cat] || FALLBACK_CATEGORY_IMAGE}
                  alt={cat}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-center text-xs md:text-sm font-semibold uppercase tracking-wide text-[#1b1b1d] mt-3">
                {cat}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-4 md:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#1b1b1d]">
              {t('homeFeaturedTitle')}
            </h2>
            <button
              onClick={onShopNow}
              className="text-sm font-semibold text-[#735c00] hover:underline flex items-center gap-1"
            >
              {t('homeFeaturedCta')}
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group text-left"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-[#e0e0db]">
                  <img
                    src={product.images[0] || FALLBACK_CATEGORY_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm font-semibold text-[#1b1b1d] mt-3 leading-snug">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-[#735c00]">
                  {formatPrice(product.price, product.currency)}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Value props */}
      <section className="bg-[#f6f3f5] py-16 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div>
            <span className="material-symbols-outlined text-3xl text-[#735c00] mb-3 block">chat</span>
            <h3 className="font-semibold text-lg text-[#1b1b1d] mb-2">{t('homeValue1Title')}</h3>
            <p className="text-sm text-[#4d4635] mb-4">{t('homeValue1Text')}</p>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#735c00] hover:underline">
              {t('homeValue1Cta')}
            </a>
          </div>
          <div>
            <span className="material-symbols-outlined text-3xl text-[#735c00] mb-3 block">local_shipping</span>
            <h3 className="font-semibold text-lg text-[#1b1b1d] mb-2">{t('homeValue2Title')}</h3>
            <p className="text-sm text-[#4d4635] mb-4">{t('homeValue2Text')}</p>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#735c00] hover:underline">
              {t('homeValue2Cta')}
            </a>
          </div>
          <div>
            <span className="material-symbols-outlined text-3xl text-[#735c00] mb-3 block">verified</span>
            <h3 className="font-semibold text-lg text-[#1b1b1d] mb-2">{t('homeValue3Title')}</h3>
            <p className="text-sm text-[#4d4635] mb-4">{t('homeValue3Text')}</p>
            <button onClick={onShopNow} className="text-sm font-semibold text-[#735c00] hover:underline">
              {t('homeValue3Cta')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1b1b1d] text-[#e0dcd3] py-14 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-semibold text-lg text-white mb-3">AiAi Gold</h3>
            <p className="text-sm text-[#a89c87] leading-relaxed max-w-xs">{t('homeFooterAbout')}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-4">
              {t('homeFooterContacts')}
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                WhatsApp: +{WHATSAPP_NUMBER}
              </a>
              <a href={instagramHref} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Instagram: @{INSTAGRAM_USERNAME}
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-4">
              {t('homeFooterCatalog')}
            </h4>
            <button onClick={onShopNow} className="text-sm hover:text-white transition-colors">
              {t('homeFeaturedCta')}
            </button>
          </div>
        </div>
        <div className="max-w-screen-xl mx-auto border-t border-white/10 mt-10 pt-6 text-xs text-[#a89c87]">
          © {new Date().getFullYear()} {t('homeFooterLegal')}
        </div>
      </footer>
    </div>
  );
};

