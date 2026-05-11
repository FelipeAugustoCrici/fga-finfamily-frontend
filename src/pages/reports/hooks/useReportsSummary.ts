import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';

export function useReportsSummary(months: number) {
  return useQuery({
    queryKey: ['reports-summary', months],
    queryFn: () => reportsService.getSummaryForPeriod(months),
    staleTime: 1000 * 60 * 5,
  });
}
