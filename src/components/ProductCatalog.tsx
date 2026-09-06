import React, { useState } from 'react';
import { JewelryProduct, JewelryCategory } from '../types';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useClientFavorites } from '../contexts/ClientFavoritesContext';
import { formatPrice, isVideoSrc } from '../utils/format';
import { STATUS_OPTIONS, getStatusStyle } from '../utils/status';
import { MediaFrame } from './MediaFrame';

interface ProductCatalogProps {
  products: JewelryProduct[];
  categories: string[];
  initialCategory?: string;
  onSelectProduct: (product: JewelryProduct) => void;
  onAddNewProduct: () => void;
  onToggleFavorite: (productId: string, e: React.MouseEvent) => void;
  onOpenCategoryManager: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  initialCategory,
  onSelectProduct,
  onAddNewProduct,
  onToggleFavorite,
  onOpenCategoryManager,
}) => {
  const { isAdmin } = useAdmin();
  const { t, statusLabel } = useLanguage();
  const { isFavorited, toggleFavorite: toggleClientFavorite } = useClientFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'Все');
  const [selectedStatus, setSelectedStatus] = useState<string>('Все');
  const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'name' | 'weight'>('price-desc');

  const allCategoryTabs = ['Все', ...categories];
  const statuses: string[] = ['Все', ...STATUS_OPTIONS];

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.goldPurity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.certification.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'Все' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'Все' || p.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ru');
      if (sortBy === 'weight') return b.weightGrams - a.weightGrams;
      return 0;
    });

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* Шапка каталога */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c9a227]/25 pb-8">
        <div>
          <span className="brand-mark text-xs text-[#9a7b1a] tracking-[0.28em]">
            {t('catalogBadge')}
          </span>
          <h1 className="font-brand text-3xl md:text-4xl font-medium text-[#1a1a1a] mt-2">
            {t('catalogTitle')}
          </h1>
          <p className="text-sm text-[#6b6356] mt-2 font-light">
            {t('catalogSubtitle')}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onAddNewProduct}
            className="bg-[#9a7b1a] text-white px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] flex items-center justify-center gap-2 hover:bg-[#7a6214] transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            {t('addProduct')}
          </button>
        )}
      </div>

      {/* Панель поиска и фильтров */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Поиск */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a7b1a]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-sm border border-[#c9a227]/30 text-sm text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d4635] hover:text-[#1b1b1d]"
            >
              <span className="material-symbols-outlined text-lg">cancel</span>
            </button>
          )}
        </div>

        {/* Выбор статуса и сортировки */}
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-3 bg-white border border-[#c9a227]/30 rounded-sm text-xs md:text-sm font-medium text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {t('statusPrefix')}: {st === 'Все' ? t('all') : statusLabel(st)}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-3 bg-white border border-[#c9a227]/30 rounded-sm text-xs md:text-sm font-medium text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
          >
            <option value="price-desc">{t('sortPriceDesc')}</option>
            <option value="price-asc">{t('sortPriceAsc')}</option>
            <option value="weight">{t('sortWeight')}</option>
            <option value="name">{t('sortName')}</option>
          </select>
        </div>
      </div>

      {/* Вкладки категорий */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 gallery-container">
        {allCategoryTabs.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs md:text-sm font-medium whitespace-nowrap transition-all tracking-wide ${
              selectedCategory === cat
                ? 'bg-[#9a7b1a] text-white'
                : 'bg-white text-[#6b6356] border border-[#c9a227]/30 hover:bg-[#efe8da]'
            }`}
          >
            {cat === 'Все' ? t('all') : cat}
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={onOpenCategoryManager}
            className="px-3 py-2 text-xs md:text-sm font-medium whitespace-nowrap bg-[#efe8da] hover:bg-[#e8d5a3]/40 text-[#9a7b1a] border border-[#c9a227]/30 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ml-auto"
            title="Настройка списка категорий"
          >
            <span className="material-symbols-outlined text-base">settings</span>
            <span>{t('categoriesManage')}</span>
          </button>
        )}
      </div>

      {/* Грид товаров */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-12 text-center border border-[#c9a227]/20 space-y-3">
          <div className="w-16 h-16 bg-[#efe8da] rounded-full flex items-center justify-center mx-auto text-[#9a7b1a]">
            <span className="material-symbols-outlined text-3xl">search_off</span>
          </div>
          <h3 className="font-brand text-2xl text-[#1a1a1a]">{t('noResultsTitle')}</h3>
          <p className="text-sm text-[#6b6356] max-w-md mx-auto font-light">
            {t('noResultsSubtitle')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Все');
              setSelectedStatus('Все');
            }}
            className="px-4 py-2 bg-[#9a7b1a] text-white text-xs font-medium uppercase tracking-wider"
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const formattedPrice = formatPrice(product.price, product.currency);
            const clientFavorited = isFavorited(product.id);
            const cover =
              product.images[0] ||
              'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80';

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="bg-white overflow-hidden border border-[#c9a227]/15 hover:border-[#c9a227]/40 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-64 bg-[#efe8da] overflow-hidden">
                    <MediaFrame
                      src={cover}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {isVideoSrc(cover) && (
                      <span className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center pointer-events-none">
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                      </span>
                    )}

                    <span
                      className={`absolute top-3 left-3 text-[10px] font-medium tracking-widest px-2.5 py-1 uppercase border backdrop-blur-md ${getStatusStyle(
                        product.status
                      )}`}
                    >
                      {statusLabel(product.status)}
                    </span>

                    {isAdmin ? (
                      <button
                        onClick={(e) => onToggleFavorite(product.id, e)}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                          product.isFavorite
                            ? 'bg-white text-[#ba1a1a] shadow-md'
                            : 'bg-black/30 text-white hover:bg-white hover:text-[#1a1a1a]'
                        }`}
                        title={product.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                      >
                        <span
                          className="material-symbols-outlined text-lg block"
                          style={{ fontVariationSettings: product.isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleClientFavorite(product.id);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                          clientFavorited
                            ? 'bg-white text-[#9a7b1a] shadow-md'
                            : 'bg-black/30 text-white hover:bg-white hover:text-[#1a1a1a]'
                        }`}
                        title={clientFavorited ? t('removeFromFavorites') : t('addToFavorites')}
                      >
                        <span
                          className="material-symbols-outlined text-lg block"
                          style={{ fontVariationSettings: clientFavorited ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          shopping_bag
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-medium text-[#6b6356] tracking-[0.16em] uppercase">
                          {product.sku}
                        </span>
                        <h3 className="font-brand text-xl text-[#1a1a1a] group-hover:text-[#9a7b1a] transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    <div className="text-lg font-medium text-[#9a7b1a]">
                      {formattedPrice}
                    </div>

                    {(product.goldPurity || product.stoneCarats) && (
                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#f7f3eb] p-2.5 text-[#6b6356]">
                        {product.goldPurity && (
                          <div>
                            <span className="block text-[10px] uppercase font-medium text-[#7f7663]">{t('cardMetal')}</span>
                            <span className="font-medium text-[#1a1a1a]">{product.goldPurity}</span>
                          </div>
                        )}
                        {product.stoneCarats && (
                          <div>
                            <span className="block text-[10px] uppercase font-medium text-[#7f7663]">{t('cardInsert')}</span>
                            <span className="font-medium text-[#1a1a1a]">{product.stoneCarats}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 flex justify-between items-center text-xs text-[#6b6356] border-t border-[#efe8da] pt-3 mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-sm text-[#9a7b1a]">verified</span>
                    {product.certification}
                  </span>
                  <span className="font-medium text-[#9a7b1a] group-hover:translate-x-1 transition-transform flex items-center gap-0.5 uppercase tracking-wider text-[10px]">
                    {t('cardMore')}
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

