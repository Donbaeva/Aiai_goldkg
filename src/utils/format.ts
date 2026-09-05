import { Currency } from '../types';

/** Formats a price in either сом (KGS) or доллары (USD).
 * Falls back to USD for older records saved before the currency field existed. */
export function formatPrice(price: number, currency?: Currency): string {
  const amount = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price);
  return currency === 'KGS' ? `${amount} сом` : `$${amount}`;
}

/** True if a stored media URL (data: URL or link) is a video rather than a photo. */
export function isVideoSrc(src: string): boolean {
  return src.startsWith('data:video') || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(src);
}
