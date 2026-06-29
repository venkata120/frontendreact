import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rentLedgersService } from '../../api/services';
import type { RentLedger, Tenant } from '../../types';

const ledgerKey = 'rent-ledgers';

const getDueDate = (year: number, month: string) => {
  const mm = month.padStart(2, '0');
  return `${year}-${mm}-05`;
};

export const useRecordCollectedPayment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tenant,
      month,
      year,
      amount,
      mode,
    }: {
      tenant: Tenant;
      month: string;
      year: number;
      amount: number;
      mode: string;
    }) => {
      const tenantLedgers = await rentLedgersService.listByTenant(tenant.id);
      const existing = tenantLedgers.find((l) => l.rentMonth === month && l.rentYear === year);

      if (existing) {
        const newCollected = (existing.collectedAmount || 0) + amount;
        const status = newCollected >= existing.rentAmount ? 'PAID' : newCollected > 0 ? 'PARTIAL' : 'DUE';
        const { tenant: _, ...payload } = existing as RentLedger & { tenant?: Tenant };
        return rentLedgersService.update(existing.id, {
          ...payload,
          collectedAmount: newCollected,
          status,
          remarks: [payload.remarks, `Payment via ${mode}`].filter(Boolean).join(' | '),
        });
      }

      const rentAmount = tenant.rentPerMonth || amount;
      const status = amount >= rentAmount ? 'PAID' : amount > 0 ? 'PARTIAL' : 'DUE';
      const payload: Omit<RentLedger, 'id' | 'createdAt' | 'updatedAt'> = {
        tenantId: tenant.id,
        rentMonth: month,
        rentYear: year,
        rentAmount,
        dueDate: getDueDate(year, month),
        collectedAmount: amount,
        status,
        remarks: `Payment via ${mode}`,
      };
      return rentLedgersService.create(payload);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [ledgerKey] });
      qc.invalidateQueries({ queryKey: ['pending-dues'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
