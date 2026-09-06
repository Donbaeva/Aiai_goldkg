import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** Local preview without Firebase. Set VITE_USE_FIREBASE=true in .env.local to enable cloud. */
const wantFirebase = import.meta.env.VITE_USE_FIREBASE === 'true';

/** True only when explicitly enabled and a real-looking web API key is present. */
export const isFirebaseConfigured = Boolean(
  wantFirebase &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'MY_API_KEY' &&
    firebaseConfig.apiKey.length > 20 &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'my-project'
);

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  } catch (err) {
    console.error('Firebase init failed — running in local demo mode.', err);
    firebaseApp = null;
    db = null;
    auth = null;
  }
} else {
  console.warn(
    'Firebase keys missing. Create .env.local from .env.example to enable cloud catalog. Using local demo data.'
  );
}

export { firebaseApp, db, auth };
