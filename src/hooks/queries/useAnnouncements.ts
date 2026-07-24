import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsService } from '../../api/services';
import type { Announcement } from '../../types';

const key = 'announcements';

export const useAnnouncementsByPg = (pgId?: string) => {
  return useQuery({
    queryKey: [key, 'pg', pgId],
    queryFn: () => announcementsService.listByPg(pgId!),
    enabled: !!pgId,
  });
};

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => announcementsService.create(payload),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: [key, 'pg', vars.pgId] }),
  });
};

export const useUpdateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Announcement> }) =>
      announcementsService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
};

export const useDeleteAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
};

export const useSendAnnouncementToAll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsService.sendToAll(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
};
