import React from 'react';
import { ViewMode, JewelryProduct } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedProduct: JewelryProduct;
  onOpenShare: () => void;
  onOpenAuditLog: () => void;
  productCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  selectedProduct,
  onOpenShare,
  onOpenAuditLog,
  productCount,
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
            <span className="text-xs bg-[#735c00]/10 text-[#735c00] px-2 py-0.5 rounded-full font-normal hidden sm:inline-block">
              Реестр активов
            </span>
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

          {showMoreMenu && (
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
      </div>
    </header>
  );
};
