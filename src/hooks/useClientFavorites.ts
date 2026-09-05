import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'aiaigold_client_favorites';

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore write failures (e.g. private browsing)
  }
}

/** Lets customers (no login required) mark items they're interested in,
 * so they can send a single order request for everything at once. */
export function useClientFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readStored());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setFavoriteIds(readStored());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isFavorited = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeStored(next);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
    writeStored([]);
  }, []);

  return { favoriteIds, isFavorited, toggleFavorite, clearFavorites };
}

