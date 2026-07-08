import { useQuery } from '@tanstack/react-query';
import { rentLedgersService } from '../../api/services';

const key = 'rent-ledgers';

export const useRentLedgersByTenant = (tenantId?: string) => {
  return useQuery({
    queryKey: [key, 'tenant', tenantId],
    queryFn: () => rentLedgersService.listByTenant(tenantId!),
    enabled: !!tenantId,
  });
};
