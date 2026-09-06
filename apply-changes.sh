#!/usr/bin/env bash
set -e
echo "Обновляю файлы..."

mkdir -p src/services
cat > src/services/catalogStore.ts << 'AIAI_CLAUDE_EOF_MARKER'
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { JewelryProduct } from '../types';

const PRODUCTS_COLLECTION = 'products';
const categoriesDocRef = doc(db, 'meta', 'categories');
const heroDocRef = doc(db, 'meta', 'hero');

export type CategoryCovers = Record<string, string>;

export interface CategoryData {
  names: string[];
  covers: CategoryCovers;
}

export interface HeroSettings {
  media: string;
  captions: { ru: string; ky: string; en: string };
}

const DEFAULT_HERO: HeroSettings = { media: '', captions: { ru: '', ky: '', en: '' } };

/** Subscribes to live updates of every product. Fires immediately with
 * current data, then again whenever ANY manager changes ANY product. */
export function subscribeToProducts(
  onChange: (products: JewelryProduct[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, PRODUCTS_COLLECTION),
    (snapshot) => {
      const products = snapshot.docs.map((d) => d.data() as JewelryProduct);
      onChange(products);
    },
    onError
  );
}

/** Subscribes to live updates of the shared category list (+ covers). */
export function subscribeToCategories(
  onChange: (data: CategoryData) => void,
  fallback: string[],
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    categoriesDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const names = Array.isArray(data.list) ? (data.list as string[]) : fallback;
        const covers =
          data.covers && typeof data.covers === 'object'
            ? (data.covers as CategoryCovers)
            : {};
        onChange({ names, covers });
      } else {
        onChange({ names: fallback, covers: {} });
      }
    },
    onError
  );
}

/** Subscribes to live updates of the home hero (cover media + captions). */
export function subscribeToHeroSettings(
  onChange: (settings: HeroSettings) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    heroDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<HeroSettings>;
        onChange({
          media: typeof data.media === 'string' ? data.media : DEFAULT_HERO.media,
          captions: {
            ru: data.captions?.ru ?? DEFAULT_HERO.captions.ru,
            ky: data.captions?.ky ?? DEFAULT_HERO.captions.ky,
            en: data.captions?.en ?? DEFAULT_HERO.captions.en,
          },
        });
      } else {
        onChange(DEFAULT_HERO);
      }
    },
    onError
  );
}

/** Creates or overwrites a single product document. */
export async function saveProductRemote(product: JewelryProduct) {
  await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
}

/** Persists several product updates at once (e.g. after deleting a category). */
export async function saveProductsRemote(products: JewelryProduct[]) {
  const batch = writeBatch(db);
  products.forEach((p) => batch.set(doc(db, PRODUCTS_COLLECTION, p.id), p));
  await batch.commit();
}

export async function deleteProductRemote(productId: string) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}

export async function saveCategoriesRemote(
  categories: string[],
  covers?: CategoryCovers
) {
  const payload: { list: string[]; covers?: CategoryCovers } = { list: categories };
  if (covers !== undefined) {
    const pruned: CategoryCovers = {};
    categories.forEach((name) => {
      if (covers[name]) pruned[name] = covers[name];
    });
    payload.covers = pruned;
  }
  await setDoc(categoriesDocRef, payload, { merge: true });
}

/** Update cover (photo or video data URL) for one category. */
export async function saveCategoryCoverRemote(
  categoryName: string,
  coverSrc: string | null,
  allCategories: string[],
  currentCovers: CategoryCovers
) {
  const next = { ...currentCovers };
  if (coverSrc) next[categoryName] = coverSrc;
  else delete next[categoryName];
  await saveCategoriesRemote(allCategories, next);
}

/** Overwrites the home hero settings (cover media + captions). */
export async function saveHeroSettingsRemote(settings: HeroSettings) {
  await setDoc(heroDocRef, settings, { merge: true });
}

export async function seedIfEmpty(
  initialProducts: JewelryProduct[],
  initialCategories: string[]
) {
  const existing = await getDocs(collection(db, PRODUCTS_COLLECTION));
  if (existing.empty) {
    const batch = writeBatch(db);
    initialProducts.forEach((p) =>
      batch.set(doc(db, PRODUCTS_COLLECTION, p.id), p)
    );
    batch.set(doc(db, 'meta', 'categories'), { list: initialCategories, covers: {} });
    await batch.commit();
  }
}
AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/services/catalogStore.ts"

echo "Готово. Теперь: git add -A && git commit -m \"restore hero settings API\" && git push"