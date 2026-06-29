import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Property } from '../types';

const STORAGE_KEY = '@pgdesk/selected-pg-id';

interface SelectedPgContextValue {
  selectedPg: Property | null;
  selectedPgId: string | null;
  setSelectedPg: (pg: Property | null) => void;
  isLoading: boolean;
}

const SelectedPgContext = createContext<SelectedPgContextValue | undefined>(undefined);

export const SelectedPgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPg, setSelectedPgState] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((id) => {
      if (id) {
        // Full property will be resolved by the consumer via useProperties
        setSelectedPgState({ id, name: '', address: '', city: '', ownerId: '', pgType: 'MEN' } as Property);
      }
      setIsLoading(false);
    });
  }, []);

  const setSelectedPg = useCallback((pg: Property | null) => {
    setSelectedPgState(pg);
    if (pg?.id) {
      AsyncStorage.setItem(STORAGE_KEY, pg.id);
    } else {
      AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <SelectedPgContext.Provider
      value={{ selectedPg, selectedPgId: selectedPg?.id || null, setSelectedPg, isLoading }}
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
