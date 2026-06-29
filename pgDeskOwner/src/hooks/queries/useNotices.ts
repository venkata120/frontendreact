import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticesService } from '../../api/services';
import type { NoticeBoard, NoticeBoardSearchRequest, CreateNoticePayload } from '../../types';

const key = 'notices';

export const useNotices = (payload?: NoticeBoardSearchRequest) => {
  return useQuery({
    queryKey: [key, 'search', payload],
    queryFn: () => noticesService.search(payload || {}),
    enabled: !!payload,
  });
};

export const useNotice = (id?: number) => {
  return useQuery({
    queryKey: [key, id],
    queryFn: () => noticesService.getById(id!),
    enabled: !!id,
  });
};

export const useCreateNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNoticePayload) => noticesService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [key, 'search'] });
    },
  });
};

export const useUpdateNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateNoticePayload> }) =>
      noticesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
    },
  });
};

export const useArchiveNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => noticesService.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
    },
  });
};
