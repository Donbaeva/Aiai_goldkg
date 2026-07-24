import React, { useState } from 'react';
import { JewelryProduct } from '../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  products: JewelryProduct[];
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  products,
  onAddCategory,
  onDeleteCategory,
}) => {
  if (!isOpen) return null;

  const [newCategoryName, setNewCategoryName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Категория с таким названием уже существует');
      return;
    }

    onAddCategory(trimmed);
    setNewCategoryName('');
    setErrorMsg('');
  };

  const getProductCount = (categoryName: string) => {
    return products.filter((p) => p.category === categoryName).length;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-[#d0c5af]/40">
        {/* Шапка модального окна */}
        <div className="px-6 py-5 border-b border-[#f0edef] flex justify-between items-center bg-[#fcf8fb]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#735c00]/10 text-[#735c00] rounded-xl">
              <span className="material-symbols-outlined text-2xl">category</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1b1b1d]">Управление категориями</h2>
              <p className="text-xs text-[#4d4635]">Создание и удаление категорий украшений</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#eae7ea] text-[#4d4635] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Форма добавления */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-xs font-semibold text-[#4d4635] uppercase tracking-wider">
              Новая категория
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Например, Кулоны или Чокеры..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#d0c5af] text-sm text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#735c00] text-white rounded-xl text-xs font-bold hover:bg-[#574500] transition-all flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Создать
              </button>
            </div>
            {errorMsg && <p className="text-xs text-[#ba1a1a] font-medium">{errorMsg}</p>}
          </form>

          {/* Список категорий */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#4d4635] uppercase tracking-wider">
              Существующие категории ({categories.length})
            </label>

            {categories.length === 0 ? (
              <p className="text-xs text-[#4d4635] italic py-2">Категории отсутствуют.</p>
            ) : (
              <div className="divide-y divide-[#f0edef] border border-[#d0c5af]/30 rounded-2xl overflow-hidden bg-[#fcf8fb]">
                {categories.map((cat) => {
                  const count = getProductCount(cat);
                  return (
                    <div
                      key={cat}
                      className="px-4 py-3 flex justify-between items-center bg-white hover:bg-[#f6f3f5] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-[#735c00]">
                          folder
                        </span>
                        <span className="text-sm font-semibold text-[#1b1b1d]">{cat}</span>
                        <span className="text-xs text-[#4d4635] bg-[#f0edef] px-2 py-0.5 rounded-full font-medium">
                          {count} {count === 1 ? 'изделие' : count >= 2 && count <= 4 ? 'изделия' : 'изделий'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            count > 0 &&
                            !window.confirm(
                              `В категории "${cat}" находится ${count} изделий. При удалении их категория станет "Другое". Удалить категорию?`
                            )
                          ) {
                            return;
                          }
                          onDeleteCategory(cat);
                        }}
                        className="p-1.5 text-[#4d4635] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-colors"
                        title={`Удалить категорию "${cat}"`}
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
