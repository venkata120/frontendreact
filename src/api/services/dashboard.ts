import { apiClient } from '../client';
import type { BackendApiResponse, DashboardResponse, FinancialSummary, PgOccupancy, PgRentLedgerMonthSummary, RecentActivityItem } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const dashboardService = {
  overview: (params: { month: string; year: string; ownerId?: string; userId?: string; managerId?: string }) =>
    apiClient
      .get<BackendApiResponse<DashboardResponse>>('/api/v1/dashboard/overview', { params })
      .then(unwrap),
  financial: (params: { month: string; year: string; ownerId?: string; userId?: string; managerId?: string }) =>
    apiClient
      .get<BackendApiResponse<FinancialSummary>>('/api/v1/dashboard/financial', { params })
      .then(unwrap),
  occupancy: (params: { ownerId?: string; userId?: string; managerId?: string }) =>
    apiClient.get<BackendApiResponse<PgOccupancy[]>>('/api/v1/dashboard/occupancy', { params }).then(unwrap),
  ledgerSummary: (months: number, params: { ownerId?: string; userId?: string; managerId?: string }) =>
    apiClient
      .get<BackendApiResponse<PgRentLedgerMonthSummary[]>>(`/api/v1/dashboard/ledger-summary/recent/${months}`, { params })
      .then(unwrap),
  recentActivities: (params: { month: string; year: string; limit?: number; ownerId?: string; userId?: string; managerId?: string }) =>
    apiClient
      .get<BackendApiResponse<RecentActivityItem[]>>('/api/v1/dashboard/recent-activities', { params })
      .then(unwrap),
};
