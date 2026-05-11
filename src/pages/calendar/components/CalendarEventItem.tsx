import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/components/ui/Button';
import type { CalendarFinancialEvent } from '../types/calendar.types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  event: CalendarFinancialEvent;
  compact?: boolean;
}

export function CalendarEventItem({ event, compact = false }: Props) {
  const isIncome = event.type === 'income';
  const isPaid = event.status === 'PAID';
  const isOverdue = event.status === 'OVERDUE';
  const isPending = event.status === 'PENDING';

  const colorClass = isIncome
    ? isPaid
      ? 'text-success-600'
      : 'text-success-500'
    : isOverdue
      ? 'text-danger-600'
      : isPending
        ? 'text-warning-600'
        : 'text-danger-500';

  const bgClass = isIncome
    ? 'bg-success-50 border-success-100'
    : isOverdue
      ? 'bg-danger-50 border-danger-100'
      : isPending
        ? 'bg-warning-50 border-warning-100'
        : 'bg-danger-50 border-danger-100';

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border', bgClass)}>
        {event.isRecurring && <RefreshCw size={9} className="text-primary-400 shrink-0" />}
        {isOverdue && <AlertCircle size={9} className="text-danger-500 shrink-0" />}
        <span className={cn('truncate font-medium', colorClass)}>{event.description}</span>
        <span className={cn('shrink-0 font-bold', colorClass)}>{fmt(event.amount)}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border', bgClass)}>
      <div className={cn('shrink-0', colorClass)}>
        {isIncome ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {event.isRecurring && <RefreshCw size={11} className="text-primary-400" />}
          <p className="text-sm font-semibold text-primary-800 truncate">{event.description}</p>
        </div>
        <p className="text-xs text-primary-500 truncate">
          {event.categoryName ?? event.category?.name ?? (isIncome ? 'Receita' : 'Despesa')}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn('text-sm font-bold', colorClass)}>
          {isIncome ? '+' : '-'} {fmt(event.amount)}
        </p>
        {event.status && (
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-medium',
              isPaid
                ? 'bg-success-100 text-success-700'
                : isOverdue
                  ? 'bg-danger-100 text-danger-700'
                  : 'bg-warning-100 text-warning-700',
            )}
          >
            {isPaid ? 'Pago' : isOverdue ? 'Vencido' : 'Pendente'}
          </span>
        )}
      </div>
    </div>
  );
}
