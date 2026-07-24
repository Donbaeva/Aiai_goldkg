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

/** Subscribes to live updates of the shared category list. */
export function subscribeToCategories(
  onChange: (categories: string[]) => void,
  fallback: string[],
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    categoriesDocRef,
    (snap) => {
      if (snap.exists() && Array.isArray(snap.data().list)) {
        onChange(snap.data().list as string[]);
      } else {
        onChange(fallback);
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

export async function saveCategoriesRemote(categories: string[]) {
  await setDoc(categoriesDocRef, { list: categories });
}

/** One-time setup: if the shop's Firestore is empty (first ever run),
 * seed it with the starter catalog so there's something to see. */
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
    batch.set(categoriesDocRef, { list: initialCategories });
    await batch.commit();
  }
}
