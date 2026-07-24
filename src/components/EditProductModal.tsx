import React, { useState } from 'react';
import { JewelryProduct, StockStatus, JewelryCategory } from '../types';

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
    status: product?.status || 'В НАЛИЧИИ',
    goldPurity: product?.goldPurity || '18K Желтое золото',
    weightGrams: product?.weightGrams || 5.0,
    stoneCarats: product?.stoneCarats || '1.00 CTW',
    clarity: product?.clarity || 'VVS1 / Цвет D',
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
  const [newImageUrl, setNewImageUrl] = useState('');

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

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
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
                {isNew ? 'Создание записи в реестре AiAi Gold Vault' : `Артикул: ${formData.sku}`}
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
                  Цена ($ USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  placeholder="12450.00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4d4635] mb-1">
                  Статус в хранилище
                </label>
                <select
                  value={formData.status || 'В НАЛИЧИИ'}
                  onChange={(e) => handleChange('status', e.target.value as StockStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00] bg-white font-medium"
                >
                  <option value="В НАЛИЧИИ">В НАЛИЧИИ</option>
                  <option value="ЗАБРОНИРОВАНО">ЗАБРОНИРОВАНО</option>
                  <option value="ПРОДАНО">ПРОДАНО</option>
                  <option value="НА АУДИТЕ">НА АУДИТЕ</option>
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
                  Чистота / Цвет
                </label>
                <input
                  type="text"
                  value={formData.clarity || ''}
                  onChange={(e) => handleChange('clarity', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  placeholder="VVS1 / Цвет D"
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

          {/* Внутренние заметки */}
          <div>
            <label className="block text-xs font-semibold text-[#4d4635] mb-1">
              Внутренние заметки хранилища
            </label>
            <textarea
              rows={3}
              value={formData.internalNotes || ''}
              onChange={(e) => handleChange('internalNotes', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
              placeholder="Служебная информация по шоуруму, бронзированию или полировке..."
            />
          </div>

          {/* Галерея изображений */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#4d4635]">
              Ссылки на фото (URL)
            </label>

            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#d0c5af] text-xs text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                placeholder="https://images.unsplash.com/photo-..."
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-[#f0edef] hover:bg-[#eae7ea] text-[#735c00] rounded-xl text-xs font-semibold"
              >
                Добавить фото
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2">
              {(formData.images || []).map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden h-20 border border-[#d0c5af]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 group-hover:opacity-100"
                    title="Удалить фото"
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
