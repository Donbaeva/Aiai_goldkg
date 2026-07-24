import React from 'react';

interface ActionBarProps {
  onEditProduct: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onEditProduct,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full p-4 sm:p-6 md:p-8 glass-effect z-40 border-t border-[#d0c5af]/30 shadow-2xl">
      <div className="max-w-screen-xl mx-auto flex gap-3 sm:gap-4">
        <button
          onClick={onEditProduct}
          className="flex-1 bg-[#735c00] text-white py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-[#574500] active:scale-[0.98] transition-all shadow-lg shadow-[#735c00]/25 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">edit</span>
          Редактировать товар
        </button>

        <button
          onClick={onToggleFavorite}
          className={`w-14 h-14 sm:w-16 sm:h-16 bg-white border border-[#d0c5af] rounded-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm ${
            isFavorite
              ? 'text-[#ba1a1a] border-[#ba1a1a]/40 bg-[#ffdad6]/20'
              : 'text-[#4d4635] hover:bg-[#eae7ea]'
          }`}
          title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>
    </div>
  );
};
