import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTokens } from '@/hooks/useTokens';
import { useCalendar } from './hooks/useCalendar';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { CalendarGrid } from './components/CalendarGrid';
import { CalendarFilters } from './components/CalendarFilters';
import { DayDetailModal } from './components/DayDetailModal';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { ViewToggle, type CalendarView } from './components/ViewToggle';
import type { CalendarFilter, CalendarDaySummary } from './types/calendar.types';

export function FinancialCalendar() {
  const now = new Date();
  const t = useTokens();

  const [view, setView] = useState<CalendarView>('month');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [filter, setFilter] = useState<CalendarFilter>({ type: 'all', status: 'all' });
  const [selectedDay, setSelectedDay] = useState<CalendarDaySummary | null>(null);

  const { data, isLoading } = useCalendar(month, year, filter);

  // Keep month/year in sync with selectedDate for week/day views
  const syncMonth = (d: Date) => {
    setSelectedDate(d);
    setMonth(d.getMonth() + 1);
    setYear(d.getFullYear());
  };

  const prevPeriod = () => {
    if (view === 'month') {
      if (month === 1) {
        setMonth(12);
        setYear((y) => y - 1);
      } else setMonth((m) => m - 1);
    } else if (view === 'week') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 7);
      syncMonth(d);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      syncMonth(d);
    }
  };

  const nextPeriod = () => {
    if (view === 'month') {
      if (month === 12) {
        setMonth(1);
        setYear((y) => y + 1);
      } else setMonth((m) => m + 1);
    } else if (view === 'week') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 7);
      syncMonth(d);
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      syncMonth(d);
    }
  };

  const handleDayClick = (dateKey: string) => {
    const day = data?.days.find((d) => d.date === dateKey);
    if (day) setSelectedDay(day);
  };

  const handleViewChange = (v: CalendarView) => {
    setView(v);
    // When switching to day/week, anchor to today if still on current month
    if (v !== 'month') {
      const anchor = new Date(year, month - 1, selectedDate.getDate());
      setSelectedDate(anchor);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        showPeriod
        month={month}
        year={year}
        onPrevMonth={prevPeriod}
        onNextMonth={nextPeriod}
      />

      {/* View toggle + filters row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <ViewToggle view={view} onChange={handleViewChange} />
        <CalendarFilters filter={filter} onChange={setFilter} />
      </div>

      {/* Monthly summary cards — only in month view */}
      {view === 'month' && data?.summary && <MonthlySummaryCards summary={data.summary} />}

      {/* Calendar body */}
      {isLoading ? (
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 18,
            padding: 16,
            boxShadow: t.shadow.card,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} height={12} borderRadius={4} />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, row) => (
            <div
              key={row}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}
            >
              {Array.from({ length: 7 }).map((_, col) => (
                <Skeleton key={col} height={72} borderRadius={10} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <>
          {view === 'month' && (
            <div
              style={{
                background: t.bg.card,
                border: `1px solid ${t.border.default}`,
                borderRadius: 18,
                padding: 16,
                boxShadow: t.shadow.card,
              }}
            >
              <CalendarGrid
                month={month}
                year={year}
                days={data?.days ?? []}
                onDayClick={handleDayClick}
              />
            </div>
          )}

          {view === 'week' && (
            <WeekView
              referenceDate={selectedDate}
              days={data?.days ?? []}
              onDayClick={handleDayClick}
            />
          )}

          {view === 'day' && (
            <DayView
              selectedDate={selectedDate}
              days={data?.days ?? []}
              onDateChange={syncMonth}
              onEventClick={handleDayClick}
            />
          )}
        </>
      )}

      <DayDetailModal daySummary={selectedDay} onClose={() => setSelectedDay(null)} />
    </div>
  );
}
