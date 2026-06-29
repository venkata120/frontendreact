import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService, expenseMastersService } from '../../api/services';
import type { Expense } from '../../types';

const key = 'expenses';
const masterKey = 'expense-masters';

export const useExpensesByPg = (pgId?: string) => {
  return useQuery({
    queryKey: [key, 'pg', pgId],
    queryFn: () => expensesService.listByPg(pgId!),
    enabled: !!pgId,
  });
};

export const useExpensesByPgMonthYear = (pgId?: string, month?: string, year?: number) => {
  return useQuery({
    queryKey: [key, 'pg', pgId, 'month', month, 'year', year],
    queryFn: () => expensesService.listByPgMonthYear(pgId!, month!, year!),
    enabled: !!pgId && !!month && year !== undefined,
  });
};

export const useExpense = (id?: string) => {
  return useQuery({
    queryKey: [key, id],
    queryFn: () => expensesService.getById(id!),
    enabled: !!id,
  });
};

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => expensesService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [key, 'pg', vars.pgPropertyId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Expense> }) => expensesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useExpenseMasters = () => {
  return useQuery({
    queryKey: [masterKey, 'list'],
    queryFn: () => expenseMastersService.list(),
  });
};
