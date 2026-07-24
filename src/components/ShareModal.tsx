import React, { useState } from 'react';
import { JewelryProduct } from '../types';

interface ShareModalProps {
  product: JewelryProduct;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ product, isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  const specSummaryText = `👑 Спецификация ювелирного актива AiAi Gold
-----------------------------------------
Наименование: ${product.name}
Артикул: ${product.sku}
Статус: ${product.status}
Стоимость: ${formattedPrice}

Проба металла: ${product.goldPurity}
Вес: ${product.weightGrams} г
Характеристика вставок: ${product.stoneCarats} (${product.clarity})
Размер/Длина: ${product.ringSize || 'Н/Д'}
Сертификат: ${product.certification}
Последний аудит: ${product.lastAudit}

Служебная заметка: "${product.internalNotes}"
-----------------------------------------
Реестр активов AiAi Gold Vault`;

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
