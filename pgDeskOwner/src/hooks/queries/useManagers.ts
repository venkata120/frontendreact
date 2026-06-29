import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, managerAssignmentsService } from '../../api/services';
import type { User, UserDTO, ManagerPgAssignment } from '../../types';

const managersKey = 'managers';
const assignmentsKey = 'manager-assignments';

export const useManagers = (ownerId?: string) => {
  return useQuery({
    queryKey: [managersKey, ownerId],
    queryFn: () => usersService.listManagers(ownerId!),
    enabled: !!ownerId,
  });
};

export const useCreateManager = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ownerId, payload }: { ownerId: string; payload: UserDTO }) =>
      usersService.createManager(ownerId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [managersKey] }),
  });
};

export const useManagerAssignmentsByPg = (pgId?: string) => {
  return useQuery({
    queryKey: [assignmentsKey, 'pg', pgId],
    queryFn: () => managerAssignmentsService.listByPg(pgId!),
    enabled: !!pgId,
  });
};

export const useAssignManager = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { managerId: string; pgId: string }) => managerAssignmentsService.assign(payload),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [assignmentsKey, 'pg', vars.pgId] }),
  });
};

export const useRemoveManager = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ managerId, pgId }: { managerId: string; pgId: string }) =>
      managerAssignmentsService.remove(managerId, pgId),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [assignmentsKey, 'pg', vars.pgId] }),
  });
};
