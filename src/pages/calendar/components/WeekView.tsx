import { useTokens } from '@/hooks/useTokens';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type { CalendarDaySummary, CalendarFinancialEvent } from '../types/calendar.types';

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDates(ref: Date): Date[] {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function eventColors(ev: CalendarFinancialEvent) {
  if (ev.type === 'income')
    return { color: '#059669', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' };
  if (ev.status === 'OVERDUE')
    return { color: '#dc2626', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' };
  return { color: '#d97706', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' };
}

function EventPill({ ev }: { ev: CalendarFinancialEvent }) {
  const { color, bg, border } = eventColors(ev);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        padding: '3px 6px',
        borderRadius: 6,
        background: bg,
        border: `1px solid ${border}`,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {ev.isRecurring && <RefreshCw size={8} style={{ color, flexShrink: 0 }} />}
      {ev.status === 'OVERDUE' && <AlertCircle size={8} style={{ color, flexShrink: 0 }} />}
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          minWidth: 0,
        }}
      >
        {ev.description}
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, color, flexShrink: 0, marginLeft: 2 }}>
        {fmt(ev.amount)}
      </span>
    </div>
  );
}

interface Props {
  referenceDate: Date;
  days: CalendarDaySummary[];
  onDayClick: (date: string) => void;
}

export function WeekView({ referenceDate, days, onDayClick }: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const today = toKey(new Date());
  const dayMap = new Map(days.map((d) => [d.date, d]));
  const weekDates = getWeekDates(referenceDate);

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          borderBottom: `1px solid ${t.border.divider}`,
        }}
      >
        {weekDates.map((date, i) => {
          const isToday = toKey(date) === today;
          return (
            <div
              key={i}
              style={{
                padding: '12px 6px',
                textAlign: 'center',
                borderRight: i < 6 ? `1px solid ${t.border.divider}` : 'none',
                background: isToday
                  ? isDark
                    ? 'rgba(99,102,241,0.12)'
                    : '#eef2ff'
                  : 'transparent',
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: t.text.muted,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {WEEKDAYS_SHORT[date.getDay()]}
              </p>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isToday ? '#6366f1' : 'transparent',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isToday ? '#fff' : t.text.primary,
                  }}
                >
                  {date.getDate()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          minHeight: 180,
        }}
      >
        {weekDates.map((date, i) => {
          const key = toKey(date);
          const summary = dayMap.get(key);
          const isToday = key === today;
          const hasEvents = !!summary && summary.eventCount > 0;
          const MAX = 3;

          return (
            <div
              key={i}
              onClick={() => hasEvents && onDayClick(key)}
              style={{
                padding: '8px 5px',
                borderRight: i < 6 ? `1px solid ${t.border.divider}` : 'none',
                cursor: hasEvents ? 'pointer' : 'default',
                background: isToday
                  ? isDark
                    ? 'rgba(99,102,241,0.05)'
                    : '#faf5ff'
                  : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              {hasEvents ? (
                <>
                  {summary!.events.slice(0, MAX).map((ev) => (
                    <EventPill key={ev.id} ev={ev} />
                  ))}
                  {summary!.eventCount > MAX && (
                    <span style={{ fontSize: 9, color: t.text.muted, paddingLeft: 2 }}>
                      +{summary!.eventCount - MAX} mais
                    </span>
                  )}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 5,
                      borderTop: `1px solid ${t.border.divider}`,
                      fontSize: 10,
                      fontWeight: 700,
                      color:
                        summary!.balance >= 0
                          ? isDark
                            ? '#6ee7b7'
                            : '#059669'
                          : isDark
                            ? '#fca5a5'
                            : '#dc2626',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {summary!.balance >= 0 ? '+' : ''}
                    {fmt(summary!.balance)}
                  </div>
                </>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    color: t.text.muted,
                    textAlign: 'center',
                    marginTop: 20,
                    display: 'block',
                  }}
                >
                  -
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
