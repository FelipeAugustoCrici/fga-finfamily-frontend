import { useQueries } from '@tanstack/react-query';
import { financeService } from '@/services/api';

export interface HistoryEntry {
  description: string;
  values: number[];
  lastValue: number;
  avgValue: number;
  category: string;
  categoryId: string;
  type: 'expense' | 'salary' | 'income';
  count: number;
  lastDate: string;
  isRecurring: boolean;
}

function buildIndex(expenses: any[]): Record<string, HistoryEntry> {
  const map: Record<string, HistoryEntry> = {};

  for (const exp of expenses) {
    const key = exp.description?.toLowerCase().trim();
    if (!key) continue;

    if (!map[key]) {
      map[key] = {
        description: exp.description,
        values: [],
        lastValue: 0,
        avgValue: 0,
        category: exp.category?.name || exp.categoryName || '',
        categoryId: exp.categoryId || exp.category?.id || '',
        type: exp.recordType || 'expense',
        count: 0,
        lastDate: exp.date || '',
        isRecurring: !!exp.recurringId,
      };
    }

    const entry = map[key];
    entry.values.push(exp.value);
    entry.count++;
    if (!entry.lastDate || exp.date > entry.lastDate) {
      entry.lastDate = exp.date;
      entry.lastValue = exp.value;
    }
    if (!entry.category && (exp.category?.name || exp.categoryName)) {
      entry.category = exp.category?.name || exp.categoryName;
      entry.categoryId = exp.categoryId || exp.category?.id || '';
    }
    if (exp.recurringId) entry.isRecurring = true;
  }

  for (const entry of Object.values(map)) {
    entry.avgValue = entry.values.reduce((a, b) => a + b, 0) / entry.values.length;
  }

  return map;
}

export function useRecordHistory(familyId?: string) {
  const now = new Date();
  const months = [
    { month: now.getMonth() + 1, year: now.getFullYear() },
    {
      month: now.getMonth() === 0 ? 12 : now.getMonth(),
      year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
    },
    {
      month: now.getMonth() === 0 ? 11 : now.getMonth() === 1 ? 12 : now.getMonth() - 1,
      year: now.getMonth() <= 1 ? now.getFullYear() - 1 : now.getFullYear(),
    },
  ];

  const queries = useQueries({
    queries: months.map(({ month, year }) => ({
      queryKey: ['expenses-history', month, year, familyId],
      queryFn: () => financeService.getExpenses(month, year, familyId!, undefined, 1, 100),
      enabled: !!familyId,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const allExpenses = queries.flatMap((q) => q.data?.data || []);
  const index = buildIndex(allExpenses);
  const isLoading = queries.some((q) => q.isLoading);

  return { index, isLoading };
}
