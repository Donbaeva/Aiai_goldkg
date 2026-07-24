import React, { useState } from 'react';
import { JewelryProduct, AuditRecord, StockStatus } from '../types';

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
  if (!isOpen) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [inspector, setInspector] = useState('');
  const [location, setLocation] = useState('Главный сейф - Ячейка 01');
  const [status, setStatus] = useState<StockStatus>(product.status);
  const [note, setNote] = useState('');

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
            {!isAdding && (
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
                  <option value="В НАЛИЧИИ">В НАЛИЧИИ</option>
                  <option value="ЗАБРОНИРОВАНО">ЗАБРОНИРОВАНО</option>
                  <option value="ПРОДАНО">ПРОДАНО</option>
                  <option value="НА АУДИТЕ">НА АУДИТЕ</option>
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
