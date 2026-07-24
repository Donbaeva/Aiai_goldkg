export type StockStatus = 'В НАЛИЧИИ' | 'ЗАБРОНИРОВАНО' | 'ПРОДАНО' | 'НА АУДИТЕ';
export type JewelryCategory = string;

export interface AuditRecord {
  id: string;
  date: string;
  inspector: string;
  location: string;
  status: StockStatus;
  note: string;
}

export interface JewelryProduct {
  id: string;
  sku: string;
  name: string;
  category: JewelryCategory;
  price: number;
  status: StockStatus;
  goldPurity: string;
  weightGrams: number;
  stoneCarats: string;
  clarity: string;
  ringSize?: string;
  certification: string;
  certificationUrl?: string;
  lastAudit: string;
  internalNotes: string;
  images: string[];
  isFavorite: boolean;
  createdAt: string;
  auditHistory: AuditRecord[];
}

export type ViewMode = 'detail' | 'catalog' | 'analytics';
