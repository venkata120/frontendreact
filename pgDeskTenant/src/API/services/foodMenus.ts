import { apiClient } from '../client';
import type { BackendApiResponse, FoodMenu, FoodMenuItem, DailyMenu } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const foodMenusService = {
  listByProperty: (propertyId: string) =>
    apiClient.get<BackendApiResponse<FoodMenu[]>>(`/api/v1/food-menus/property/${propertyId}`).then(unwrap),
  getById: (menuId: string) => apiClient.get<BackendApiResponse<FoodMenu>>(`/api/v1/food-menus/${menuId}`).then(unwrap),
  getDaily: (propertyId: string, menuDate?: string) =>
    apiClient
      .get<BackendApiResponse<DailyMenu[]>>(`/api/v1/food-menus/daily`, {
        params: { propertyId, menuDate },
      })
      .then(unwrap),
};

export const foodMenuItemsService = {
  listByMenu: (menuId: string) =>
    apiClient.get<BackendApiResponse<FoodMenuItem[]>>(`/api/v1/food-menus/${menuId}/items`).then(unwrap),
};
