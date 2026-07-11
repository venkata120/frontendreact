import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticesService } from '../../api/services';
import type { NoticeBoardSearchRequest } from '../../types';

const key = 'notices';

export const useNotices = (payload?: NoticeBoardSearchRequest) => {
  return useQuery({
    queryKey: [key, 'search', payload],
    queryFn: () => noticesService.search(payload || {}),
    enabled: !!payload?.propertyId,
  });
};

export const useArchiveNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => noticesService.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key, 'search'] });
    },
  });
};
