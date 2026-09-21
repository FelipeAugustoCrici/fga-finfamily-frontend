import React from 'react';
import { cn } from '@/components/ui/Button';
import { CalendarEventItem } from './CalendarEventItem';
import type { CalendarDaySummary } from '../types/calendar.types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  day: number;
  month: number;
  year: number;
  summary?: CalendarDaySummary;
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}

const MAX_VISIBLE = 2;

export function CalendarDayCell({
  day,
  month: _month,
  year: _year,
  summary,
  isToday,
  isCurrentMonth,
  onClick,
}: Props) {
  const hasEvents = summary && summary.eventCount > 0;
  const hasOverdue = summary?.events.some((e) => e.status === 'OVERDUE');
  const hasPending = summary?.events.some((e) => e.status === 'PENDING');

  return (
    <div
      onClick={onClick}
      className={cn(
        'min-h-[52px] sm:min-h-[100px] p-1 sm:p-2 rounded-lg sm:rounded-xl min-w-0 overflow-hidden border cursor-pointer transition-all duration-150 flex flex-col gap-1',
        isCurrentMonth
          ? 'bg-white border-primary-100 hover:border-primary-300 hover:shadow-sm'
          : 'bg-primary-50/30 border-primary-50',
        isToday && 'ring-2 ring-primary-500 border-primary-300',
        !isCurrentMonth && 'opacity-40',
      )}
    >
      {}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full',
            isToday ? 'bg-primary-600 text-white' : 'text-primary-700',
          )}
        >
          {day}
        </span>
        <div className="flex gap-1">
          {hasOverdue && <span className="w-2 h-2 rounded-full bg-danger-500" title="Vencido" />}
          {hasPending && !hasOverdue && (
            <span className="w-2 h-2 rounded-full bg-warning-400" title="Pendente" />
          )}
        </div>
      </div>

      {}
      {hasEvents && (
        <div className="hidden sm:flex flex-col gap-0.5 flex-1">
          {summary.events.slice(0, MAX_VISIBLE).map((e) => (
            <CalendarEventItem key={e.id} event={e} compact />
          ))}
          {summary.eventCount > MAX_VISIBLE && (
            <span className="text-xs text-primary-400 font-medium pl-1">
              +{summary.eventCount - MAX_VISIBLE} mais
            </span>
          )}
        </div>
      )}

      {}
      {hasEvents && (
        <div
          className={cn(
            'hidden sm:block text-xs font-bold mt-auto pt-1 border-t border-primary-50 font-mono',
            summary.balance >= 0 ? 'text-success-600' : 'text-danger-600',
          )}
        >
          {summary.balance >= 0 ? '+' : ''}
          {fmt(summary.balance)}
        </div>
      )}
    </div>
  );
}
