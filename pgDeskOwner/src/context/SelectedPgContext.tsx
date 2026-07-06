import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import type { Property } from '../types';

const BASE_STORAGE_KEY = '@pgdesk/selected-pg';

const getStorageKey = (userId?: string | null) =>
  userId ? `${BASE_STORAGE_KEY}:${userId}` : BASE_STORAGE_KEY;

interface SelectedPgContextValue {
  selectedPg: Property | null;
  selectedPgId: string | null;
  setSelectedPg: (pg: Property | null) => void;
  clearSelectedPg: () => Promise<void>;
  isLoading: boolean;
}

const SelectedPgContext = createContext<SelectedPgContextValue | undefined>(undefined);

export const SelectedPgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedPg, setSelectedPgState] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = getStorageKey(user?.id);

  // Load persisted selected PG for the current user
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (!isMounted) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Property;
          setSelectedPgState(parsed);
        } catch {
          setSelectedPgState(null);
        }
      } else {
        setSelectedPgState(null);
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  // Clear selection when the logged-in user changes or logs out
  useEffect(() => {
    if (!user) {
      setSelectedPgState(null);
    }
  }, [user?.id]);

  const setSelectedPg = useCallback(
    (pg: Property | null) => {
      setSelectedPgState(pg);
      if (pg) {
        AsyncStorage.setItem(storageKey, JSON.stringify(pg));
      } else {
        AsyncStorage.removeItem(storageKey);
      }
    },
    [storageKey]
  );

  const clearSelectedPg = useCallback(async () => {
    setSelectedPgState(null);
    await AsyncStorage.removeItem(storageKey);
    // Also clean up the legacy global key if it exists
    await AsyncStorage.removeItem(BASE_STORAGE_KEY);
  }, [storageKey]);

  return (
    <SelectedPgContext.Provider
      value={{
        selectedPg,
        selectedPgId: selectedPg?.id || null,
        setSelectedPg,
        clearSelectedPg,
        isLoading,
      }}
    >
      {children}
    </SelectedPgContext.Provider>
  );
};

export const useSelectedPg = () => {
  const ctx = useContext(SelectedPgContext);
  if (!ctx) throw new Error('useSelectedPg must be used within SelectedPgProvider');
  return ctx;
};
