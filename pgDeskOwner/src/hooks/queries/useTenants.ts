import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsService } from '../../api/services';
import type { Tenant } from '../../types';

const key = 'tenants';

export const useTenantsByPg = (pgId?: string) => {
  return useQuery({
    queryKey: [key, 'pg', pgId],
    queryFn: () => tenantsService.listByPg(pgId!),
    enabled: !!pgId,
  });
};

export const useActiveTenantsByPg = (pgId?: string) => {
  return useQuery({
    queryKey: [key, 'pg', pgId, 'active'],
    queryFn: () => tenantsService.listActiveByPg(pgId!),
    enabled: !!pgId,
  });
};

export const useTenant = (id?: string) => {
  return useQuery({
    queryKey: [key, id],
    queryFn: () => tenantsService.getDetails(id!),
    enabled: !!id,
  });
};

export const useCreateTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) => tenantsService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [key, 'pg', vars.pgId] });
      // Tenant counts in the dashboard/top cards come from the dashboard overview query
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      qc.invalidateQueries({ queryKey: ['beds'] });
    },
  });
};

export const useUpdateTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Tenant> }) => tenantsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tenantsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      qc.invalidateQueries({ queryKey: ['beds'] });
    },
  });
};
