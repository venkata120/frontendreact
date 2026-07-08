import { useQuery } from '@tanstack/react-query';
import { tenantsService } from '../../api/services';

const key = 'tenant';

export const useTenant = (tenantId?: string) => {
  return useQuery({
    queryKey: [key, 'detail', tenantId],
    queryFn: () => tenantsService.getById(tenantId!),
    enabled: !!tenantId,
  });
};

export const useTenantDetails = (tenantId?: string) => {
  return useQuery({
    queryKey: [key, 'details', tenantId],
    queryFn: () => tenantsService.getDetails(tenantId!),
    enabled: !!tenantId,
  });
};
