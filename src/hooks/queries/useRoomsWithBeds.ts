import { useQuery } from '@tanstack/react-query';
import { roomsService, bedsService } from '../../api/services';
import type { Room } from '../../types';

const roomsKey = 'rooms';

export const useRoomsWithBeds = (pgId?: string) => {
  return useQuery({
    queryKey: [roomsKey, 'pg', pgId, 'with-beds'],
    queryFn: async () => {
      const rooms = await roomsService.listByPg(pgId!);
      const roomsWithBeds = await Promise.all(
        rooms.map(async (room) => {
          try {
            const beds = await bedsService.listByRoom(room.id);
            return { ...room, beds };
          } catch {
            return { ...room, beds: [] };
          }
        })
      );
      return roomsWithBeds as Room[];
    },
    enabled: !!pgId,
  });
};
