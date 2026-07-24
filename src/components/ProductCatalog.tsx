import React, { useState } from 'react';
import { JewelryProduct, JewelryCategory, StockStatus } from '../types';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedStatus, setSelectedStatus] = useState<string>('Все');
  const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'name' | 'weight'>('price-desc');

  const allCategoryTabs = ['Все', ...categories];
  const statuses: string[] = ['Все', 'В НАЛИЧИИ', 'ЗАБРОНИРОВАНО', 'ПРОДАНО', 'НА АУДИТЕ'];

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

  const getStatusStyle = (status: StockStatus) => {
    switch (status) {
      case 'В НАЛИЧИИ':
        return 'bg-[#735c00]/10 text-[#735c00] border-[#735c00]/20';
      case 'ЗАБРОНИРОВАНО':
        return 'bg-[#d4af37]/20 text-[#554300] border-[#d4af37]/40';
      case 'ПРОДАНО':
        return 'bg-[#5d5f5b]/15 text-[#5d5f5b] border-[#5d5f5b]/30';
      case 'НА АУДИТЕ':
        return 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/20';
      default:
        return 'bg-[#735c00]/10 text-[#735c00]';
    }
  };

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

        <button
          onClick={onAddNewProduct}
          className="bg-[#735c00] text-white px-5 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#574500] transition-all shadow-md shadow-[#735c00]/20 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Добавить украшение
        </button>
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

        <button
          onClick={onOpenCategoryManager}
          className="px-3 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap bg-[#f0edef] hover:bg-[#eae7ea] text-[#735c00] border border-[#d0c5af]/40 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ml-auto"
          title="Настройка списка категорий"
        >
          <span className="material-symbols-outlined text-base">settings</span>
          <span>Категории</span>
        </button>
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
            const formattedPrice = new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'USD',
            }).format(product.price);

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

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#f6f3f5] p-2.5 rounded-xl text-[#4d4635]">
                      <div>
                        <span className="block text-[10px] uppercase font-medium text-[#7f7663]">Металл</span>
                        <span className="font-semibold text-[#1b1b1d]">{product.goldPurity}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-medium text-[#7f7663]">Вставка</span>
                        <span className="font-semibold text-[#1b1b1d]">{product.stoneCarats}</span>
                      </div>
                    </div>
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
