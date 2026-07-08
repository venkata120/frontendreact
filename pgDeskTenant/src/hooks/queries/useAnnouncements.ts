import { useQuery } from '@tanstack/react-query';
import { announcementsService } from '../../api/services';

const key = 'announcements';

export const useAnnouncementsByPg = (pgId?: string) => {
  return useQuery({
    queryKey: [key, 'pg', pgId],
    queryFn: () => announcementsService.listByPg(pgId!),
    enabled: !!pgId,
  });
};
