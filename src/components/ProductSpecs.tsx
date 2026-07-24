import React, { useState } from 'react';
import { JewelryProduct } from '../types';
import { useAdmin } from '../contexts/AdminContext';

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

  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(product.price);

  const getStatusBadge = (status: string) => {
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
    <section className="lg:col-span-5 px-4 md:px-0 flex flex-col gap-8">
      {/* Заголовок товара */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-[12px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border ${getStatusBadge(product.status)}`}>
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

      {/* Сетка характеристик 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d0c5af]/30 transition-all hover:shadow-md">
          <p className="text-[12px] font-semibold text-[#4d4635] mb-1 uppercase tracking-wider">
            Проба металл
          </p>
          <p className="text-base md:text-lg font-semibold text-[#1b1b1d]">
            {product.goldPurity}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d0c5af]/30 transition-all hover:shadow-md">
          <p className="text-[12px] font-semibold text-[#4d4635] mb-1 uppercase tracking-wider">
            Вес изделия
          </p>
          <p className="text-base md:text-lg font-semibold text-[#1b1b1d]">
            {product.weightGrams} Грамм
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d0c5af]/30 transition-all hover:shadow-md">
          <p className="text-[12px] font-semibold text-[#4d4635] mb-1 uppercase tracking-wider">
            Караты вставки
          </p>
          <p className="text-base md:text-lg font-semibold text-[#1b1b1d]">
            {product.stoneCarats}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d0c5af]/30 transition-all hover:shadow-md">
          <p className="text-[12px] font-semibold text-[#4d4635] mb-1 uppercase tracking-wider">
            Чистота / Цвет
          </p>
          <p className="text-base md:text-lg font-semibold text-[#1b1b1d]">
            {product.clarity}
          </p>
        </div>
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

      {/* Блок внутренних заметок */}
      <div className="bg-[#f6f3f5] p-6 rounded-2xl border border-dashed border-[#d0c5af]">
        <div className="flex items-center justify-between mb-3 text-[#4d4635]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">notes</span>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider">
              Внутренние заметки
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
              placeholder="Введите служебные заметки по хранению..."
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
          <p className="text-sm text-[#4d4635] italic leading-relaxed">
            "{product.internalNotes || 'Заметок по данному украшению нет.'}"
          </p>
        )}
      </div>
    </section>
  );
};
