import { useQuery } from '@tanstack/react-query';
import { financeService } from '@/services/api';
import { normalizeRecords } from '../utils/normalize-records';

export interface RecordFilters {
  search?: string;
  categoryId?: string;
  personId?: string;
  tipo?: string;
  valorMin?: string;
  valorMax?: string;
  dataInicio?: string;
  dataFim?: string;
  ordenacao?: string;
}

export function useRecords(
  month: number,
  year: number,
  familyId?: string,
  status?: string,
  page: number = 1,
  limit: number = 10,
  filters?: RecordFilters,
) {
  const expenses = useQuery({
    queryKey: ['expenses', month, year, familyId, status, page, limit, filters],
    queryFn: () => financeService.getExpenses(month, year, familyId!, status, page, limit, filters),
    enabled: !!familyId,
  });

  const records = normalizeRecords(expenses.data?.data || [], [], []);
  const isLoading = expenses.isLoading;
  const pagination = expenses.data?.pagination;

  return { records, isLoading, pagination };
}
