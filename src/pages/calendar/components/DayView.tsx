import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { CalendarEventItem } from './CalendarEventItem';
import type { CalendarDaySummary } from '../types/calendar.types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const WEEKDAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  selectedDate: Date;
  days: CalendarDaySummary[];
  onDateChange: (d: Date) => void;
  onEventClick?: (date: string) => void;
}

export function DayView({ selectedDate, days, onDateChange, onEventClick: _onEventClick }: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const today = toKey(new Date());
  const key = toKey(selectedDate);
  const summary = days.find((d) => d.date === key);
  const isToday = key === today;

  const prev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const next = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  return (
    <div
      style={{
        background: t.bg.card,
        border: `1px solid ${t.border.default}`,
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: t.shadow.card,
      }}
    >
      {/* Day header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: `1px solid ${t.border.divider}`,
          background: isToday ? (isDark ? 'rgba(99,102,241,0.08)' : '#f5f3ff') : 'transparent',
        }}
      >
        <button
          type="button"
          onClick={prev}
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            border: 'none',
            borderRadius: 10,
            padding: '8px 10px',
            cursor: 'pointer',
            color: t.text.muted,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: t.text.muted, marginBottom: 2 }}>
            {WEEKDAYS[selectedDate.getDay()]}
          </p>
          <div
            style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center' }}
          >
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: isToday ? '#6366f1' : t.text.primary,
                lineHeight: 1,
              }}
            >
              {selectedDate.getDate()}
            </span>
            <span style={{ fontSize: 16, fontWeight: 600, color: t.text.secondary }}>
              {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </span>
          </div>
          {isToday && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#6366f1',
                color: '#fff',
                marginTop: 4,
                display: 'inline-block',
              }}
            >
              HOJE
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={next}
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            border: 'none',
            borderRadius: 10,
            padding: '8px 10px',
            cursor: 'pointer',
            color: t.text.muted,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Summary chips */}
      {summary && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            padding: '12px 20px',
            borderBottom: `1px solid ${t.border.divider}`,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            icon={<TrendingUp size={13} />}
            label="Receitas"
            value={fmt(summary.totalIncome)}
            color={isDark ? '#6ee7b7' : '#059669'}
            bg={isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4'}
          />
          <Chip
            icon={<TrendingDown size={13} />}
            label="Despesas"
            value={fmt(summary.totalExpense)}
            color={isDark ? '#fca5a5' : '#dc2626'}
            bg={isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2'}
          />
          <Chip
            icon={<Wallet size={13} />}
            label="Saldo"
            value={fmt(summary.balance)}
            color={
              summary.balance >= 0
                ? isDark
                  ? '#6ee7b7'
                  : '#059669'
                : isDark
                  ? '#fca5a5'
                  : '#dc2626'
            }
            bg={isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'}
          />
        </div>
      )}

      {/* Events list */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minHeight: 200,
        }}
      >
        {summary && summary.events.length > 0 ? (
          summary.events.map((ev) => <CalendarEventItem key={ev.id} event={ev} />)
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '40px 0',
            }}
          >
            <span style={{ fontSize: 32 }}>📭</span>
            <p style={{ fontSize: 14, color: t.text.muted }}>Nenhum lançamento neste dia</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 10,
        background: bg,
      }}
    >
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}</span>
    </div>
  );
}
