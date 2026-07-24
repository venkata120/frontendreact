import { useQuery } from '@tanstack/react-query';
import { tenantsService, roomsService, bedsService } from '../../api/services';
import type { Tenant } from '../../types';

const key = 'tenants-with-rooms';

export const useTenantsWithRooms = (pgId?: string) => {
  return useQuery({
    queryKey: [key, pgId],
    queryFn: async () => {
      const tenants = await tenantsService.listByPg(pgId!);
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
      const bedToRoom = new Map<string, { roomNumber: string; floor: number }>();
      roomsWithBeds.forEach((room) => {
        room.beds?.forEach((bed) => {
          bedToRoom.set(bed.id, { roomNumber: room.roomNumber, floor: room.floor });
        });
      });
      return tenants.map((tenant) => ({
        ...tenant,
        roomNumber: bedToRoom.get(tenant.bedId)?.roomNumber,
        floor: bedToRoom.get(tenant.bedId)?.floor,
      })) as Tenant[];
    },
    enabled: !!pgId,
  });
};
