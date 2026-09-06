import React, { useEffect, useRef, useState } from 'react';
import { JewelryProduct } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { formatPrice, isVideoSrc } from '../utils/format';
import { WHATSAPP_NUMBER, INSTAGRAM_USERNAME, PHONE_NUMBER, PHONE_HREF, HERO_FALLBACK_IMAGE } from '../config';
import { CategoryCovers, HeroSettings } from '../services/catalogStore';
import { readVideoFile, resizeImageFile } from '../utils/media';
import { MediaFrame } from './MediaFrame';

interface HomePageProps {
  products: JewelryProduct[];
  categories: string[];
  categoryCovers: CategoryCovers;
  heroSettings: HeroSettings;
  onSaveHero: (settings: HeroSettings) => void;
  onShopNow: () => void;
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: JewelryProduct) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  categoryCovers,
  heroSettings,
  onSaveHero,
  onShopNow,
  onSelectCategory,
  onSelectProduct,
}) => {
  const { lang, t } = useLanguage();
  const { isAdmin } = useAdmin();

  // Parallax: track scroll position, apply a slower vertical shift to the hero media.
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Admin hero editor
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [heroBusy, setHeroBusy] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState(heroSettings.captions);
  const heroPhotoRef = useRef<HTMLInputElement>(null);
  const heroVideoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCaptionDrafts(heroSettings.captions);
  }, [heroSettings.captions]);

  const handleHeroPhoto = async (file: File | undefined) => {
    if (!file) return;
    setHeroError(null);
    setHeroBusy(true);
    try {
      const src = await resizeImageFile(file, 2000, 0.85);
      onSaveHero({ ...heroSettings, media: src });
    } catch (err) {
      setHeroError(err instanceof Error ? err.message : String(err));
    } finally {
      setHeroBusy(false);
    }
  };

  const handleHeroVideo = async (file: File | undefined) => {
    if (!file) return;
    setHeroError(null);
    setHeroBusy(true);
    try {
      const src = await readVideoFile(file);
      onSaveHero({ ...heroSettings, media: src });
    } catch (err) {
      setHeroError(err instanceof Error ? err.message : String(err));
    } finally {
      setHeroBusy(false);
    }
  };

  const saveCaptions = () => {
    onSaveHero({ ...heroSettings, captions: captionDrafts });
    setIsEditingHero(false);
  };

  const heroSrc = heroSettings.media || HERO_FALLBACK_IMAGE;
  const heroIsVideo = isVideoSrc(heroSrc);
  const heroCaption = heroSettings.captions[lang] || t('homeHeroTitle');

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
        <div
          className="absolute left-0 w-full h-[130%] -top-[15%]"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        >
          {heroIsVideo ? (
            <video
              key={heroSrc}
              src={heroSrc}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img src={heroSrc} alt="AiAi Gold" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="brand-mark text-[#e8d5a3] text-sm md:text-base tracking-[0.4em] animate-fade-up">
            AiAi&nbsp;Gold
          </p>
          <h1 className="font-brand text-4xl md:text-6xl lg:text-7xl text-white font-medium mt-4 mb-5 max-w-3xl leading-[1.1] animate-fade-up-delay">
            {heroCaption}
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

        {isAdmin && (
          <div className="absolute bottom-4 right-4 z-20">
            {!isEditingHero ? (
              <button
                onClick={() => setIsEditingHero(true)}
                className="flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white text-xs px-4 py-2.5 rounded-full backdrop-blur-md transition-all"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Изменить обложку
              </button>
            ) : (
              <div className="bg-[#f7f3eb] rounded-sm shadow-2xl border border-[#c9a227]/30 p-4 w-[min(90vw,340px)] text-left space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b6356] font-medium">
                    Обложка главной
                  </p>
                  <button onClick={() => setIsEditingHero(false)} className="text-[#6b6356] hover:text-[#1a1a1a]">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                {heroError && <p className="text-xs text-[#ba1a1a]">{heroError}</p>}

                <div className="flex gap-2">
                  <input
                    ref={heroPhotoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleHeroPhoto(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                  <input
                    ref={heroVideoRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      handleHeroVideo(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    disabled={heroBusy}
                    onClick={() => heroPhotoRef.current?.click()}
                    className="flex-1 px-3 py-2 text-[10px] uppercase tracking-wider border border-[#c9a227]/40 text-[#9a7b1a] hover:bg-[#efe8da] disabled:opacity-50"
                  >
                    {heroBusy ? '…' : 'Фото'}
                  </button>
                  <button
                    type="button"
                    disabled={heroBusy}
                    onClick={() => heroVideoRef.current?.click()}
                    className="flex-1 px-3 py-2 text-[10px] uppercase tracking-wider border border-[#c9a227]/40 text-[#9a7b1a] hover:bg-[#efe8da] disabled:opacity-50"
                  >
                    {heroBusy ? '…' : 'Видео'}
                  </button>
                  {heroSettings.media && (
                    <button
                      type="button"
                      onClick={() => onSaveHero({ ...heroSettings, media: '' })}
                      className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#6b6356] hover:text-[#ba1a1a]"
                    >
                      Убрать
                    </button>
                  )}
                </div>

                <div className="space-y-2 pt-1 border-t border-[#c9a227]/20">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b6356] font-medium pt-2">
                    Надпись (по языкам)
                  </p>
                  <input
                    value={captionDrafts.ru}
                    onChange={(e) => setCaptionDrafts((d) => ({ ...d, ru: e.target.value }))}
                    placeholder="RU — Создано для тебя"
                    className="w-full px-3 py-2 bg-white border border-[#c9a227]/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
                  />
                  <input
                    value={captionDrafts.ky}
                    onChange={(e) => setCaptionDrafts((d) => ({ ...d, ky: e.target.value }))}
                    placeholder="KY — Сен үчүн жаралган"
                    className="w-full px-3 py-2 bg-white border border-[#c9a227]/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
                  />
                  <input
                    value={captionDrafts.en}
                    onChange={(e) => setCaptionDrafts((d) => ({ ...d, en: e.target.value }))}
                    placeholder="EN — Made for you"
                    className="w-full px-3 py-2 bg-white border border-[#c9a227]/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
                  />
                  <button
                    onClick={saveCaptions}
                    className="w-full px-4 py-2.5 bg-[#9a7b1a] text-white text-xs font-medium uppercase tracking-wider hover:bg-[#7a6214]"
                  >
                    Сохранить надпись
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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

