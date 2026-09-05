import { StockStatus } from '../types';

/** Statuses in the order they should appear in dropdowns and filters. */
export const STATUS_OPTIONS: StockStatus[] = [
  'ПОД ЗАКАЗ',
  'В НАЛИЧИИ',
  'ПРОДАНО',
  'РЕЗЕРВИРОВАНО',
  'В ПУТИ',
];

/** Tailwind classes for each status badge (bg/text/border). */
export function getStatusStyle(status: string): string {
  switch (status) {
    case 'ПОД ЗАКАЗ':
      return 'bg-[#6b4fa0]/10 text-[#6b4fa0] border-[#6b4fa0]/20';
    case 'В НАЛИЧИИ':
      return 'bg-[#735c00]/10 text-[#735c00] border-[#735c00]/20';
    case 'ПРОДАНО':
      return 'bg-[#5d5f5b]/15 text-[#5d5f5b] border-[#5d5f5b]/30';
    case 'РЕЗЕРВИРОВАНО':
      return 'bg-[#d4af37]/20 text-[#554300] border-[#d4af37]/40';
    case 'В ПУТИ':
      return 'bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/20';
    default:
      return 'bg-[#735c00]/10 text-[#735c00]';
  }
}

