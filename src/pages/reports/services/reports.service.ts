import { api } from '@/services/api.service';
import type { SummaryData } from '../types/reports.types';

export const reportsService = {
  getSummary: async (month: number, year: number): Promise<SummaryData | null> => {
    try {
      const { data } = await api.get(`/finance/summary?month=${month}&year=${year}`);
      return data;
    } catch (error) {
      console.error(`Erro ao buscar resumo para ${month}/${year}:`, error);
      return null;
    }
  },

  getSummaryForPeriod: async (months: number): Promise<(SummaryData | null)[]> => {
    const now = new Date();
    const promises: Promise<SummaryData | null>[] = [];

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      promises.push(reportsService.getSummary(month, year));
    }

    const results = await Promise.all(promises);
    return results.reverse();
  },
};
