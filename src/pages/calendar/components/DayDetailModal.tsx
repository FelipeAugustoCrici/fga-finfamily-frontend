import React from 'react';
import { cn } from '@/components/ui/Button';
import { CalendarEventItem } from './CalendarEventItem';
import { useUpdateRecordStatus } from '@/pages/records/hooks/useUpdateRecordStatus';
import type { CalendarDaySummary } from '../types/calendar.types';
import type { RecordStatus } from '@/pages/records/types/record.types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  daySummary: CalendarDaySummary | null;
  onClose: () => void;
}

export function DayDetailModal({ daySummary, onClose }: Props) {
  const { mutate: updateStatus, isPending } = useUpdateRecordStatus();

  if (!daySummary) return null;

  const dateLabel = new Date(daySummary.date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleMarkPaid = (id: string, currentStatus?: RecordStatus) => {
    const next: RecordStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    updateStatus({ id, status: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {}
        <div className="flex items-center justify-between p-5 border-b border-primary-100">
          <div>
            <h3 className="text-base font-bold text-primary-800 capitalize">{dateLabel}</h3>
            <p className="text-xs text-primary-500">{daySummary.eventCount} lançamento(s)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <X size={18} className="text-primary-500" />
          </button>
        </div>

        {}
        <div className="grid grid-cols-3 gap-3 px-5 py-3 bg-primary-50/50 border-b border-primary-100">
          <div className="text-center">
            <p className="text-xs text-primary-500">Entradas</p>
            <p className="text-sm font-bold text-success-600">{fmt(daySummary.totalIncome)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-primary-500">Saídas</p>
            <p className="text-sm font-bold text-danger-600">{fmt(daySummary.totalExpense)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-primary-500">Saldo</p>
            <p
              className={cn(
                'text-sm font-bold',
                daySummary.balance >= 0 ? 'text-success-600' : 'text-danger-600',
              )}
            >
              {fmt(daySummary.balance)}
            </p>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {daySummary.events.length === 0 ? (
            <p className="text-center text-primary-400 py-8 text-sm">
              Nenhum lançamento neste dia.
            </p>
          ) : (
            daySummary.events.map((event) => (
              <div key={event.id} className="relative group">
                <CalendarEventItem event={event} />
                {event.status !== 'PAID' && (
                  <button
                    onClick={() => handleMarkPaid(event.id, event.status)}
                    disabled={isPending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-success-50 hover:bg-success-100 text-success-600"
                    title="Marcar como pago"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
