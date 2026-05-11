import React from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/components/ui/Button';
import type { MonthlyCalendarSummary } from '../types/calendar.types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  summary: MonthlyCalendarSummary;
}

export function MonthlySummaryCards({ summary }: Props) {
  const cards = [
    {
      label: 'Entradas previstas',
      value: fmt(summary.totalIncome),
      icon: ArrowUpCircle,
      color: 'text-success-600',
      bg: 'bg-success-50',
    },
    {
      label: 'Saídas previstas',
      value: fmt(summary.totalExpense),
      icon: ArrowDownCircle,
      color: 'text-danger-600',
      bg: 'bg-danger-50',
    },
    {
      label: 'Saldo previsto',
      value: fmt(summary.projectedBalance),
      icon: Wallet,
      color: summary.projectedBalance >= 0 ? 'text-success-600' : 'text-danger-600',
      bg: summary.projectedBalance >= 0 ? 'bg-success-50' : 'bg-danger-50',
    },
    {
      label: 'Pendências',
      value: fmt(summary.totalPending),
      icon: AlertTriangle,
      color: 'text-warning-600',
      bg: 'bg-warning-50',
      sub: `${summary.overdueCount} vencido(s)`,
    },
    {
      label: 'Pago/Recebido',
      value: fmt(summary.totalPaid),
      icon: CheckCircle,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Recorrentes',
      value: String(summary.recurringCount),
      icon: RefreshCw,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
      sub: 'lançamentos',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-primary-100 p-4 flex flex-col gap-2"
        >
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c.bg)}>
            <c.icon size={16} className={c.color} />
          </div>
          <p className="text-xs text-primary-500 font-medium leading-tight">{c.label}</p>
          <p className={cn('text-base font-bold', c.color)}>{c.value}</p>
          {c.sub && <p className="text-xs text-primary-400">{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}
