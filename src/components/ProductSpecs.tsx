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

