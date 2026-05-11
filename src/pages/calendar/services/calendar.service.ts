import { api } from '@/services/api.service';
import type {
  CalendarDaySummary,
  CalendarFinancialEvent,
  MonthlyCalendarSummary,
  CalendarFilter,
} from '../types/calendar.types';

function toDateKey(record: any): string {
  const m = String(record.month).padStart(2, '0');
  const y = String(record.year);
  const day = String(record.date).substring(8, 10);
  return `${y}-${m}-${day}`;
}

function applyFilter(event: CalendarFinancialEvent, filter?: CalendarFilter): boolean {
  if (filter?.type && filter.type !== 'all' && event.type !== filter.type) return false;
  if (filter?.status && filter.status !== 'all' && event.status !== filter.status) return false;
  if (filter?.categoryId && event.category?.id !== filter.categoryId) return false;
  if (filter?.personId && event.personId !== filter.personId) return false;
  return true;
}

function rawToEvent(r: any): CalendarFinancialEvent {
  return {
    id: r.id,
    description: r.description,
    date: r.date,
    amount: r.value,
    type: r.type,
    status: r.status,
    category: r.category,
    categoryName: r.categoryName ?? r.category?.name,
    personId: r.personId,
    isRecurring: r.isRecurring,
    sourceType: r.sourceType,
  };
}

export const calendarService = {
  async getMonthEvents(
    month: number,
    year: number,
    familyId: string,
    filter?: CalendarFilter,
  ): Promise<{ days: CalendarDaySummary[]; summary: MonthlyCalendarSummary }> {
    const { data } = await api.get(
      `/finance/calendar?month=${month}&year=${year}&familyId=${familyId}`,
    );

    const allRaw: any[] = [
      ...(data.expenses ?? []),
      ...(data.incomes ?? []),
      ...(data.extras ?? []),
    ];

    const allEvents = allRaw.map(rawToEvent);

    const dayMap = new Map<string, CalendarFinancialEvent[]>();
    for (let i = 0; i < allRaw.length; i++) {
      const event = allEvents[i];
      if (!applyFilter(event, filter)) continue;
      const key = toDateKey(allRaw[i]);
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key)!.push(event);
    }

    const days: CalendarDaySummary[] = Array.from(dayMap.entries()).map(([date, events]) => {
      const totalIncome = events
        .filter((e) => e.type === 'income')
        .reduce((s, e) => s + e.amount, 0);
      const totalExpense = events
        .filter((e) => e.type === 'expense')
        .reduce((s, e) => s + e.amount, 0);
      return {
        date,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        pendingCount: events.filter((e) => e.status === 'PENDING').length,
        paidCount: events.filter((e) => e.status === 'PAID').length,
        eventCount: events.length,
        events,
      };
    });

    const totalIncome = allEvents
      .filter((e) => e.type === 'income')
      .reduce((s, e) => s + e.amount, 0);
    const totalExpense = allEvents
      .filter((e) => e.type === 'expense')
      .reduce((s, e) => s + e.amount, 0);

    const summary: MonthlyCalendarSummary = {
      month,
      year,
      totalIncome,
      totalExpense,
      totalPaid: allEvents.filter((e) => e.status === 'PAID').reduce((s, e) => s + e.amount, 0),
      totalPending: allEvents
        .filter((e) => e.status === 'PENDING')
        .reduce((s, e) => s + e.amount, 0),
      projectedBalance: totalIncome - totalExpense,
      overdueCount: allEvents.filter((e) => e.status === 'OVERDUE').length,
      recurringCount: allEvents.filter((e) => e.isRecurring).length,
    };

    return { days, summary };
  },

  async getUpcoming7Days(familyId: string): Promise<CalendarFinancialEvent[]> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { data } = await api.get(
      `/finance/calendar?month=${month}&year=${year}&familyId=${familyId}`,
    );

    const allRaw: any[] = [...(data.expenses ?? []), ...(data.incomes ?? [])];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);

    return allRaw
      .filter((r) => {
        const d = new Date(toDateKey(r) + 'T12:00:00');
        return d >= today && d <= in7 && r.status !== 'PAID';
      })
      .map(rawToEvent);
  },
};
