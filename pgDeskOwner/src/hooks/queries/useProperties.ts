import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesService } from '../../api/services';
import type { Property } from '../../types';

const key = 'properties';

export const useProperties = (ownerId?: string) => {
  return useQuery({
    queryKey: [key, 'list', ownerId],
    queryFn: () => propertiesService.listByOwner(ownerId!),
    enabled: !!ownerId,
  });
};

export const usePropertiesByManager = (managerId?: string) => {
  return useQuery({
    queryKey: [key, 'manager', managerId],
    queryFn: () => propertiesService.listByManager(managerId!),
    enabled: !!managerId,
  });
};

export const useProperty = (id?: string) => {
  return useQuery({
    queryKey: [key, id],
    queryFn: () => propertiesService.getById(id!),
    enabled: !!id,
  });
};

export const useCreateProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => propertiesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
};

export const useUpdateProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Property> }) => propertiesService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
};

export const useDeleteProperty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertiesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
};
