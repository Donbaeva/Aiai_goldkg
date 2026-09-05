export type StockStatus = 'ПОД ЗАКАЗ' | 'В НАЛИЧИИ' | 'ПРОДАНО' | 'РЕЗЕРВИРОВАНО' | 'В ПУТИ';
export type Currency = 'KGS' | 'USD';
export type JewelryCategory = string;

export interface JewelryProduct {
  id: string;
  sku: string;
  name: string;
  category: JewelryCategory;
  price: number;
  currency: Currency;
  status: StockStatus;
  goldPurity: string;
  weightGrams: number;
  stoneCarats: string;
  ringSize?: string;
  certification: string;
  certificationUrl?: string;
  internalNotes: string;
  /** Photo and video data URLs / links, shown to clients in the gallery. */
  images: string[];
  isFavorite: boolean;
  createdAt: string;
}

export type ViewMode = 'detail' | 'catalog' | 'analytics';

