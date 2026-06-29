import { apiClient } from '../client';
import type { BackendApiResponse, FoodMenu, FoodMenuItem, DailyMenu } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const foodMenusService = {
  listByProperty: (propertyId: string) =>
    apiClient
      .get<BackendApiResponse<FoodMenu[]>>(`/api/v1/food-menus/property/${propertyId}`)
      .then(unwrap),
  getById: (menuId: string) =>
    apiClient.get<BackendApiResponse<FoodMenu>>(`/api/v1/food-menus/${menuId}`).then(unwrap),
  create: (payload: FoodMenu) =>
    apiClient.post<BackendApiResponse<FoodMenu>>('/api/v1/food-menus', payload).then(unwrap),
  update: (menuId: string, payload: FoodMenu) =>
    apiClient
      .put<BackendApiResponse<FoodMenu>>(`/api/v1/food-menus/${menuId}`, payload)
      .then(unwrap),
  delete: (menuId: string) => apiClient.delete(`/api/v1/food-menus/${menuId}`),
  getDaily: (propertyId: string, menuDate?: string) =>
    apiClient
      .get<BackendApiResponse<DailyMenu[]>>(`/api/v1/food-menus/daily`, {
        params: { propertyId, menuDate },
      })
      .then(unwrap),
};

export const foodMenuItemsService = {
  listByMenu: (menuId: string) =>
    apiClient
      .get<BackendApiResponse<FoodMenuItem[]>>(`/api/v1/food-menus/${menuId}/items`)
      .then(unwrap),
  add: (menuId: string, payload: Omit<FoodMenuItem, 'id'>) =>
    apiClient
      .post<BackendApiResponse<FoodMenuItem>>(`/api/v1/food-menus/${menuId}/items`, payload)
      .then(unwrap),
  update: (menuId: string, itemId: string, payload: Omit<FoodMenuItem, 'id'>) =>
    apiClient
      .put<BackendApiResponse<FoodMenuItem>>(
        `/api/v1/food-menus/${menuId}/items/${itemId}`,
        payload
      )
      .then(unwrap),
  delete: (menuId: string, itemId: string) =>
    apiClient.delete(`/api/v1/food-menus/${menuId}/items/${itemId}`),
};
