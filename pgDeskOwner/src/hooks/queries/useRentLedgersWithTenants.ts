import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useSelectedPg } from '../../context/SelectedPgContext';
import { useTenantsByPg } from './useTenants';
import { rentLedgersService } from '../../api/services';
import type { RentLedger, RentStatus, Tenant } from '../../types';

const ledgerKey = 'rent-ledgers';

export type RentLedgerStatus = RentStatus;

export const useRentLedgersWithTenants = (status: RentLedgerStatus[]) => {
  const { selectedPg } = useSelectedPg();
  const pgId = selectedPg?.id;

  const {
    data: tenants,
    isLoading: tenantsLoading,
    error: tenantsError,
  } = useTenantsByPg(pgId);

  const statusQueries = useQueries({
    queries: status.map((s) => ({
      queryKey: [ledgerKey, 'status', s],
      queryFn: () => rentLedgersService.listByStatus(s),
      enabled: !!pgId,
    })),
  });

  const isLoading = tenantsLoading || statusQueries.some((q) => q.isLoading);
  const error = tenantsError || statusQueries.find((q) => q.error)?.error || null;

  const refetch = useMemo(
    () => () => {
      statusQueries.forEach((q) => q.refetch());
    },
    [statusQueries]
  );

  const data = useMemo<(RentLedger & { tenant?: Tenant })[] | undefined>(() => {
    if (!tenants) return undefined;
    if (statusQueries.some((q) => q.data === undefined)) return undefined;

    const tenantMap = new Map<string, Tenant>();
    tenants.forEach((t) => tenantMap.set(t.id, t));

    const ledgers: (RentLedger & { tenant?: Tenant })[] = [];
    statusQueries.forEach((q) => {
      q.data?.forEach((ledger) => {
        const tenant = tenantMap.get(ledger.tenantId);
        if (tenant) {
          ledgers.push({ ...ledger, tenant });
        }
      });
    });

    return ledgers;
  }, [tenants, statusQueries]);

  return { data, isLoading, error, refetch };
};
