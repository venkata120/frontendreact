import { useQuery } from '@tanstack/react-query';
import { foodMenusService } from '../../api/services';

const key = 'food-menus';

export const useDailyFoodMenu = (propertyId?: string, menuDate?: string) => {
  return useQuery({
    queryKey: [key, 'daily', propertyId, menuDate],
    queryFn: () => foodMenusService.getDaily(propertyId!, menuDate),
    enabled: !!propertyId,
  });
};

export const useFoodMenusByProperty = (propertyId?: string) => {
  return useQuery({
    queryKey: [key, 'property', propertyId],
    queryFn: () => foodMenusService.listByProperty(propertyId!),
    enabled: !!propertyId,
  });
};
