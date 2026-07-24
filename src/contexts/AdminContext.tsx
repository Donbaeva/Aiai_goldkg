import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuthState } from '../services/authService';

interface AdminContextValue {
  isAdmin: boolean;
  adminEmail: string | null;
  authReady: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  adminEmail: null,
  authReady: false,
});

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin: !!user, adminEmail: user?.email ?? null, authReady }}>
      {children}
    </AdminContext.Provider>
  );
};

/** Read admin status from anywhere: `const { isAdmin } = useAdmin();` */
export function useAdmin() {
  return useContext(AdminContext);
}
