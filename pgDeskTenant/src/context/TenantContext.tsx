import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthService } from '../services/auth';
import { tenantsService } from '../api/services';
import { DEFAULT_TENANT_ID } from '../constants';

interface TenantContextValue {
  tenantId: string | null;
  propertyId: string | null;
  setTenantId: (id: string) => Promise<void>;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenantId: null,
  propertyId: null,
  setTenantId: async () => {},
  isLoading: true,
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await AuthService.getSelectedTenantId();
      const initialId = stored || DEFAULT_TENANT_ID || null;
      if (mounted) {
        setTenantIdState(initialId);
        setInitialLoadDone(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const { data: tenant, isLoading: isTenantLoading } = useQuery({
    queryKey: ['tenant-context', tenantId],
    queryFn: () => tenantsService.getById(tenantId!),
    enabled: !!tenantId && initialLoadDone,
  });

  const setTenantId = async (id: string) => {
    await AuthService.setSelectedTenantId(id);
    setTenantIdState(id);
  };

  const value: TenantContextValue = {
    tenantId,
    propertyId: tenant?.pgId || null,
    setTenantId,
    isLoading: !initialLoadDone || isTenantLoading,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => useContext(TenantContext);
