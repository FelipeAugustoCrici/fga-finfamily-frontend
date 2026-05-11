import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ArrowRight, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

import { useUpcoming7Days } from '../hooks/useCalendar';
import { CalendarEventItem } from './CalendarEventItem';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function UpcomingWeekCard() {
  const navigate = useNavigate();
  const { data: events = [], isLoading, isError } = useUpcoming7Days();

  const totalExpense = events.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const overdueCount = events.filter((e) => e.status === 'OVERDUE').length;

  if (isError) return null;

  return (
    <Card
      title="Próximos 7 dias"
      description={`${events.length} compromisso(s) financeiro(s)`}
      footer={
        <button
          onClick={() => navigate('/calendar')}
          className="w-full flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors py-1"
        >
          Ver calendário completo <ArrowRight size={14} />
        </button>
      }
    >
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={44} borderRadius={10} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="h-24 flex flex-col items-center justify-center gap-2 text-primary-400">
          <CalendarDays size={24} />
          <p className="text-sm">Nenhum compromisso nos próximos 7 dias</p>
        </div>
      ) : (
        <div className="space-y-3">
          {overdueCount > 0 && (
            <div className="flex items-center gap-2 p-2 bg-danger-50 rounded-lg border border-danger-100">
              <AlertTriangle size={14} className="text-danger-500 shrink-0" />
              <p className="text-xs text-danger-700 font-medium">
                {overdueCount} lançamento(s) vencido(s)
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-primary-500 px-1">
            <span>Total a pagar</span>
            <span className="font-bold text-danger-600">{fmt(totalExpense)}</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {events.slice(0, 5).map((e) => (
              <CalendarEventItem key={e.id} event={e} compact />
            ))}
            {events.length > 5 && (
              <p className="text-xs text-primary-400 text-center pt-1">+{events.length - 5} mais</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
