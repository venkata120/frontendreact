import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentLedgersService } from '../../api/services';
import type { RentLedger } from '../../types';

const key = 'rent-ledgers';

export const useRentLedgersByTenant = (tenantId?: string) => {
  return useQuery({
    queryKey: [key, 'tenant', tenantId],
    queryFn: () => rentLedgersService.listByTenant(tenantId!),
    enabled: !!tenantId,
  });
};

export const useRentLedgersByStatus = (status: string) => {
  return useQuery({
    queryKey: [key, 'status', status],
    queryFn: () => rentLedgersService.listByStatus(status),
  });
};

export const useRentLedgersByPgMonthYear = (pgId?: string, month?: string, year?: number) => {
  return useQuery({
    queryKey: [key, 'pg', pgId, month, year],
    queryFn: () => rentLedgersService.listByPgMonthYear(pgId!, month!, year!),
    enabled: !!pgId && !!month && year !== undefined,
  });
};

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ledger, amount }: { ledger: RentLedger; amount: number }) =>
      rentLedgersService.recordPayment(ledger, amount),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [key] });
      qc.invalidateQueries({ queryKey: ['pending-dues'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useCreateRentLedger = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<RentLedger, 'id' | 'createdAt' | 'updatedAt'>) => rentLedgersService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      qc.invalidateQueries({ queryKey: ['pending-dues'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
