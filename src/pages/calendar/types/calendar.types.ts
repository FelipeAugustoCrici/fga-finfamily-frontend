import type { RecordKind, RecordStatus, RecordOrigin } from '@/pages/records/types/record.types';

export interface CalendarFinancialEvent {
  id: string;
  description: string;
  date: string;
  amount: number;
  type: RecordKind;
  status?: RecordStatus;
  category?: { id: string; name: string } | null;
  categoryName?: string;
  personId?: string;
  isRecurring?: boolean;
  sourceType: RecordOrigin;
}

export interface CalendarDaySummary {
  date: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingCount: number;
  paidCount: number;
  eventCount: number;
  events: CalendarFinancialEvent[];
}

export interface MonthlyCalendarSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalPaid: number;
  totalPending: number;
  projectedBalance: number;
  overdueCount: number;
  recurringCount: number;
}

export type CalendarFilter = {
  type?: 'all' | 'income' | 'expense';
  status?: 'all' | 'PAID' | 'PENDING' | 'OVERDUE';
  categoryId?: string;
  personId?: string;
};
