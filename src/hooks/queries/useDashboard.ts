import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../api/services';

const key = 'dashboard';

export const useDashboardOverview = (params: { month: string; year: string; ownerId?: string; userId?: string; managerId?: string }) => {
  return useQuery({
    queryKey: [key, 'overview', params],
    queryFn: () => dashboardService.overview(params),
    enabled: !!params.userId || !!params.ownerId || !!params.managerId,
  });
};

export const useDashboardFinancial = (params: { month: string; year: string; ownerId?: string; userId?: string; managerId?: string }) => {
  return useQuery({
    queryKey: [key, 'financial', params],
    queryFn: () => dashboardService.financial(params),
    enabled: !!params.userId || !!params.ownerId || !!params.managerId,
  });
};

export const useDashboardOccupancy = (ownerId?: string, userId?: string, managerId?: string) => {
  return useQuery({
    queryKey: [key, 'occupancy', ownerId, userId, managerId],
    queryFn: () => dashboardService.occupancy({ ownerId, userId, managerId }),
    enabled: !!ownerId || !!userId || !!managerId,
  });
};

export const useDashboardLedgerSummary = (months: number, ownerId?: string, userId?: string, managerId?: string) => {
  return useQuery({
    queryKey: [key, 'ledger-summary', months, ownerId, userId, managerId],
    queryFn: () => dashboardService.ledgerSummary(months, { ownerId, userId, managerId }),
    enabled: !!ownerId || !!userId || !!managerId,
  });
};

export const useDashboardRecentActivities = (params: { month: string; year: string; limit?: number; ownerId?: string; userId?: string; managerId?: string }) => {
  return useQuery({
    queryKey: [key, 'recent-activities', params],
    queryFn: () => dashboardService.recentActivities(params),
    enabled: !!params.ownerId || !!params.userId || !!params.managerId,
  });
};
