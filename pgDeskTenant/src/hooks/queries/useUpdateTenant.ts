import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsService } from '../../api/services';
import type { Tenant } from '../../types';

export const useUpdateTenant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Tenant> }) =>
      tenantsService.update(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['tenant', 'detail', variables.id] });
      qc.invalidateQueries({ queryKey: ['tenant', 'details', variables.id] });
    },
  });
};
