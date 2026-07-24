import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelectedPg } from '../../context/SelectedPgContext';
import { useActiveTenantsByPg } from './useTenants';
import { rentLedgersService } from '../../api/services';
import type { RentLedger } from '../../types';

const ledgerKey = 'rent-ledgers';

const getDueDate = (year: number, month: string) => {
  const mm = month.padStart(2, '0');
  return `${year}-${mm}-05`;
};

export const useGenerateMonthlyDues = () => {
  const qc = useQueryClient();
  const { selectedPg } = useSelectedPg();
  const pgId = selectedPg?.id;
  const { data: tenants } = useActiveTenantsByPg(pgId);

  return useMutation({
    mutationFn: async ({ month, year }: { month: string; year: number }) => {
      if (!pgId) throw new Error('No property selected');
      if (!tenants || tenants.length === 0) throw new Error('No active tenants found');

      const existingLedgers = await rentLedgersService.listByPgMonthYear(pgId, month, year);
      const existingTenantIds = new Set(existingLedgers.map((l) => l.tenantId));

      const tenantsNeedingDues = tenants.filter((t) => !existingTenantIds.has(t.id));
      if (tenantsNeedingDues.length === 0) return [];

      const created = await Promise.all(
        tenantsNeedingDues.map((tenant) => {
          const payload: Omit<RentLedger, 'id' | 'createdAt' | 'updatedAt'> = {
            tenantId: tenant.id,
            rentMonth: month,
            rentYear: year,
            rentAmount: tenant.rentPerMonth || 0,
            dueDate: getDueDate(year, month),
            collectedAmount: 0,
            status: 'DUE',
            remarks: `Monthly rent for ${month}/${year}`,
          };
          return rentLedgersService.create(payload);
        })
      );

      return created;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: [ledgerKey] });
      qc.invalidateQueries({ queryKey: ['pending-dues'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
