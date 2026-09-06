import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase';

const LOCAL_ADMIN_KEY = 'aiaigold_local_admin';
type LocalAuthListener = (user: User | null) => void;
const localAuthListeners = new Set<LocalAuthListener>();

function readLocalAdmin(): User | null {
  try {
    const email = localStorage.getItem(LOCAL_ADMIN_KEY);
    return email ? ({ uid: 'local-admin', email } as User) : null;
  } catch {
    return null;
  }
}

function notifyLocalAuth() {
  const user = readLocalAdmin();
  localAuthListeners.forEach((cb) => cb(user));
}

/** Fires immediately with the current admin (or null), then again on every
 * sign-in/sign-out — anywhere in the app. */
export function subscribeToAuthState(onChange: (user: User | null) => void) {
  if (!auth || !isFirebaseConfigured) {
    onChange(readLocalAdmin());
    localAuthListeners.add(onChange);
    return () => {
      localAuthListeners.delete(onChange);
    };
  }
  return onAuthStateChanged(auth, onChange);
}

export async function signInAdmin(email: string, password: string) {
  if (!auth || !isFirebaseConfigured) {
    if (!email.trim() || !password.trim()) {
      throw new Error('Введите email и пароль');
    }
    localStorage.setItem(LOCAL_ADMIN_KEY, email.trim());
    notifyLocalAuth();
    return;
  }
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
  if (!auth || !isFirebaseConfigured) {
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    notifyLocalAuth();
    return;
  }
  await signOut(auth);
}
