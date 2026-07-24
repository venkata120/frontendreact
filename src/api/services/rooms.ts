import { apiClient } from '../client';
import type { BackendApiResponse, Room, FloorRoomsResponse } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const roomsService = {
  listByPg: (pgId: string) => apiClient.get<BackendApiResponse<Room[]>>(`/api/v1/rooms/pg/${pgId}`).then(unwrap),
  listFloors: async (pgId: string) => {
    const rooms = await apiClient.get<BackendApiResponse<Room[]>>(`/api/v1/rooms/pg/${pgId}`).then(unwrap);
    const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);
    return floors;
  },
  getByFloor: async (pgId: string, floor: number): Promise<FloorRoomsResponse> => {
    const all = await apiClient.get<BackendApiResponse<Room[]>>(`/api/v1/rooms/pg/${pgId}`).then(unwrap);
    const property = await apiClient.get<BackendApiResponse<any>>(`/api/v1/pg-properties/${pgId}`).then(unwrap);
    return {
      pgProperty: property,
      floor,
      rooms: all.filter((r) => r.floor === floor),
    };
  },
  getById: (id: string) => apiClient.get<BackendApiResponse<Room>>(`/api/v1/rooms/${id}`).then(unwrap),
  create: (payload: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<Room>>('/api/v1/rooms', payload).then(unwrap),
  update: (id: string, payload: Partial<Room>) =>
    apiClient.put<BackendApiResponse<Room>>(`/api/v1/rooms/${id}`, payload).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/rooms/${id}`),
  listWithBeds: (pgId: string) => apiClient.get<BackendApiResponse<Room[]>>(`/api/v1/rooms/pg/${pgId}/with-beds`).then(unwrap),
};
