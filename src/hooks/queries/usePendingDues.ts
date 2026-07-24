import { useQuery } from '@tanstack/react-query';
import { rentLedgersService } from '../../api/services';

const key = 'pending-dues';

export const usePendingDues = () => {
  return useQuery({
    queryKey: [key],
    queryFn: () => rentLedgersService.listByStatusWithTenants('DUE'),
  });
};
