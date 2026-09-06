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
  saveProductRemote,
  saveProductsRemote,
  saveCategoriesRemote,
  saveCategoryCoverRemote,
  deleteProductRemote,
  seedIfEmpty,
  type CategoryCovers,
} from './services/catalogStore';

const DEFAULT_CATEGORIES = ['Кольца', 'Колье и Цепи', 'Серьги', 'Браслеты', 'Жесткие браслеты'];

export default function App() {
  const { isAdmin, adminEmail } = useAdmin();
  const { favoriteIds, clearFavorites, toggleFavorite } = useClientFavorites();
  const { t } = useLanguage();
  const [products, setProducts] = useState<JewelryProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [categoryCovers, setCategoryCovers] = useState<CategoryCovers>({});
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

    return () => {
      cancelled = true;
      unsubProducts();
      unsubCategories();
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
echo "Готово. Теперь: git add -A && git commit -m \"navbar + hero slogan\" && git push"