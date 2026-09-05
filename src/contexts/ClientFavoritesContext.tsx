import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

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

interface ClientFavoritesValue {
  favoriteIds: string[];
  isFavorited: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
}

const ClientFavoritesContext = createContext<ClientFavoritesValue>({
  favoriteIds: [],
  isFavorited: () => false,
  toggleFavorite: () => {},
  clearFavorites: () => {},
});

/** Lets customers (no login required) mark items they're interested in,
 * so they can send a single order request for everything at once.
 * A single shared instance (via context) so the heart button on a card,
 * the heart on the detail page, and the floating order bar all agree. */
export const ClientFavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <ClientFavoritesContext.Provider value={{ favoriteIds, isFavorited, toggleFavorite, clearFavorites }}>
      {children}
    </ClientFavoritesContext.Provider>
  );
};

export function useClientFavorites() {
  return useContext(ClientFavoritesContext);
}

