import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { JewelryProduct } from '../types';

const PRODUCTS_COLLECTION = 'products';
const LOCAL_PRODUCTS_KEY = 'aiaigold_local_products';
const LOCAL_CATEGORIES_KEY = 'aiaigold_local_categories';
const LOCAL_COVERS_KEY = 'aiaigold_local_category_covers';

export type CategoryCovers = Record<string, string>;

export interface CategoryData {
  names: string[];
  covers: CategoryCovers;
}

function readLocalProducts(): JewelryProduct[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalProducts(products: JewelryProduct[]) {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

function readLocalCategories(): string[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocalCategories(categories: string[]) {
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
}

function readLocalCovers(): CategoryCovers {
  try {
    const raw = localStorage.getItem(LOCAL_COVERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalCovers(covers: CategoryCovers) {
  localStorage.setItem(LOCAL_COVERS_KEY, JSON.stringify(covers));
}

const localListeners = {
  products: new Set<(products: JewelryProduct[]) => void>(),
  categories: new Set<(data: CategoryData) => void>(),
};

function notifyLocalProducts() {
  const products = readLocalProducts() || [];
  localListeners.products.forEach((cb) => cb(products));
}

function notifyLocalCategories(fallback: string[]) {
  const data: CategoryData = {
    names: readLocalCategories() || fallback,
    covers: readLocalCovers(),
  };
  localListeners.categories.forEach((cb) => cb(data));
}

export function subscribeToProducts(
  onChange: (products: JewelryProduct[]) => void,
  onError?: (err: unknown) => void
) {
  if (!db || !isFirebaseConfigured) {
    const existing = readLocalProducts();
    onChange(existing || []);
    localListeners.products.add(onChange);
    return () => {
      localListeners.products.delete(onChange);
    };
  }

  return onSnapshot(
    collection(db, PRODUCTS_COLLECTION),
    (snapshot) => {
      const products = snapshot.docs.map((d) => d.data() as JewelryProduct);
      onChange(products);
    },
    onError
  );
}

export function subscribeToCategories(
  onChange: (data: CategoryData) => void,
  fallback: string[],
  onError?: (err: unknown) => void
) {
  if (!db || !isFirebaseConfigured) {
    onChange({
      names: readLocalCategories() || fallback,
      covers: readLocalCovers(),
    });
    localListeners.categories.add(onChange);
    return () => {
      localListeners.categories.delete(onChange);
    };
  }

  const categoriesDocRef = doc(db, 'meta', 'categories');
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

export async function saveProductRemote(product: JewelryProduct) {
  if (!db || !isFirebaseConfigured) {
    const products = readLocalProducts() || [];
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) products[idx] = product;
    else products.unshift(product);
    writeLocalProducts(products);
    notifyLocalProducts();
    return;
  }
  await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product);
}

export async function saveProductsRemote(products: JewelryProduct[]) {
  if (!db || !isFirebaseConfigured) {
    const existing = readLocalProducts() || [];
    const map = new Map(existing.map((p) => [p.id, p]));
    products.forEach((p) => map.set(p.id, p));
    writeLocalProducts([...map.values()]);
    notifyLocalProducts();
    return;
  }
  const batch = writeBatch(db);
  products.forEach((p) => batch.set(doc(db, PRODUCTS_COLLECTION, p.id), p));
  await batch.commit();
}

export async function deleteProductRemote(productId: string) {
  if (!db || !isFirebaseConfigured) {
    writeLocalProducts((readLocalProducts() || []).filter((p) => p.id !== productId));
    notifyLocalProducts();
    return;
  }
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}

export async function saveCategoriesRemote(
  categories: string[],
  covers?: CategoryCovers
) {
  if (!db || !isFirebaseConfigured) {
    writeLocalCategories(categories);
    const source = covers ?? readLocalCovers();
    const pruned: CategoryCovers = {};
    categories.forEach((name) => {
      if (source[name]) pruned[name] = source[name];
    });
    writeLocalCovers(pruned);
    notifyLocalCategories(categories);
    return;
  }

  const payload: { list: string[]; covers?: CategoryCovers } = { list: categories };
  if (covers !== undefined) {
    const pruned: CategoryCovers = {};
    categories.forEach((name) => {
      if (covers[name]) pruned[name] = covers[name];
    });
    payload.covers = pruned;
  }
  await setDoc(doc(db, 'meta', 'categories'), payload, { merge: true });
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

export async function seedIfEmpty(
  initialProducts: JewelryProduct[],
  initialCategories: string[]
) {
  if (!db || !isFirebaseConfigured) {
    if (!readLocalProducts()) {
      writeLocalProducts(initialProducts);
      notifyLocalProducts();
    }
    if (!readLocalCategories()) {
      writeLocalCategories(initialCategories);
      notifyLocalCategories(initialCategories);
    }
    return;
  }

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
