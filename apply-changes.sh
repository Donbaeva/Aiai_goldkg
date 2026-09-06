#!/usr/bin/env bash
set -e
echo "Обновляю файлы..."
mkdir -p src
cat > src/App.tsx << 'AIAI_CLAUDE_EOF_MARKER'
import React, { useState, useEffect } from 'react';
import { JewelryProduct, ViewMode } from './types';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { GallerySection } from './components/GallerySection';
import { ProductSpecs } from './components/ProductSpecs';
import { ActionBar } from './components/ActionBar';
import { CartDrawer } from './components/CartDrawer';
import { ProductCatalog } from './components/ProductCatalog';
import { EditProductModal } from './components/EditProductModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { useAdmin } from './contexts/AdminContext';
import { useLanguage } from './contexts/LanguageContext';
import { useClientFavorites } from './contexts/ClientFavoritesContext';
import {
  subscribeToProducts,
  subscribeToCategories,
  subscribeToHeroSettings,
  saveProductRemote,
  saveProductsRemote,
  saveCategoriesRemote,
  saveCategoryCoverRemote,
  saveHeroSettingsRemote,
  deleteProductRemote,
  seedIfEmpty,
  type CategoryCovers,
  type HeroSettings,
} from './services/catalogStore';

const DEFAULT_CATEGORIES = ['Кольца', 'Колье и Цепи', 'Серьги', 'Браслеты', 'Жесткие браслеты'];
const DEFAULT_HERO: HeroSettings = { media: '', captions: { ru: '', ky: '', en: '' } };

