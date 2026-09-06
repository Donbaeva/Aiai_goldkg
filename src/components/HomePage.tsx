import React from 'react';
import { JewelryProduct } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice, isVideoSrc } from '../utils/format';
import { WHATSAPP_NUMBER, INSTAGRAM_USERNAME, PHONE_NUMBER, PHONE_HREF } from '../config';
import { CategoryCovers } from '../services/catalogStore';
import { MediaFrame, useHeroMedia } from './MediaFrame';

interface HomePageProps {
  products: JewelryProduct[];
  categories: string[];
  categoryCovers: CategoryCovers;
  onShopNow: () => void;
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: JewelryProduct) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  categoryCovers,
  onShopNow,
  onSelectCategory,
  onSelectProduct,
}) => {
  const { t } = useLanguage();
  const hero = useHeroMedia();

  const featured = products.filter((p) => p.status !== 'ПРОДАНО').slice(0, 4);
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}`;
  const instagramHref = `https://instagram.com/${INSTAGRAM_USERNAME}`;

  return (
    <div className="bg-[#f7f3eb]">
      <div className="bg-[#9a7b1a] text-[#f7f3eb] text-center text-[11px] md:text-xs py-2.5 px-4 tracking-[0.12em] uppercase font-light">
        {t('homeAnnouncement')}{' '}
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="underline font-medium">
          {t('homeAnnouncementCta')}
        </a>
      </div>

      <section className="relative h-[72vh] min-h-[420px] max-h-[820px] overflow-hidden bg-[#1a1a1a]">
        {hero.kind === 'video' ? (
          <video
            key={hero.src}
            src={hero.src}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
          />
        ) : (
          <img
            src={hero.src}
            alt="AiAi Gold"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="brand-mark text-[#e8d5a3] text-sm md:text-base tracking-[0.4em] animate-fade-up">
            AiAi&nbsp;Gold
          </p>
          <h1 className="font-brand text-4xl md:text-6xl lg:text-7xl text-white font-medium mt-4 mb-5 max-w-3xl leading-[1.1] animate-fade-up-delay">
            {t('homeHeroTitle')}
          </h1>
          <p className="text-sm md:text-base text-white/85 font-light max-w-lg leading-relaxed mb-10 animate-fade-up-delay">
            {t('homeHeroText')}
          </p>
          <button
            onClick={onShopNow}
            className="border border-[#e8d5a3] text-[#e8d5a3] px-10 py-3.5 text-[11px] md:text-xs font-medium uppercase tracking-[0.28em] hover:bg-[#e8d5a3] hover:text-[#1a1a1a] transition-all duration-300 active:scale-[0.98]"
          >
            {t('homeHeroCta')}
          </button>
        </div>
      </section>

      <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-20">
        <h2 className="font-brand text-3xl md:text-4xl text-[#1a1a1a] text-center mb-3 font-medium">
          {t('homeCategoriesTitle')}
        </h2>
        <div className="w-12 h-px bg-[#c9a227] mx-auto mb-12" />

        {categories.length === 0 ? (
          <p className="text-center text-sm text-[#6b6356] font-light">
            Категории появятся здесь — добавьте их в админке
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {categories.map((cat) => {
              const cover = categoryCovers[cat];
              return (
                <button key={cat} onClick={() => onSelectCategory(cat)} className="group text-left">
                  <div className="aspect-[3/4] overflow-hidden bg-[#efe8da] relative">
                    {cover ? (
                      <MediaFrame
                        src={cover}
                        alt={cat}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#c9a227] px-3">
                        <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                        <span className="text-[10px] uppercase tracking-wider text-center text-[#6b6356]">
                          Превью в админке
                        </span>
                      </div>
                    )}
                    {cover && isVideoSrc(cover) && (
                      <span className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center pointer-events-none">
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                      </span>
                    )}
                  </div>
                  <p className="text-center text-[11px] md:text-xs font-medium uppercase tracking-[0.22em] text-[#1a1a1a] mt-4">
                    {cat}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {featured.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-4 md:px-8 pb-20">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="font-brand text-3xl md:text-4xl text-[#1a1a1a] font-medium">
                {t('homeFeaturedTitle')}
              </h2>
              <div className="w-12 h-px bg-[#c9a227] mt-3" />
            </div>
            <button
              onClick={onShopNow}
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#9a7b1a] hover:text-[#c9a227] transition-colors"
            >
              {t('homeFeaturedCta')}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {featured.map((product) => {
              const cover = product.images[0];
              return (
                <button
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group text-left"
                >
                  <div className="aspect-square overflow-hidden bg-[#efe8da] relative">
                    {cover ? (
                      <MediaFrame
                        src={cover}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#efe8da]" />
                    )}
                    {cover && isVideoSrc(cover) && (
                      <span className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                      </span>
                    )}
                  </div>
                  <p className="font-brand text-lg text-[#1a1a1a] mt-3 leading-snug group-hover:text-[#9a7b1a] transition-colors">
                    {product.name}
                  </p>
                  <p className="text-sm font-medium text-[#9a7b1a] tracking-wide">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="bg-[#efe8da] py-20 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <span className="material-symbols-outlined text-3xl text-[#9a7b1a] mb-4 block">chat</span>
            <h3 className="font-brand text-2xl text-[#1a1a1a] mb-2">{t('homeValue1Title')}</h3>
            <p className="text-sm text-[#6b6356] mb-4 font-light leading-relaxed">{t('homeValue1Text')}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9a7b1a] hover:underline"
            >
              {t('homeValue1Cta')}
            </a>
          </div>
          <div>
            <span className="material-symbols-outlined text-3xl text-[#9a7b1a] mb-4 block">
              local_shipping
            </span>
            <h3 className="font-brand text-2xl text-[#1a1a1a] mb-2">{t('homeValue2Title')}</h3>
            <p className="text-sm text-[#6b6356] mb-4 font-light leading-relaxed">{t('homeValue2Text')}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9a7b1a] hover:underline"
            >
              {t('homeValue2Cta')}
            </a>
          </div>
          <div>
            <span className="material-symbols-outlined text-3xl text-[#9a7b1a] mb-4 block">verified</span>
            <h3 className="font-brand text-2xl text-[#1a1a1a] mb-2">{t('homeValue3Title')}</h3>
            <p className="text-sm text-[#6b6356] mb-4 font-light leading-relaxed">{t('homeValue3Text')}</p>
            <button
              onClick={onShopNow}
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9a7b1a] hover:underline"
            >
              {t('homeValue3Cta')}
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#1a1a1a] text-[#e8d5a3]/80 py-16 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="brand-mark text-[#e8d5a3] text-xl tracking-[0.28em] mb-4">AiAi&nbsp;Gold</h3>
            <p className="text-sm text-[#a89c87] leading-relaxed max-w-xs font-light">
              {t('homeFooterAbout')}
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#c9a227] mb-5">
              {t('homeFooterContacts')}
            </h4>
            <div className="flex flex-col gap-2.5 text-sm font-light">
              <a href={PHONE_HREF} className="hover:text-[#e8d5a3] transition-colors">
                {PHONE_NUMBER}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#e8d5a3] transition-colors"
              >
                WhatsApp: +{WHATSAPP_NUMBER}
              </a>
              <a
                href={instagramHref}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#e8d5a3] transition-colors"
              >
                Instagram: @{INSTAGRAM_USERNAME}
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#c9a227] mb-5">
              {t('homeFooterCatalog')}
            </h4>
            <button
              onClick={onShopNow}
              className="text-sm font-light hover:text-[#e8d5a3] transition-colors"
            >
              {t('homeFeaturedCta')}
            </button>
          </div>
        </div>
        <div className="max-w-screen-xl mx-auto border-t border-white/10 mt-12 pt-6 text-[11px] text-[#a89c87] tracking-wide">
          © {new Date().getFullYear()} {t('homeFooterLegal')}
        </div>
      </footer>
    </div>
  );
};
