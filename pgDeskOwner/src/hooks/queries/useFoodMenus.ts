import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foodMenusService, foodMenuItemsService } from '../../api/services';
import type { FoodMenu, FoodMenuItem } from '../../types';

export const FOOD_MENUS_QUERY_KEY = 'food-menus';

export function useFoodMenusByProperty(propertyId?: string | null) {
  return useQuery({
    queryKey: [FOOD_MENUS_QUERY_KEY, 'property', propertyId],
    queryFn: () => foodMenusService.listByProperty(propertyId!),
    enabled: !!propertyId,
    staleTime: 0,
  });
}

export function useCreateFoodMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: foodMenusService.create,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [FOOD_MENUS_QUERY_KEY, 'property', variables.propertyId] });
    },
  });
}

export function useUpdateFoodMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, payload }: { menuId: string; payload: FoodMenu }) =>
      foodMenusService.update(menuId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [FOOD_MENUS_QUERY_KEY, 'property', variables.payload.propertyId] });
    },
  });
}

export function useDeleteFoodMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, propertyId }: { menuId: string; propertyId: string }) =>
      foodMenusService.delete(menuId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [FOOD_MENUS_QUERY_KEY, 'property', variables.propertyId] });
    },
  });
}

export function useFoodMenuItems(menuId?: string | null) {
  return useQuery({
    queryKey: [FOOD_MENUS_QUERY_KEY, menuId, 'items'],
    queryFn: () => foodMenuItemsService.listByMenu(menuId!),
    enabled: !!menuId,
  });
}

export function useAddFoodMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, payload }: { menuId: string; payload: Omit<FoodMenuItem, 'id'> }) =>
      foodMenuItemsService.add(menuId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [FOOD_MENUS_QUERY_KEY, variables.menuId, 'items'] });
    },
  });
}

export function useUpdateFoodMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      menuId,
      itemId,
      payload,
    }: {
      menuId: string;
      itemId: string;
      payload: Omit<FoodMenuItem, 'id'>;
    }) => foodMenuItemsService.update(menuId, itemId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [FOOD_MENUS_QUERY_KEY, variables.menuId, 'items'] });
    },
  });
}

export function useDeleteFoodMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, itemId }: { menuId: string; itemId: string }) =>
      foodMenuItemsService.delete(menuId, itemId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [FOOD_MENUS_QUERY_KEY, variables.menuId, 'items'] });
    },
  });
}
