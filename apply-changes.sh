#!/usr/bin/env bash
set -e
echo "Обновляю файлы..."

mkdir -p src
cat > src/firebase.ts << 'AIAI_CLAUDE_EOF_MARKER'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// These values come from your Firebase project settings.
// They live in .env.local (never committed to git) — see .env.example.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/firebase.ts"

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

export type CategoryCovers = Record<string, string>;

export interface CategoryData {
  names: string[];
  covers: CategoryCovers;
}

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

cat > src/services/authService.ts << 'AIAI_CLAUDE_EOF_MARKER'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';

/** Fires immediately with the current admin (or null), then again on every
 * sign-in/sign-out — anywhere in the app. */
export function subscribeToAuthState(onChange: (user: User | null) => void) {
  return onAuthStateChanged(auth, onChange);
}

export async function signInAdmin(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
  await signOut(auth);
}
AIAI_CLAUDE_EOF_MARKER
echo "  ok: src/services/authService.ts"

echo "Готово. Теперь: git add -A && git commit -m \"always save to Firebase\" && git push"