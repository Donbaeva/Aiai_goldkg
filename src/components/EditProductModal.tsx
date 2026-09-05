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