export default function App() {
  const { isAdmin, adminEmail } = useAdmin();
  const { favoriteIds, clearFavorites, toggleFavorite } = useClientFavorites();
  const { t } = useLanguage();
  const [products, setProducts] = useState<JewelryProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [categoryCovers, setCategoryCovers] = useState<CategoryCovers>({});
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(DEFAULT_HERO);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<JewelryProduct | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    seedIfEmpty(INITIAL_PRODUCTS, DEFAULT_CATEGORIES).catch((e) => {
      if (!cancelled) setConnectionError(String(e));
    });

    const unsubProducts = subscribeToProducts(
      (remoteProducts) => {
        setProducts(remoteProducts);
        setIsLoading(false);
      },
      (e) => setConnectionError(String(e))
    );

    const unsubCategories = subscribeToCategories(
      (data) => {
        setCategories(data.names);
        setCategoryCovers(data.covers);
      },
      DEFAULT_CATEGORIES,
      (e) => setConnectionError(String(e))
    );

    const unsubHero = subscribeToHeroSettings(
      (settings) => setHeroSettings(settings),
      (e) => setConnectionError(String(e))
    );

    return () => {
      cancelled = true;
      unsubProducts();
      unsubCategories();
      unsubHero();
    };
  }, []);

  const handleAddCategory = (newCat: string) => {
    if (!isAdmin) return;
    const trimmed = newCat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      saveCategoriesRemote(updated, categoryCovers).catch((e) => setConnectionError(String(e)));
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (!isAdmin) return;
    const updatedCategories = categories.filter((c) => c !== catToDelete);
    const nextCovers = { ...categoryCovers };
    delete nextCovers[catToDelete];
    setCategories(updatedCategories);
    setCategoryCovers(nextCovers);
    saveCategoriesRemote(updatedCategories, nextCovers).catch((e) => setConnectionError(String(e)));

    const affected = products
      .filter((p) => p.category === catToDelete)
      .map((p) => ({ ...p, category: 'Другое' }));
    if (affected.length > 0) {
      setProducts((prev) =>
        prev.map((p) => (p.category === catToDelete ? { ...p, category: 'Другое' } : p))
      );
      saveProductsRemote(affected).catch((e) => setConnectionError(String(e)));
    }
  };

  const handleSetCategoryCover = (categoryName: string, coverSrc: string | null) => {
    if (!isAdmin) return;
    const next = { ...categoryCovers };
    if (coverSrc) next[categoryName] = coverSrc;
    else delete next[categoryName];
    setCategoryCovers(next);
    saveCategoryCoverRemote(categoryName, coverSrc, categories, categoryCovers).catch((e) =>
      setConnectionError(String(e))
    );
  };

  const handleSaveHero = (settings: HeroSettings) => {
    if (!isAdmin) return;
    setHeroSettings(settings);
    saveHeroSettingsRemote(settings).catch((e) => setConnectionError(String(e)));
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleUpdateNotes = (newNotes: string) => {
    if (!isAdmin || !selectedProduct) return;
    const updated = { ...selectedProduct, internalNotes: newNotes };
    setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? updated : p)));
    saveProductRemote(updated).catch((e) => setConnectionError(String(e)));
  };

  const handleToggleFavorite = (productId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) return;
    const idToToggle = productId || selectedProduct?.id;
    if (!idToToggle) return;
    const target = products.find((p) => p.id === idToToggle);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    setProducts((prev) => prev.map((p) => (p.id === idToToggle ? updated : p)));
    saveProductRemote(updated).catch((e2) => setConnectionError(String(e2)));
  };

  const handleSaveProduct = (updatedProduct: JewelryProduct) => {
    if (!isAdmin) return;
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updatedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      }
      return [updatedProduct, ...prev];
    });
    saveProductRemote(updatedProduct).catch((e) => setConnectionError(String(e)));
    setSelectedProductId(updatedProduct.id);
    setViewMode('detail');
  };

  const handleDeleteProduct = (productId: string) => {
    if (!isAdmin) return;
    setProducts((prev) => {
      const remaining = prev.filter((p) => p.id !== productId);
      if (selectedProductId === productId) {
        setSelectedProductId(remaining[0]?.id ?? '');
        setViewMode('catalog');
      }
      return remaining;
    });
    deleteProductRemote(productId).catch((e) => setConnectionError(String(e)));
  };

  const handleOpenNewProductModal = () => {
    if (!isAdmin) return;
    setEditingProduct(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditProductModal = () => {
    if (!isAdmin || !selectedProduct) return;
    setEditingProduct(selectedProduct);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center">
        <p className="brand-mark text-[#9a7b1a] tracking-[0.3em] text-lg">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#1a1a1a] font-sans antialiased flex flex-col selection:bg-[#c9a227]/25">
      {connectionError && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-red-600 text-white text-sm text-center py-2 px-4">
          Проблема с подключением к базе данных: {connectionError}
        </div>
      )}

      <Navbar
        currentView={viewMode}
        onViewChange={setViewMode}
        productCount={products.length}
        cartCount={favoriteIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      <main className={viewMode === 'home' ? 'flex-1 pt-[5.5rem] sm:pt-24 md:pt-28 lg:pt-32' : 'flex-1 pt-[5.5rem] sm:pt-24 md:pt-28 lg:pt-32 pb-24'}>
        {viewMode === 'home' ? (
          <HomePage
            products={products}
            categories={categories}
            categoryCovers={categoryCovers}
            heroSettings={heroSettings}
            onSaveHero={handleSaveHero}
            onShopNow={() => setViewMode('catalog')}
            onSelectCategory={(cat) => {
              setPendingCategory(cat);
              setViewMode('catalog');
            }}
            onSelectProduct={(p) => {
              setSelectedProductId(p.id);
              setViewMode('detail');
            }}
          />
        ) : viewMode === 'detail' && selectedProduct ? (
          <div className="max-w-screen-xl mx-auto md:px-8 py-4 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <GallerySection
                images={selectedProduct.images}
                productName={selectedProduct.name}
              />
              <ProductSpecs
                product={selectedProduct}
                onUpdateNotes={handleUpdateNotes}
              />
            </div>
          </div>
        ) : (
          <ProductCatalog
            products={products}
            categories={categories}
            initialCategory={pendingCategory || undefined}
            onSelectProduct={(p) => {
              setSelectedProductId(p.id);
              setViewMode('detail');
            }}
            onAddNewProduct={handleOpenNewProductModal}
            onToggleFavorite={(id, e) => handleToggleFavorite(id, e)}
            onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
          />
        )}
      </main>

      {viewMode === 'detail' && selectedProduct && isAdmin && (
        <ActionBar
          onEditProduct={handleOpenEditProductModal}
          isFavorite={selectedProduct.isFavorite}
          onToggleFavorite={() => handleToggleFavorite(selectedProduct.id)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        products={products}
        favoriteIds={favoriteIds}
        onClearFavorites={clearFavorites}
        onRemoveFavorite={(id) => {
          if (favoriteIds.includes(id)) toggleFavorite(id);
        }}
        onSelectProduct={(p) => {
          setSelectedProductId(p.id);
          setViewMode('detail');
        }}
      />

      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        covers={categoryCovers}
        products={products}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onSetCategoryCover={handleSetCategoryCover}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        adminEmail={adminEmail}
      />
    </div>
  );
}

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/App.tsx"
mkdir -p src/components
cat > src/components/Navbar.tsx << 'AIAI_CLAUDE_EOF_MARKER'
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
  const contactsRef = React.useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useLanguage();

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (contactsRef.current && !contactsRef.current.contains(e.target as Node)) {
        setShowContacts(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}`;
  const instagramHref = `https://instagram.com/${INSTAGRAM_USERNAME}`;

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-[#c9a227]/25 glass-effect">
      <div className="relative h-[5.5rem] sm:h-24 md:h-28 lg:h-32 flex items-center justify-between px-3 md:px-8">
        {/* Left: back (home has nothing here now — catalog button removed) */}
        <div className="flex items-center gap-1 md:gap-2 min-w-0 z-10">
          {currentView !== 'home' && (
            <button
              onClick={() => onViewChange('home')}
              className="p-2 hover:bg-[#efe8da] rounded-full transition-colors text-[#9a7b1a] active:scale-95"
              title={t('backToCatalog')}
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
          )}

          <div className="flex items-center bg-[#efe8da]/80 p-0.5 rounded-full text-[10px] font-semibold">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-1 rounded-full transition-all ${
                  lang === l.code
                    ? 'bg-white text-[#9a7b1a] shadow-sm'
                    : 'text-[#6b6356] hover:text-[#1a1a1a]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center brand — Tiffany-style, large */}
        <button
          onClick={() => onViewChange('home')}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center group max-w-[70vw] md:max-w-[75vw]"
          aria-label="AiAi Gold"
        >
          <span className="brand-mark block leading-none text-[#9a7b1a] group-hover:text-[#c9a227] transition-colors whitespace-nowrap text-[1.9rem] tracking-[0.1em] sm:text-[2.5rem] sm:tracking-[0.12em] md:text-[3.75rem] md:tracking-[0.16em] lg:text-[5rem] lg:tracking-[0.2em]">
            AiAi Gold
          </span>
          <span className="hidden sm:block text-[9px] md:text-[10px] font-sans font-light uppercase tracking-[0.35em] text-[#6b6356] mt-1 md:mt-2">
            {t('brandTagline')}
          </span>
        </button>

        {/* Right: contact + cart + admin */}
        <div className="flex items-center gap-0.5 md:gap-1 z-10">
          <div className="relative" ref={contactsRef}>
            <button
              onClick={() => setShowContacts((v) => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-[10px] md:text-xs font-medium uppercase tracking-[0.16em] text-[#9a7b1a] hover:bg-[#efe8da] rounded-full transition-all"
              title={t('contactUs')}
            >
              <span className="material-symbols-outlined text-xl md:text-[22px]">call</span>
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
            className="relative p-2 hover:bg-[#efe8da] rounded-full transition-all text-[#9a7b1a] active:scale-95"
            title={t('cart')}
          >
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c9a227] text-white text-[10px] font-semibold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenAdmin}
            className={`p-2 rounded-full transition-all active:scale-95 ${
              isAdmin
                ? 'bg-[#9a7b1a] text-white hover:bg-[#7a6214]'
                : 'text-[#9a7b1a]/70 hover:bg-[#efe8da]'
            }`}
            title={isAdmin ? t('adminLoggedIn') : t('adminLogin')}
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/components/Navbar.tsx"
mkdir -p src/components
cat > src/components/HomePage.tsx << 'AIAI_CLAUDE_EOF_MARKER'
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

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/components/HomePage.tsx"
mkdir -p src/services
cat > src/services/catalogStore.ts << 'AIAI_CLAUDE_EOF_MARKER'
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { JewelryProduct } from '../types';

const PRODUCTS_COLLECTION = 'products';
const LOCAL_PRODUCTS_KEY = 'aiaigold_local_products';
const LOCAL_CATEGORIES_KEY = 'aiaigold_local_categories';
const LOCAL_COVERS_KEY = 'aiaigold_local_category_covers';
const LOCAL_HERO_KEY = 'aiaigold_local_hero';

export type CategoryCovers = Record<string, string>;

export interface HeroCaptions {
  ru: string;
  ky: string;
  en: string;
}

export interface HeroSettings {
  /** Photo or video data URL. Empty string = use the default fallback image. */
  media: string;
  captions: HeroCaptions;
}

const DEFAULT_HERO_SETTINGS: HeroSettings = {
  media: '',
  captions: { ru: '', ky: '', en: '' },
};

export interface CategoryData {
  names: string[];
  covers: CategoryCovers;
}

function readLocalProducts(): JewelryProduct[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalProducts(products: JewelryProduct[]) {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

function readLocalCategories(): string[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalCategories(categories: string[]) {
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
}

function readLocalCovers(): CategoryCovers {
  try {
    const raw = localStorage.getItem(LOCAL_COVERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalCovers(covers: CategoryCovers) {
  localStorage.setItem(LOCAL_COVERS_KEY, JSON.stringify(covers));
}

function readLocalHero(): HeroSettings {
  try {
    const raw = localStorage.getItem(LOCAL_HERO_KEY);
    if (!raw) return DEFAULT_HERO_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      media: typeof parsed.media === 'string' ? parsed.media : '',
      captions: {
        ru: parsed.captions?.ru || '',
        ky: parsed.captions?.ky || '',
        en: parsed.captions?.en || '',
      },
    };
  } catch {
    return DEFAULT_HERO_SETTINGS;
  }
}

function writeLocalHero(settings: HeroSettings) {
  localStorage.setItem(LOCAL_HERO_KEY, JSON.stringify(settings));
}

const localListeners = {
  products: new Set<(products: JewelryProduct[]) => void>(),
  categories: new Set<(data: CategoryData) => void>(),
  hero: new Set<(settings: HeroSettings) => void>(),
};

function notifyLocalProducts() {
  const products = readLocalProducts() || [];
  localListeners.products.forEach((cb) => cb(products));
}

function notifyLocalCategories(fallback: string[]) {
  const data: CategoryData = {
    names: readLocalCategories() || fallback,
    covers: readLocalCovers(),
  };
  localListeners.categories.forEach((cb) => cb(data));
}

export function subscribeToProducts(
  onChange: (products: JewelryProduct[]) => void,
  onError?: (err: unknown) => void
) {
  if (!db || !isFirebaseConfigured) {
    const existing = readLocalProducts();
    onChange(existing || []);
    localListeners.products.add(onChange);
    return () => {
      localListeners.products.delete(onChange);
    };
  }

  return onSnapshot(
    collection(db, PRODUCTS_COLLECTION),
    (snapshot) => {
      const products = snapshot.docs.map((d) => d.data() as JewelryProduct);
      onChange(products);
    },
    onError
  );
}

export function subscribeToCategories(
  onChange: (data: CategoryData) => void,
  fallback: string[],
  onError?: (err: unknown) => void
) {
  if (!db || !isFirebaseConfigured) {
    onChange({
      names: readLocalCategories() || fallback,
      covers: readLocalCovers(),
    });
    localListeners.categories.add(onChange);
    return () => {
      localListeners.categories.delete(onChange);
    };
  }

  const categoriesDocRef = doc(db, 'meta', 'categories');
  return onSnapshot(
    categoriesDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const names = Array.isArray(data.list) ? (data.list as string[]) : fallback;
        const covers =
          data.covers && typeof data.covers === 'object'
            ? (data.covers as CategoryCovers)
            : {};
        onChange({ names, covers });
      } else {
        onChange({ names: fallback, covers: {} });
      }
    },
    onError
  );
}

export async function saveProductRemote(product: JewelryProduct) {
  if (!db || !isFirebaseConfigured) {
    const products = readLocalProducts() || [];
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) products[idx] = product;
    else products.unshift(product);
    writeLocalProducts(products);
    notifyLocalProducts();
    return;
  }
  await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
}

export async function saveProductsRemote(products: JewelryProduct[]) {
  if (!db || !isFirebaseConfigured) {
    const existing = readLocalProducts() || [];
    const map = new Map(existing.map((p) => [p.id, p]));
    products.forEach((p) => map.set(p.id, p));
    writeLocalProducts([...map.values()]);
    notifyLocalProducts();
    return;
  }
  const batch = writeBatch(db);
  products.forEach((p) => batch.set(doc(db, PRODUCTS_COLLECTION, p.id), p));
  await batch.commit();
}

export async function deleteProductRemote(productId: string) {
  if (!db || !isFirebaseConfigured) {
    writeLocalProducts((readLocalProducts() || []).filter((p) => p.id !== productId));
    notifyLocalProducts();
    return;
  }
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}

export async function saveCategoriesRemote(
  categories: string[],
  covers?: CategoryCovers
) {
  if (!db || !isFirebaseConfigured) {
    writeLocalCategories(categories);
    const source = covers ?? readLocalCovers();
    const pruned: CategoryCovers = {};
    categories.forEach((name) => {
      if (source[name]) pruned[name] = source[name];
    });
    writeLocalCovers(pruned);
    notifyLocalCategories(categories);
    return;
  }

  const payload: { list: string[]; covers?: CategoryCovers } = { list: categories };
  if (covers !== undefined) {
    const pruned: CategoryCovers = {};
    categories.forEach((name) => {
      if (covers[name]) pruned[name] = covers[name];
    });
    payload.covers = pruned;
  }
  await setDoc(doc(db, 'meta', 'categories'), payload, { merge: true });
}

/** Update cover (photo or video data URL) for one category. */
export async function saveCategoryCoverRemote(
  categoryName: string,
  coverSrc: string | null,
  allCategories: string[],
  currentCovers: CategoryCovers
) {
  const next = { ...currentCovers };
  if (coverSrc) next[categoryName] = coverSrc;
  else delete next[categoryName];
  await saveCategoriesRemote(allCategories, next);
}

/** Subscribes to live updates of the homepage hero (cover photo/video + caption). */
export function subscribeToHeroSettings(
  onChange: (settings: HeroSettings) => void,
  onError?: (err: unknown) => void
) {
  if (!db || !isFirebaseConfigured) {
    onChange(readLocalHero());
    localListeners.hero.add(onChange);
    return () => {
      localListeners.hero.delete(onChange);
    };
  }

  return onSnapshot(
    doc(db, 'meta', 'hero'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onChange({
          media: typeof data.media === 'string' ? data.media : '',
          captions: {
            ru: data.captions?.ru || '',
            ky: data.captions?.ky || '',
            en: data.captions?.en || '',
          },
        });
      } else {
        onChange(DEFAULT_HERO_SETTINGS);
      }
    },
    onError
  );
}

export async function saveHeroSettingsRemote(settings: HeroSettings) {
  if (!db || !isFirebaseConfigured) {
    writeLocalHero(settings);
    localListeners.hero.forEach((cb) => cb(settings));
    return;
  }
  await setDoc(doc(db, 'meta', 'hero'), settings);
}

export async function seedIfEmpty(
  initialProducts: JewelryProduct[],
  initialCategories: string[]
) {
  if (!db || !isFirebaseConfigured) {
    if (!readLocalProducts()) {
      writeLocalProducts(initialProducts);
      notifyLocalProducts();
    }
    if (!readLocalCategories()) {
      writeLocalCategories(initialCategories);
      notifyLocalCategories(initialCategories);
    }
    return;
  }

  const existing = await getDocs(collection(db, PRODUCTS_COLLECTION));
  if (existing.empty) {
    const batch = writeBatch(db);
    initialProducts.forEach((p) =>
      batch.set(doc(db, PRODUCTS_COLLECTION, p.id), p)
    );
    batch.set(doc(db, 'meta', 'categories'), { list: initialCategories, covers: {} });
    await batch.commit();
  }
}

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/services/catalogStore.ts"
mkdir -p src/i18n
cat > src/i18n/translations.ts << 'AIAI_CLAUDE_EOF_MARKER'
export type Lang = 'ru' | 'ky' | 'en';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'РУ' },
  { code: 'ky', label: 'КЫ' },
  { code: 'en', label: 'EN' },
];

type Dict = Record<string, string>;

const ru: Dict = {
  catalogTab: 'Каталог',
  detailsTab: 'Характеристики',
  backToCatalog: 'Вернуться в каталог',
  contactUs: 'Контакты',
  phoneLabel: 'Звонок',
  cart: 'Корзина',
  cartEmpty: 'Корзина пуста. Добавьте изделия сердечком на карточке.',
  cartClear: 'Очистить',
  cartCancel: 'Отмена',
  brandTagline: 'Ювелирный магазин',
  adminLoggedIn: 'Вы вошли как администратор',
  adminLogin: 'Вход для администратора',

  catalogBadge: 'AiAi Gold',
  catalogTitle: 'Каталог ювелирных изделий',
  catalogSubtitle: 'Коллекция изделий из золота и драгоценных камней.',
  addProduct: 'Добавить украшение',
  searchPlaceholder: 'Поиск по артикулу, названию, пробе золота, сертификату...',
  statusPrefix: 'Статус',
  all: 'Все',
  sortPriceDesc: 'Сначала дорогие',
  sortPriceAsc: 'Сначала недорогие',
  sortWeight: 'По весу',
  sortName: 'По названию (А-Я)',
  categoriesManage: 'Категории',
  noResultsTitle: 'Ничего не найдено',
  noResultsSubtitle: 'Попробуйте изменить поисковый запрос или сбросить фильтры категорий.',
  resetFilters: 'Сбросить фильтры',
  cardMetal: 'Металл',
  cardInsert: 'Вставка',
  cardMore: 'Подробнее',
  addToFavorites: 'В корзину',
  removeFromFavorites: 'Убрать из корзины',

  article: 'Артикул',
  specGoldPurity: 'Проба металл',
  specWeight: 'Вес изделия',
  specGrams: 'Грамм',
  specStone: 'Караты вставки',
  specSize: 'Размер',
  specCertificate: 'Сертификат',
  detailsHeading: 'Подробнее',
  detailsEmpty: 'Подробное описание пока не добавлено.',

  orderCount: 'В корзине',
  orderButton: 'Заказать',
  chooseWhere: 'Куда отправить заявку?',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramCopied: 'Текст сообщения скопирован — вставьте его в переписке Instagram',
  loading: 'Загрузка…',

  homeAnnouncement: 'Золото 585 и 750 пробы · Доставка по Кыргызстану',
  homeAnnouncementCta: 'Написать нам',
  homeHeroKicker: 'AiAi Gold',
  homeHeroTitle: 'Создано для тебя',
  homeHeroText: 'Каждое изделие проверено на пробу и подлинность. Кольца, серьги, цепи и браслеты — в наличии и под заказ.',
  homeHeroCta: 'Смотреть коллекцию',
  homeCategoriesTitle: 'Категории',
  homeFeaturedTitle: 'Избранные изделия',
  homeFeaturedCta: 'Весь каталог',
  homeValue1Title: 'Консультация',
  homeValue1Text: 'Поможем подобрать изделие и ответим на вопросы по пробе, весу и цене.',
  homeValue1Cta: 'Написать в WhatsApp',
  homeValue2Title: 'Доставка',
  homeValue2Text: 'Отправляем изделия по Кыргызстану — аккуратная упаковка и передача.',
  homeValue2Cta: 'Уточнить условия',
  homeValue3Title: 'Сертификат и проба',
  homeValue3Text: 'На каждое изделие — подтверждение пробы металла, на камни — сертификат.',
  homeValue3Cta: 'Смотреть каталог',
  homeFooterAbout: 'AiAi Gold — ювелирные изделия из золота в Кыргызстане. Кольца, серьги, цепи, браслеты — в наличии и под заказ.',
  homeFooterContacts: 'Контакты',
  homeFooterCatalog: 'Каталог',
  homeFooterLegal: 'AiAi Gold. Все изделия проходят проверку пробы перед продажей.',
};

const ky: Dict = {
  catalogTab: 'Каталог',
  detailsTab: 'Мүнөздөмөлөр',
  backToCatalog: 'Каталогго кайтуу',
  contactUs: 'Байланыш',
  phoneLabel: 'Чалуу',
  cart: 'Себет',
  cartEmpty: 'Себет бош. Буюмду жүрөкчө менен кошуңуз.',
  cartClear: 'Тазалоо',
  cartCancel: 'Жокко чыгаруу',
  brandTagline: 'Зер дүкөнү',
  adminLoggedIn: 'Сиз администратор катары кирдиңиз',
  adminLogin: 'Администратор үчүн кирүү',

  catalogBadge: 'AiAi Gold',
  catalogTitle: 'Зер буюмдар каталогу',
  catalogSubtitle: 'Алтын жана асыл таштардан жасалган буюмдар жыйнагы.',
  addProduct: 'Буюм кошуу',
  searchPlaceholder: 'Артикул, аталышы, алтын сынамасы, сертификат боюнча издөө...',
  statusPrefix: 'Статус',
  all: 'Баары',
  sortPriceDesc: 'Кымбаттан баштап',
  sortPriceAsc: 'Арзандан баштап',
  sortWeight: 'Салмагы боюнча',
  sortName: 'Аталышы боюнча (А-Я)',
  categoriesManage: 'Категориялар',
  noResultsTitle: 'Эч нерсе табылган жок',
  noResultsSubtitle: 'Издөө сурамын өзгөртүп же категория чыпкаларын тазалап көрүңүз.',
  resetFilters: 'Чыпкаларды тазалоо',
  cardMetal: 'Метал',
  cardInsert: 'Кыстырма',
  cardMore: 'Толугураак',
  addToFavorites: 'Себетке кошуу',
  removeFromFavorites: 'Себеттен алып салуу',

  article: 'Артикул',
  specGoldPurity: 'Метал сынамасы',
  specWeight: 'Буюмдун салмагы',
  specGrams: 'Грамм',
  specStone: 'Кыстырманын каратасы',
  specSize: 'Өлчөм',
  specCertificate: 'Сертификат',
  detailsHeading: 'Толугураак',
  detailsEmpty: 'Толук баяндама азырынча кошулган жок.',

  orderCount: 'Себетте',
  orderButton: 'Буйрутма берүү',
  chooseWhere: 'Кайда жөнөтөбүз?',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramCopied: 'Билдирүү тексти көчүрүлдү — Instagram баракчасына чаптап жөнөтүңүз',
  loading: 'Жүктөлүүдө…',

  homeAnnouncement: '585 жана 750 сынама · Кыргызстан боюнча жеткирүү',
  homeAnnouncementCta: 'Бизге жазыңыз',
  homeHeroKicker: 'AiAi Gold',
  homeHeroTitle: 'Сен үчүн жаралган',
  homeHeroText: 'Ар бир буюм сынамасы жана таштары боюнча текшерилген. Шакектер, сөйкөлөр, чынжырлар — дароо жана заказ менен.',
  homeHeroCta: 'Жыйнакты көрүү',
  homeCategoriesTitle: 'Категориялар',
  homeFeaturedTitle: 'Тандалма буюмдар',
  homeFeaturedCta: 'Бүткүл каталог',
  homeValue1Title: 'Консультация',
  homeValue1Text: 'Буюм тандоого жардам беребиз жана сынама, салмак, баа боюнча жооп беребиз.',
  homeValue1Cta: 'WhatsApp\'ка жазуу',
  homeValue2Title: 'Жеткирүү',
  homeValue2Text: 'Буюмдарды өлкө боюнча жөнөтөбүз — этият таңгак жана өткөрүп берүү.',
  homeValue2Cta: 'Тактап көрүү',
  homeValue3Title: 'Сертификат жана сынама',
  homeValue3Text: 'Ар бир буюмга металл сынамасынын тастыгы, таштарга — сертификат.',
  homeValue3Cta: 'Каталогду көрүү',
  homeFooterAbout: 'AiAi Gold — Кыргызстандагы алтын зер буюмдары. Шакектер, сөйкөлөр, чынжырлар, билериктер — дароо жана заказ менен.',
  homeFooterContacts: 'Байланыш',
  homeFooterCatalog: 'Каталог',
  homeFooterLegal: 'AiAi Gold. Бардык буюмдар сатууга чейин сынамадан текшерилет.',
};

const en: Dict = {
  catalogTab: 'Catalog',
  detailsTab: 'Details',
  backToCatalog: 'Back to catalog',
  contactUs: 'Contact us',
  phoneLabel: 'Call',
  cart: 'Bag',
  cartEmpty: 'Your bag is empty. Tap the heart on a piece to add it.',
  cartClear: 'Clear',
  cartCancel: 'Cancel',
  brandTagline: 'Jewelry store',
  adminLoggedIn: 'Signed in as admin',
  adminLogin: 'Admin sign-in',

  catalogBadge: 'AiAi Gold',
  catalogTitle: 'Jewelry Catalog',
  catalogSubtitle: 'A collection of gold and gemstone jewelry.',
  addProduct: 'Add item',
  searchPlaceholder: 'Search by SKU, name, gold purity, certificate...',
  statusPrefix: 'Status',
  all: 'All',
  sortPriceDesc: 'Price: high to low',
  sortPriceAsc: 'Price: low to high',
  sortWeight: 'By weight',
  sortName: 'By name (A-Z)',
  categoriesManage: 'Categories',
  noResultsTitle: 'Nothing found',
  noResultsSubtitle: 'Try a different search or reset the category filters.',
  resetFilters: 'Reset filters',
  cardMetal: 'Metal',
  cardInsert: 'Stone',
  cardMore: 'Details',
  addToFavorites: 'Add to bag',
  removeFromFavorites: 'Remove from bag',

  article: 'SKU',
  specGoldPurity: 'Metal purity',
  specWeight: 'Weight',
  specGrams: 'grams',
  specStone: 'Stone carats',
  specSize: 'Size',
  specCertificate: 'Certificate',
  detailsHeading: 'Details',
  detailsEmpty: 'No detailed description yet.',

  orderCount: 'In bag',
  orderButton: 'Order',
  chooseWhere: 'Where should we send your request?',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramCopied: 'Message copied — paste it into your Instagram DM',
  loading: 'Loading…',

  homeAnnouncement: '585 & 750 gold · Delivery across Kyrgyzstan',
  homeAnnouncementCta: 'Message us',
  homeHeroKicker: 'AiAi Gold',
  homeHeroTitle: 'Made for you',
  homeHeroText: 'Every piece is checked for purity and authenticity. Rings, earrings, chains and bracelets — in stock or made to order.',
  homeHeroCta: 'Explore the collection',
  homeCategoriesTitle: 'Categories',
  homeFeaturedTitle: 'Featured pieces',
  homeFeaturedCta: 'View full catalog',
  homeValue1Title: 'Consultation',
  homeValue1Text: "We'll help you choose a piece and answer questions on purity, weight and price.",
  homeValue1Cta: 'Message on WhatsApp',
  homeValue2Title: 'Delivery',
  homeValue2Text: 'We ship nationwide — packaging and handover handled with care.',
  homeValue2Cta: 'Ask about delivery',
  homeValue3Title: 'Certificate & purity',
  homeValue3Text: 'Every piece comes with proof of metal purity, and a certificate for stones.',
  homeValue3Cta: 'Browse the catalog',
  homeFooterAbout: 'AiAi Gold — gold jewelry in Kyrgyzstan. Rings, earrings, chains, bracelets — in stock and made to order.',
  homeFooterContacts: 'Contacts',
  homeFooterCatalog: 'Catalog',
  homeFooterLegal: 'AiAi Gold. Every piece is purity-checked before sale.',
};

const DICTS: Record<Lang, Dict> = { ru, ky, en };

export function t(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? DICTS.ru[key] ?? key;
}

/** Localized labels for the stored (Russian) status values. */
const STATUS_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    'ПОД ЗАКАЗ': 'ПОД ЗАКАЗ',
    'В НАЛИЧИИ': 'В НАЛИЧИИ',
    'ПРОДАНО': 'ПРОДАНО',
    'РЕЗЕРВИРОВАНО': 'РЕЗЕРВИРОВАНО',
    'В ПУТИ': 'В ПУТИ',
  },
  ky: {
    'ПОД ЗАКАЗ': 'ЗАКАЗ МЕНЕН',
    'В НАЛИЧИИ': 'БАР',
    'ПРОДАНО': 'САТЫЛДЫ',
    'РЕЗЕРВИРОВАНО': 'БРОНДОЛДУ',
    'В ПУТИ': 'ЖОЛДО',
  },
  en: {
    'ПОД ЗАКАЗ': 'MADE TO ORDER',
    'В НАЛИЧИИ': 'IN STOCK',
    'ПРОДАНО': 'SOLD',
    'РЕЗЕРВИРОВАНО': 'RESERVED',
    'В ПУТИ': 'IN TRANSIT',
  },
};

export function statusLabel(lang: Lang, status: string): string {
  return STATUS_LABELS[lang]?.[status] ?? status;
}

/** Builds the pre-filled order message for WhatsApp / Instagram,
 * in whichever language the site is currently displayed in. */
export function buildOrderMessage(lang: Lang, skus: string[]): string {
  const list = skus.join(', ');
  if (lang === 'ky') {
    return skus.length === 1
      ? `Саламатсызбы! Мага бул буюм кызык болду (артикул: ${list}). Ушул буюм боюнча багыт берип, буйрутма таза алсаңыз болобу?`
      : `Саламатсызбы! Мага бул буюмдар кызык болду (артикулдар: ${list}). Ушулар боюнча багыт берип, буйрутма таза алсаңыз болобу?`;
  }
  if (lang === 'en') {
    return skus.length === 1
      ? `Hello! I'm interested in this item (SKU: ${list}). Could you tell me more about it and help me place an order?`
      : `Hello! I'm interested in these items (SKUs: ${list}). Could you tell me more about them and help me place an order?`;
  }
  return skus.length === 1
    ? `Здравствуйте! Меня заинтересовало изделие (артикул: ${list}). Могли бы вы сориентировать меня по нему и оформить заказ?`
    : `Здравствуйте! Меня заинтересовали изделия (артикулы: ${list}). Могли бы вы сориентировать меня по ним и оформить заказ?`;
}


AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/i18n/translations.ts"
echo "Готово. Теперь: git add -A && git commit -m \"admin hero editor + parallax\" && git push"