import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsService, bedsService } from '../../api/services';
import type { Room, Bed, BedStatus } from '../../types';

const roomsKey = 'rooms';
const bedsKey = 'beds';

export const useRoomsByPg = (pgId?: string) => {
  return useQuery({
    queryKey: [roomsKey, 'pg', pgId],
    queryFn: () => roomsService.listByPg(pgId!),
    enabled: !!pgId,
  });
};

export const useFloorsByPg = (pgId?: string) => {
  return useQuery({
    queryKey: [roomsKey, 'floors', pgId],
    queryFn: () => roomsService.listFloors(pgId!),
    enabled: !!pgId,
  });
};

export const useRoomsByFloor = (pgId?: string, floor?: number) => {
  return useQuery({
    queryKey: [roomsKey, 'pg', pgId, 'floor', floor],
    queryFn: () => roomsService.getByFloor(pgId!, floor!),
    enabled: !!pgId && floor !== undefined,
  });
};

export const useRoom = (id?: string) => {
  return useQuery({
    queryKey: [roomsKey, id],
    queryFn: () => roomsService.getById(id!),
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => roomsService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [roomsKey, 'pg', vars.pgId] });
      qc.invalidateQueries({ queryKey: [roomsKey, 'floors', vars.pgId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Room> }) => roomsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [roomsKey] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [roomsKey] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBedsByRoom = (roomId?: string) => {
  return useQuery({
    queryKey: [bedsKey, 'room', roomId],
    queryFn: () => bedsService.listByRoom(roomId!),
    enabled: !!roomId,
  });
};

export const useVacantBedsByRoom = (roomId?: string) => {
  return useQuery({
    queryKey: [bedsKey, 'room', roomId, 'vacant'],
    queryFn: () => bedsService.listVacantByRoom(roomId!),
    enabled: !!roomId,
  });
};

export const useCreateBed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Bed, 'id' | 'createdAt' | 'updatedAt'>) => bedsService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [bedsKey, 'room', vars.roomId] });
      // Beds are shown inside the room list, so refresh room queries as well
      qc.invalidateQueries({ queryKey: [roomsKey] });
    },
  });
};

export const useUpdateBedStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BedStatus }) => bedsService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [bedsKey] });
      qc.invalidateQueries({ queryKey: [roomsKey] });
    },
  });
};
