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
