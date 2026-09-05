#!/usr/bin/env bash
set -e
echo "Обновляю файлы..."
mkdir -p src
cat > src/types.ts << 'AIAI_CLAUDE_EOF_MARKER'
export type StockStatus = 'ПОД ЗАКАЗ' | 'В НАЛИЧИИ' | 'ПРОДАНО' | 'РЕЗЕРВИРОВАНО' | 'В ПУТИ';
export type Currency = 'KGS' | 'USD';
export type JewelryCategory = string;

export interface AuditRecord {
  id: string;
  date: string;
  inspector: string;
  location: string;
  status: StockStatus;
  note: string;
}

export interface JewelryProduct {
  id: string;
  sku: string;
  name: string;
  category: JewelryCategory;
  price: number;
  currency: Currency;
  status: StockStatus;
  goldPurity: string;
  weightGrams: number;
  stoneCarats: string;
  ringSize?: string;
  certification: string;
  certificationUrl?: string;
  lastAudit: string;
  internalNotes: string;
  /** Photo and video data URLs / links, shown to clients in the gallery. */
  images: string[];
  isFavorite: boolean;
  createdAt: string;
  auditHistory: AuditRecord[];
}

export type ViewMode = 'detail' | 'catalog' | 'analytics';

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/types.ts"
mkdir -p src/components
cat > src/components/Navbar.tsx << 'AIAI_CLAUDE_EOF_MARKER'
import React from 'react';
import { ViewMode, JewelryProduct } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedProduct: JewelryProduct | null;
  onOpenShare: () => void;
  onOpenAuditLog: () => void;
  productCount: number;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  selectedProduct,
  onOpenShare,
  onOpenAuditLog,
  productCount,
  isAdmin,
  onOpenAdmin,
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-[#fcf8fb] border-b border-[#d0c5af]/30 glass-effect">
      <div className="flex items-center gap-3">
        {currentView === 'detail' ? (
          <button
            onClick={() => onViewChange('catalog')}
            className="p-2 hover:bg-[#eae7ea] rounded-full transition-colors text-[#735c00] active:scale-95 flex items-center justify-center"
            title="Вернуться в каталог"
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
            onClick={() => onViewChange('catalog')}
            className="font-semibold text-lg md:text-xl text-[#735c00] hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            AiAi Gold
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <nav className="flex items-center bg-[#f0edef] p-1 rounded-xl text-xs md:text-sm font-medium mr-2">
          <button
            onClick={() => onViewChange('catalog')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'catalog'
                ? 'bg-white text-[#735c00] shadow-sm font-semibold'
                : 'text-[#4d4635] hover:text-[#1b1b1d]'
            }`}
          >
            Каталог ({productCount})
          </button>
          <button
            onClick={() => onViewChange('detail')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'detail'
                ? 'bg-white text-[#735c00] shadow-sm font-semibold'
                : 'text-[#4d4635] hover:text-[#1b1b1d]'
            }`}
          >
            Характеристики
          </button>
        </nav>

        <button
          onClick={onOpenShare}
          className="p-2 hover:bg-[#eae7ea] rounded-full transition-all text-[#735c00] active:scale-95"
          title="Поделиться спецификацией"
        >
          <span className="material-symbols-outlined">share</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 hover:bg-[#eae7ea] rounded-full transition-all text-[#735c00] active:scale-95"
            title="Дополнительные опции"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>

          {showMoreMenu && selectedProduct && (
            <div 
              className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#d0c5af]/40 py-2 z-50 text-sm"
              onClick={() => setShowMoreMenu(false)}
            >
              <div className="px-4 py-2 border-b border-[#f0edef] text-xs font-semibold uppercase tracking-wider text-[#4d4635]">
                Действия ({selectedProduct.sku})
              </div>
              <button
                onClick={onOpenAuditLog}
                className="w-full text-left px-4 py-2.5 hover:bg-[#f6f3f5] text-[#1b1b1d] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-[#735c00]">verified</span>
                История аудита ({selectedProduct.auditHistory.length})
              </button>
              <button
                onClick={onOpenShare}
                className="w-full text-left px-4 py-2.5 hover:bg-[#f6f3f5] text-[#1b1b1d] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-[#735c00]">picture_as_pdf</span>
                Экспорт VIP-паспорта
              </button>
              <a
                href={selectedProduct.certificationUrl || 'https://www.gia.edu'}
                target="_blank"
                rel="noreferrer"
                className="w-full text-left px-4 py-2.5 hover:bg-[#f6f3f5] text-[#1b1b1d] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg text-[#735c00]">open_in_new</span>
                Проверить сертификат
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
          title={isAdmin ? 'Вы вошли как администратор' : 'Вход для администратора'}
        >
          <span className="material-symbols-outlined">admin_panel_settings</span>
        </button>
      </div>
    </header>
  );
};

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/components/Navbar.tsx"
mkdir -p src/components
cat > src/components/ProductSpecs.tsx << 'AIAI_CLAUDE_EOF_MARKER'
import React, { useState } from 'react';
import { JewelryProduct } from '../types';
import { useAdmin } from '../contexts/AdminContext';
import { formatPrice } from '../utils/format';
import { getStatusStyle } from '../utils/status';

interface ProductSpecsProps {
  product: JewelryProduct;
  onUpdateNotes: (newNotes: string) => void;
  onOpenAuditHistory: () => void;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({
  product,
  onUpdateNotes,
  onOpenAuditHistory,
}) => {
  const { isAdmin } = useAdmin();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(product.internalNotes);

  const handleSaveNotes = () => {
    onUpdateNotes(notesText);
    setIsEditingNotes(false);
  };

  const formattedPrice = formatPrice(product.price, product.currency);

  return (
    <section className="lg:col-span-5 px-4 md:px-0 flex flex-col gap-8">
      {/* Заголовок товара */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-[12px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border ${getStatusStyle(product.status)}`}>
            {product.status}
          </span>
          <span className="text-[12px] font-semibold text-[#4d4635] uppercase tracking-wider">
            Артикул: {product.sku}
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-[48px] lg:leading-[56px] font-semibold text-[#1b1b1d] tracking-tight mb-1">
          {product.name}
        </h2>
        <p className="text-2xl md:text-3xl text-[#735c00] font-bold tracking-tight">
          {formattedPrice}
        </p>
      </div>

      {/* Сетка характеристик — пустые поля не показываются */}
      <div className="grid grid-cols-2 gap-4">
        {product.goldPurity && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d0c5af]/30 transition-all hover:shadow-md">
            <p className="text-[12px] font-semibold text-[#4d4635] mb-1 uppercase tracking-wider">
              Проба металл
            </p>
            <p className="text-base md:text-lg font-semibold text-[#1b1b1d]">
              {product.goldPurity}
            </p>
          </div>
        )}

        {!!product.weightGrams && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d0c5af]/30 transition-all hover:shadow-md">
            <p className="text-[12px] font-semibold text-[#4d4635] mb-1 uppercase tracking-wider">
              Вес изделия
            </p>
            <p className="text-base md:text-lg font-semibold text-[#1b1b1d]">
              {product.weightGrams} Грамм
            </p>
          </div>
        )}

        {product.stoneCarats && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d0c5af]/30 transition-all hover:shadow-md">
            <p className="text-[12px] font-semibold text-[#4d4635] mb-1 uppercase tracking-wider">
              Караты вставки
            </p>
            <p className="text-base md:text-lg font-semibold text-[#1b1b1d]">
              {product.stoneCarats}
            </p>
          </div>
        )}
      </div>

      {/* Детальный список параметров */}
      <div className="flex flex-col gap-1">
        {product.ringSize && (
          <div className="flex justify-between items-center py-4 border-b border-[#d0c5af]/30">
            <span className="text-base text-[#4d4635]">Размер</span>
            <span className="text-base font-medium text-[#1b1b1d]">{product.ringSize}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-4 border-b border-[#d0c5af]/30">
          <span className="text-base text-[#4d4635]">Сертификат</span>
          <a
            href={product.certificationUrl || 'https://www.gia.edu'}
            target="_blank"
            rel="noreferrer"
            className="text-base font-medium text-[#735c00] hover:underline flex items-center gap-1 group"
          >
            {product.certification}
            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              open_in_new
            </span>
          </a>
        </div>

        <div className="flex justify-between items-center py-4 border-b border-[#d0c5af]/30">
          <span className="text-base text-[#4d4635]">Последний аудит</span>
          <button
            onClick={onOpenAuditHistory}
            className="text-base font-medium text-[#1b1b1d] hover:text-[#735c00] flex items-center gap-1 group"
          >
            {product.lastAudit}
            <span className="material-symbols-outlined text-sm text-[#4d4635] group-hover:text-[#735c00]">
              history
            </span>
          </button>
        </div>
      </div>

      {/* Блок «Подробнее» — виден клиентам */}
      <div className="bg-[#f6f3f5] p-6 rounded-2xl border border-dashed border-[#d0c5af]">
        <div className="flex items-center justify-between mb-3 text-[#4d4635]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">notes</span>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider">
              Подробнее
            </h3>
          </div>
          {!isEditingNotes && isAdmin && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-xs text-[#735c00] font-medium hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Изменить
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-3">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00] min-h-[90px]"
              placeholder="Опишите изделие подробнее — эту информацию увидят клиенты..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setNotesText(product.internalNotes);
                  setIsEditingNotes(false);
                }}
                className="px-3 py-1.5 text-xs text-[#4d4635] hover:bg-[#e4e2e4] rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1.5 text-xs bg-[#735c00] text-white rounded-lg font-medium hover:opacity-90"
              >
                Сохранить
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#4d4635] leading-relaxed">
            {product.internalNotes || 'Подробное описание пока не добавлено.'}
          </p>
        )}
      </div>
    </section>
  );
};

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/components/ProductSpecs.tsx"
mkdir -p src/components
cat > src/components/ProductCatalog.tsx << 'AIAI_CLAUDE_EOF_MARKER'
import React, { useState } from 'react';
import { JewelryProduct, JewelryCategory } from '../types';
import { useAdmin } from '../contexts/AdminContext';
import { formatPrice } from '../utils/format';
import { STATUS_OPTIONS, getStatusStyle } from '../utils/status';

interface ProductCatalogProps {
  products: JewelryProduct[];
  categories: string[];
  onSelectProduct: (product: JewelryProduct) => void;
  onAddNewProduct: () => void;
  onToggleFavorite: (productId: string, e: React.MouseEvent) => void;
  onOpenCategoryManager: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  onSelectProduct,
  onAddNewProduct,
  onToggleFavorite,
  onOpenCategoryManager,
}) => {
  const { isAdmin } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#f0edef] to-white p-6 rounded-3xl border border-[#d0c5af]/30 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#735c00] bg-[#735c00]/10 px-3 py-1 rounded-full">
            Инвентарь AiAi Gold
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1b1b1d] mt-2">
            Каталог ювелирных изделий и драгоценностей
          </h1>
          <p className="text-sm text-[#4d4635] mt-1">
            Управление, инспекция и учет изделий из золота и драгоценных камней.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onAddNewProduct}
            className="bg-[#735c00] text-white px-5 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#574500] transition-all shadow-md shadow-[#735c00]/20 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Добавить украшение
          </button>
        )}
      </div>

      {/* Панель поиска и фильтров */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Поиск */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#735c00]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по артикулу (AU-782), названию, пробе золота, сертификату..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-[#d0c5af]/50 text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00] shadow-sm"
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
            className="px-3 py-3 bg-white border border-[#d0c5af]/50 rounded-2xl text-xs md:text-sm font-semibold text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00] shadow-sm"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                Статус: {st}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-3 bg-white border border-[#d0c5af]/50 rounded-2xl text-xs md:text-sm font-semibold text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00] shadow-sm"
          >
            <option value="price-desc">Сначала дорогие</option>
            <option value="price-asc">Сначала недорогие</option>
            <option value="weight">По весу</option>
            <option value="name">По названию (А-Я)</option>
          </select>
        </div>
      </div>

      {/* Вкладки категорий */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 gallery-container">
        {allCategoryTabs.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#735c00] text-white shadow-md shadow-[#735c00]/20'
                : 'bg-white text-[#4d4635] border border-[#d0c5af]/40 hover:bg-[#f6f3f5]'
            }`}
          >
            {cat}
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={onOpenCategoryManager}
            className="px-3 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap bg-[#f0edef] hover:bg-[#eae7ea] text-[#735c00] border border-[#d0c5af]/40 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ml-auto"
            title="Настройка списка категорий"
          >
            <span className="material-symbols-outlined text-base">settings</span>
            <span>Категории</span>
          </button>
        )}
      </div>

      {/* Грид товаров */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#d0c5af]/30 space-y-3">
          <div className="w-16 h-16 bg-[#f0edef] rounded-full flex items-center justify-center mx-auto text-[#735c00]">
            <span className="material-symbols-outlined text-3xl">search_off</span>
          </div>
          <h3 className="text-lg font-bold text-[#1b1b1d]">Ничего не найдено</h3>
          <p className="text-sm text-[#4d4635] max-w-md mx-auto">
            Попробуйте изменить поисковый запрос или сбросить фильтры категорий.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Все');
              setSelectedStatus('Все');
            }}
            className="px-4 py-2 bg-[#735c00] text-white rounded-xl text-xs font-semibold"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const formattedPrice = formatPrice(product.price, product.currency);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="bg-white rounded-3xl overflow-hidden border border-[#d0c5af]/30 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Изображение */}
                  <div className="relative h-60 bg-[#e0e0db] overflow-hidden">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Статус */}
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border backdrop-blur-md ${getStatusStyle(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>

                    {/* Кнопка Избранного */}
                    {isAdmin && (
                      <button
                        onClick={(e) => onToggleFavorite(product.id, e)}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                          product.isFavorite
                            ? 'bg-white text-[#ba1a1a] shadow-md'
                            : 'bg-black/30 text-white hover:bg-white hover:text-[#1b1b1d]'
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
                    )}
                  </div>

                  {/* Информация */}
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#4d4635] tracking-wider uppercase">
                          {product.sku}
                        </span>
                        <h3 className="font-semibold text-lg text-[#1b1b1d] group-hover:text-[#735c00] transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </div>
                    </div>

                    <div className="text-xl font-bold text-[#735c00]">
                      {formattedPrice}
                    </div>

                    {(product.goldPurity || product.stoneCarats) && (
                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#f6f3f5] p-2.5 rounded-xl text-[#4d4635]">
                        {product.goldPurity && (
                          <div>
                            <span className="block text-[10px] uppercase font-medium text-[#7f7663]">Металл</span>
                            <span className="font-semibold text-[#1b1b1d]">{product.goldPurity}</span>
                          </div>
                        )}
                        {product.stoneCarats && (
                          <div>
                            <span className="block text-[10px] uppercase font-medium text-[#7f7663]">Вставка</span>
                            <span className="font-semibold text-[#1b1b1d]">{product.stoneCarats}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Футер карточки */}
                <div className="px-5 pb-5 flex justify-between items-center text-xs text-[#4d4635] border-t border-[#f0edef] pt-3 mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-sm text-[#735c00]">verified</span>
                    {product.certification}
                  </span>
                  <span className="font-semibold text-[#735c00] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Подробнее
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

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/components/ProductCatalog.tsx"
mkdir -p src/components
cat > src/components/EditProductModal.tsx << 'AIAI_CLAUDE_EOF_MARKER'
import React, { useState, useRef } from 'react';
import { JewelryProduct, StockStatus, Currency, JewelryCategory } from '../types';
import { STATUS_OPTIONS } from '../utils/status';
import { isVideoSrc } from '../utils/format';

/** Reads a picked video as a data: URL. Kept small on purpose: the whole
 * product record (photos + video) has to fit in Firestore's 1MB-per-document
 * limit, so a long or high-quality video simply won't fit. */
const MAX_VIDEO_BYTES = 450_000;
function readVideoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_VIDEO_BYTES) {
      reject(new Error('Видео слишком большое для карточки изделия. Снимите короче (2-3 секунды) или в меньшем качестве и попробуйте снова.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Не удалось загрузить видео'));
    reader.readAsDataURL(file);
  });
}

/** Shrinks a picked photo to a reasonable size and compresses it to JPEG,
 * so a whole product record (with several photos) stays well under
 * Firestore's 1MB-per-document limit. Returns a data: URL, usable directly
 * as an <img src>. */
function resizeImageFile(file: File, maxDimension = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Не удалось прочитать изображение'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

interface EditProductModalProps {
  product: JewelryProduct | null; // null if creating new
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: JewelryProduct) => void;
  onDelete?: (productId: string) => void;
  categories?: string[];
  onAddCategory?: (catName: string) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
  categories = ['Кольца', 'Колье и Цепи', 'Серьги', 'Браслеты', 'Жесткие браслеты'],
  onAddCategory,
}) => {
  if (!isOpen) return null;

  const isNew = !product;

  const [formData, setFormData] = useState<Partial<JewelryProduct>>({
    id: product?.id || `prod-${Date.now()}`,
    sku: product?.sku || 'AU-782-NEW',
    name: product?.name || '',
    category: product?.category || categories[0] || 'Кольца',
    price: product?.price || 1000,
    currency: product?.currency || 'KGS',
    status: product?.status || 'В НАЛИЧИИ',
    goldPurity: product?.goldPurity || '18K Желтое золото',
    weightGrams: product?.weightGrams || 5.0,
    stoneCarats: product?.stoneCarats || '1.00 CTW',
    ringSize: product?.ringSize || '16.5 (Изменяемый)',
    certification: product?.certification || 'GIA #100200',
    certificationUrl: product?.certificationUrl || 'https://www.gia.edu',
    lastAudit: product?.lastAudit || new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }),
    internalNotes: product?.internalNotes || '',
    images: product?.images?.length ? [...product.images] : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80'],
    isFavorite: product?.isFavorite || false,
    createdAt: product?.createdAt || new Date().toISOString(),
    auditHistory: product?.auditHistory || [],
  });

  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof JewelryProduct, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNewCategoryInline = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (onAddCategory) {
      onAddCategory(trimmed);
    }
    handleChange('category', trimmed);
    setNewCategoryInput('');
    setShowAddCategoryInput(false);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handlePhotosSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPhotoError(null);
    setIsProcessingPhotos(true);
    try {
      const processed: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;
        const dataUrl = await resizeImageFile(file);
        processed.push(dataUrl);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...processed],
      }));
    } catch (err) {
      setPhotoError('Не удалось загрузить одно из фото. Попробуйте ещё раз.');
      console.error(err);
    } finally {
      setIsProcessingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError(null);
    setIsProcessingVideo(true);
    try {
      const dataUrl = await readVideoFile(file);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), dataUrl],
      }));
    } catch (err: any) {
      setVideoError(err?.message || 'Не удалось загрузить видео. Попробуйте ещё раз.');
    } finally {
      setIsProcessingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    onSave(formData as JewelryProduct);
    onClose();
  };

  const handleDeleteClick = () => {
    if (!product || !onDelete) return;
    const confirmed = window.confirm(
      `Удалить «${product.name}» безвозвратно? Это действие нельзя отменить.`
    );
    if (confirmed) {
      onDelete(product.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#d0c5af]/40">
        {/* Шапка модального окна */}
        <div className="px-6 py-5 border-b border-[#f0edef] flex justify-between items-center bg-[#fcf8fb]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#735c00]/10 text-[#735c00] rounded-xl">
              <span className="material-symbols-outlined text-2xl">edit_note</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1b1b1d]">
                {isNew ? 'Добавить ювелирное изделие' : `Редактирование характеристик`}
              </h2>
              <p className="text-xs text-[#4d4635]">
                {isNew ? 'Новое изделие в каталоге AiAi Gold' : `Артикул: ${formData.sku}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#eae7ea] text-[#4d4635] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Тело формы */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Общая информация */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#735c00] border-b border-[#f0edef] pb-1">
              Общая информация
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Название украшения *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  placeholder="например, Celestial Emerald Ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Артикул (SKU) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku || ''}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  placeholder="например, AU-782-ERD"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-[#4d4635]">
                    Категория
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                    className="text-[11px] text-[#735c00] font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    {showAddCategoryInput ? 'Выбрать из списка' : 'Новая категория'}
                  </button>
                </div>

                {showAddCategoryInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="Название категории..."
                      className="flex-1 px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategoryInline}
                      className="px-3 py-2 bg-[#735c00] text-white rounded-xl text-xs font-bold hover:bg-[#574500]"
                    >
                      ОК
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.category || categories[0] || 'Кольца'}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00] bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Цена *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price || ''}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                    placeholder="12450"
                  />
                  <select
                    value={formData.currency || 'KGS'}
                    onChange={(e) => handleChange('currency', e.target.value as Currency)}
                    className="px-2 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00] bg-white font-medium"
                  >
                    <option value="KGS">сом</option>
                    <option value="USD">$</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Статус
                </label>
                <select
                  value={formData.status || 'В НАЛИЧИИ'}
                  onChange={(e) => handleChange('status', e.target.value as StockStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00] bg-white font-medium"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Геммологические и металлические характеристики */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#735c00] border-b border-[#f0edef] pb-1">
              Характеристики металла и камней
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Проба / Сплав
                </label>
                <input
                  type="text"
                  value={formData.goldPurity || ''}
                  onChange={(e) => handleChange('goldPurity', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  placeholder="18K Желтое золото"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Вес (Граммы)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weightGrams || ''}
                  onChange={(e) => handleChange('weightGrams', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  placeholder="8.42"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Караты вставки
                </label>
                <input
                  type="text"
                  value={formData.stoneCarats || ''}
                  onChange={(e) => handleChange('stoneCarats', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  placeholder="2.50 CTW"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Размер / Длина
                </label>
                <input
                  type="text"
                  value={formData.ringSize || ''}
                  onChange={(e) => handleChange('ringSize', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  placeholder="16.5 (Изменяемый)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Сертификат №
                </label>
                <input
                  type="text"
                  value={formData.certification || ''}
                  onChange={(e) => handleChange('certification', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  placeholder="GIA #221588"
                />
              </div>
            </div>
          </div>

          {/* Подробнее — видно клиентам */}
          <div>
            <label className="block text-xs font-semibold text-[#4d4635] mb-1">
              Подробнее (отображается клиентам)
            </label>
            <textarea
              rows={3}
              value={formData.internalNotes || ''}
              onChange={(e) => handleChange('internalNotes', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
              placeholder="Опишите изделие подробнее для клиентов..."
            />
          </div>

          {/* Фото и видео */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#4d4635]">
              Фото и видео украшения
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosSelected}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingPhotos}
              className="w-full px-4 py-2.5 bg-[#735c00] hover:bg-[#574500] disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_a_photo</span>
              {isProcessingPhotos ? 'Обработка фото…' : 'Выбрать фото с телефона'}
            </button>
            {photoError && <p className="text-xs text-red-600">{photoError}</p>}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelected}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={isProcessingVideo}
              className="w-full px-4 py-2.5 bg-white hover:bg-[#f6f3f5] disabled:opacity-60 text-[#735c00] border border-[#735c00]/40 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">videocam</span>
              {isProcessingVideo ? 'Обработка видео…' : 'Выбрать видео с телефона'}
            </button>
            {videoError && <p className="text-xs text-red-600">{videoError}</p>}
            <p className="text-[11px] text-[#4d4635]/70">
              Видео должно быть очень коротким (2-3 секунды) — иначе не поместится в карточку изделия.
            </p>

            <div className="grid grid-cols-4 gap-2 mt-2">
              {(formData.images || []).map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden h-20 border border-[#d0c5af] bg-black/5">
                  {isVideoSrc(url) ? (
                    <video src={url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  )}
                  {isVideoSrc(url) && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white rounded-full p-0.5 pointer-events-none">
                      <span className="material-symbols-outlined text-xs block">play_arrow</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 group-hover:opacity-100"
                    title="Удалить"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки действия */}
          <div className="pt-4 border-t border-[#f0edef] flex justify-between items-center gap-3">
            {!isNew && onDelete ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Удалить украшение
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#d0c5af] text-[#4d4635] text-sm font-semibold hover:bg-[#eae7ea]"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#735c00] text-white text-sm font-bold hover:bg-[#574500] shadow-md shadow-[#735c00]/20"
              >
                Сохранить характеристики
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/components/EditProductModal.tsx"
mkdir -p src/components
cat > src/components/GallerySection.tsx << 'AIAI_CLAUDE_EOF_MARKER'
import React, { useState, useRef, useEffect } from 'react';
import { isVideoSrc } from '../utils/format';

interface GallerySectionProps {
  images: string[];
  productName: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (galleryRef.current) {
      const scrollLeft = galleryRef.current.scrollLeft;
      const width = galleryRef.current.clientWidth;
      if (width > 0) {
        const newIndex = Math.round(scrollLeft / width);
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollToImage = (index: number) => {
    setActiveIndex(index);
    if (galleryRef.current) {
      const width = galleryRef.current.clientWidth;
      galleryRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    // Reset index if images change
    setActiveIndex(0);
  }, [images]);

  return (
    <section className="lg:col-span-7 relative group">
      <div
        ref={galleryRef}
        onScroll={handleScroll}
        className="gallery-container flex overflow-x-auto snap-x snap-mandatory h-[420px] sm:h-[500px] md:h-[600px] md:rounded-3xl shadow-lg bg-[#e0e0db] relative cursor-pointer"
      >
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            className="snap-center shrink-0 w-full h-full relative overflow-hidden"
            onClick={() => setIsLightboxOpen(true)}
          >
            {isVideoSrc(imgUrl) ? (
              <video
                src={imgUrl}
                className="w-full h-full object-cover select-none"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={imgUrl}
                alt={`${productName} view ${idx + 1}`}
                className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-105"
              />
            )}
            <div className="absolute top-4 right-4 bg-black/40 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-sm">zoom_in</span>
              Expand
            </div>
          </div>
        ))}
      </div>

      {/* Swipe Dot Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToImage(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === activeIndex
                ? 'bg-[#735c00] w-6'
                : 'bg-white/60 hover:bg-white'
            }`}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>

      {/* Desktop Floating Thumbnails */}
      {images.length > 1 && (
        <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-10">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => scrollToImage(idx)}
              className={`w-16 h-16 rounded-xl border-2 overflow-hidden shadow-md cursor-pointer transition-all relative ${
                idx === activeIndex
                  ? 'border-[#735c00] scale-105 ring-2 ring-[#735c00]/30'
                  : 'border-white opacity-60 hover:opacity-100 hover:scale-100'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {isVideoSrc(imgUrl) && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="material-symbols-outlined text-white text-xl">play_arrow</span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-[#d4af37] p-2 rounded-full bg-white/10"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <div className="max-w-4xl max-h-[80vh] relative">
            {isVideoSrc(images[activeIndex]) ? (
              <video
                src={images[activeIndex]}
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
                controls
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                src={images[activeIndex]}
                alt={productName}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
            )}
          </div>
          <div className="flex gap-2 mt-6">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 relative ${
                  idx === activeIndex ? 'border-[#d4af37]' : 'border-transparent opacity-50'
                }`}
              >
                {isVideoSrc(imgUrl) ? (
                  <>
                    <video src={imgUrl} className="w-full h-full object-cover" muted />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="material-symbols-outlined text-white text-base">play_arrow</span>
                    </span>
                  </>
                ) : (
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/components/GallerySection.tsx"
mkdir -p src/components
cat > src/components/ShareModal.tsx << 'AIAI_CLAUDE_EOF_MARKER'
import React, { useState } from 'react';
import { JewelryProduct } from '../types';
import { formatPrice } from '../utils/format';

interface ShareModalProps {
  product: JewelryProduct;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ product, isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const formattedPrice = formatPrice(product.price, product.currency);

  const specLines: string[] = [
    `👑 Спецификация украшения AiAi Gold`,
    `-----------------------------------------`,
    `Наименование: ${product.name}`,
    `Артикул: ${product.sku}`,
    `Статус: ${product.status}`,
    `Стоимость: ${formattedPrice}`,
    ``,
  ];
  if (product.goldPurity) specLines.push(`Проба металла: ${product.goldPurity}`);
  if (product.weightGrams) specLines.push(`Вес: ${product.weightGrams} г`);
  if (product.stoneCarats) specLines.push(`Характеристика вставок: ${product.stoneCarats}`);
  if (product.ringSize) specLines.push(`Размер/Длина: ${product.ringSize}`);
  if (product.certification) specLines.push(`Сертификат: ${product.certification}`);
  if (product.lastAudit) specLines.push(`Последний аудит: ${product.lastAudit}`);
  specLines.push(``);
  if (product.internalNotes) specLines.push(`Подробнее: ${product.internalNotes}`);
  specLines.push(`-----------------------------------------`, `AiAi Gold`);

  const specSummaryText = specLines.join('\n');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(specSummaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#d0c5af]/40">
        {/* Шапка */}
        <div className="px-6 py-5 border-b border-[#f0edef] flex justify-between items-center bg-[#fcf8fb]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#735c00]/10 text-[#735c00] rounded-xl">
              <span className="material-symbols-outlined text-2xl">share</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1b1b1d]">Экспорт VIP-спецификации</h2>
              <p className="text-xs text-[#4d4635]">{product.name} ({product.sku})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#eae7ea] text-[#4d4635]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 space-y-5">
          {/* Прямая ссылка */}
          <div>
            <label className="block text-xs font-semibold text-[#4d4635] mb-1.5 uppercase tracking-wider">
              Прямая ссылка на хранилище
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-3 py-2 bg-[#f6f3f5] rounded-xl border border-[#d0c5af]/50 text-xs text-[#1b1b1d]"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-[#735c00] text-white rounded-xl text-xs font-semibold hover:bg-[#574500] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedLink ? 'check' : 'content_copy'}
                </span>
                {copiedLink ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
          </div>

          {/* Текстовый паспорт */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[#4d4635] uppercase tracking-wider">
                Текстовый паспорт спецификации
              </label>
              <button
                onClick={handleCopySummary}
                className="text-xs text-[#735c00] font-semibold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedText ? 'check' : 'copy_all'}
                </span>
                {copiedText ? 'Скопировано' : 'Скопировать текст'}
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={specSummaryText}
              className="w-full p-3 bg-[#f6f3f5] rounded-xl border border-[#d0c5af]/50 font-mono text-xs text-[#1b1b1d] focus:outline-none"
            />
          </div>
        </div>

        {/* Футер */}
        <div className="px-6 py-4 bg-[#fcf8fb] border-t border-[#f0edef] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#735c00] text-white rounded-xl text-xs font-bold hover:bg-[#574500]"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/components/ShareModal.tsx"
mkdir -p src/components
cat > src/components/AuditLogModal.tsx << 'AIAI_CLAUDE_EOF_MARKER'
import React, { useState } from 'react';
import { JewelryProduct, AuditRecord, StockStatus } from '../types';
import { useAdmin } from '../contexts/AdminContext';
import { STATUS_OPTIONS } from '../utils/status';

interface AuditLogModalProps {
  product: JewelryProduct;
  isOpen: boolean;
  onClose: () => void;
  onAddAuditRecord: (record: AuditRecord) => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddAuditRecord,
}) => {
  const { isAdmin } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [inspector, setInspector] = useState('');
  const [location, setLocation] = useState('Главный сейф - Ячейка 01');
  const [status, setStatus] = useState<StockStatus>(product.status);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspector || !note) return;

    const newRecord: AuditRecord = {
      id: `aud-${Date.now()}`,
      date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }),
      inspector,
      location,
      status,
      note,
    };

    onAddAuditRecord(newRecord);
    setInspector('');
    setNote('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-[#d0c5af]/40">
        {/* Шапка */}
        <div className="px-6 py-5 border-b border-[#f0edef] flex justify-between items-center bg-[#fcf8fb]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#735c00]/10 text-[#735c00] rounded-xl">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1b1b1d]">История аудита в хранилище</h2>
              <p className="text-xs text-[#4d4635]">{product.name} ({product.sku})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#eae7ea] text-[#4d4635]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#735c00]">
              Журнал проверок ({product.auditHistory.length})
            </h3>
            {!isAdding && isAdmin && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 bg-[#735c00] text-white rounded-xl text-xs font-semibold hover:bg-[#574500] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Внести новый аудит
              </button>
            )}
          </div>

          {/* Форма нового аудита */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="bg-[#f6f3f5] p-4 rounded-2xl border border-[#d0c5af] space-y-3">
              <h4 className="text-xs font-bold text-[#1b1b1d] uppercase">Запись результатов проверки</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#4d4635] uppercase mb-1">
                    ФИО Аудитора / Эксперта
                  </label>
                  <input
                    type="text"
                    required
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    placeholder="например, М. Лоран"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#d0c5af] text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#4d4635] uppercase mb-1">
                    Локация / Сейф
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="например, Салон Женева"
                    className="w-full px-3 py-1.5 rounded-xl border border-[#d0c5af] text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#4d4635] uppercase mb-1">
                  Статус при инспекции
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StockStatus)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#d0c5af] text-xs bg-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#4d4635] uppercase mb-1">
                  Результаты и примечания
                </label>
                <textarea
                  required
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="например, Вес подтвержден, крепление камня в норме."
                  className="w-full px-3 py-1.5 rounded-xl border border-[#d0c5af] text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 text-xs text-[#4d4635]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#735c00] text-white rounded-xl text-xs font-semibold"
                >
                  Сохранить
                </button>
              </div>
            </form>
          )}

          {/* Список истории аудитов */}
          {product.auditHistory.length === 0 ? (
            <p className="text-sm text-[#4d4635] italic">Записей об аудите пока нет.</p>
          ) : (
            <div className="space-y-3">
              {product.auditHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white p-4 rounded-2xl border border-[#d0c5af]/30 shadow-sm space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-[#1b1b1d]">{rec.inspector}</span>
                      <span className="text-xs text-[#4d4635] block">{rec.location}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#735c00]">{rec.date}</span>
                      <span className="block text-[10px] font-bold uppercase text-[#4d4635]">{rec.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#4d4635] bg-[#f6f3f5] p-2.5 rounded-xl italic">
                    "{rec.note}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/components/AuditLogModal.tsx"
mkdir -p src/utils
cat > src/utils/status.ts << 'AIAI_CLAUDE_EOF_MARKER'
import { StockStatus } from '../types';

/** Statuses in the order they should appear in dropdowns and filters. */
export const STATUS_OPTIONS: StockStatus[] = [
  'ПОД ЗАКАЗ',
  'В НАЛИЧИИ',
  'ПРОДАНО',
  'РЕЗЕРВИРОВАНО',
  'В ПУТИ',
];

/** Tailwind classes for each status badge (bg/text/border). */
export function getStatusStyle(status: string): string {
  switch (status) {
    case 'ПОД ЗАКАЗ':
      return 'bg-[#6b4fa0]/10 text-[#6b4fa0] border-[#6b4fa0]/20';
    case 'В НАЛИЧИИ':
      return 'bg-[#735c00]/10 text-[#735c00] border-[#735c00]/20';
    case 'ПРОДАНО':
      return 'bg-[#5d5f5b]/15 text-[#5d5f5b] border-[#5d5f5b]/30';
    case 'РЕЗЕРВИРОВАНО':
      return 'bg-[#d4af37]/20 text-[#554300] border-[#d4af37]/40';
    case 'В ПУТИ':
      return 'bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/20';
    default:
      return 'bg-[#735c00]/10 text-[#735c00]';
  }
}

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/utils/status.ts"
mkdir -p src/utils
cat > src/utils/format.ts << 'AIAI_CLAUDE_EOF_MARKER'
import { Currency } from '../types';

/** Formats a price in either сом (KGS) or доллары (USD).
 * Falls back to USD for older records saved before the currency field existed. */
export function formatPrice(price: number, currency?: Currency): string {
  const amount = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price);
  return currency === 'KGS' ? `${amount} сом` : `$${amount}`;
}

/** True if a stored media URL (data: URL or link) is a video rather than a photo. */
export function isVideoSrc(src: string): boolean {
  return src.startsWith('data:video') || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(src);
}

AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/utils/format.ts"
echo "Готово. Теперь: git add . && git commit -m \"fix\" && git push"
