import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../../api/services';
import type { Staff, StaffImageFile, StaffRequest } from '../../types';

const key = 'staff';

export const useStaffByProperty = (propertyId?: string) => {
  return useQuery({
    queryKey: [key, propertyId],
    queryFn: () => staffService.listByProperty(propertyId!),
    enabled: !!propertyId,
  });
};

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      staff,
      profilePhoto,
    }: {
      propertyId: string;
      staff: StaffRequest;
      profilePhoto?: StaffImageFile;
    }) => staffService.create(propertyId, staff, profilePhoto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [key, vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      staffId,
      staff,
      profilePhoto,
    }: {
      propertyId: string;
      staffId: string;
      staff: Partial<StaffRequest>;
      profilePhoto?: StaffImageFile;
    }) => staffService.update(propertyId, staffId, staff, profilePhoto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [key, vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, staffId }: { propertyId: string; staffId: string }) =>
      staffService.delete(propertyId, staffId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [key, vars.propertyId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
