import { useTokens } from '@/hooks/useTokens';

export type CalendarView = 'month' | 'week' | 'day';

interface Props {
  view: CalendarView;
  onChange: (v: CalendarView) => void;
}

const OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
];

export function ViewToggle({ view, onChange }: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  return (
    <div
      style={{
        display: 'inline-flex',
        background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
        borderRadius: 12,
        padding: 3,
        gap: 2,
      }}
    >
      {OPTIONS.map((opt) => {
        const active = view === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 16px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              background: active ? (isDark ? '#6366f1' : '#fff') : 'transparent',
              color: active ? (isDark ? '#fff' : '#4338ca') : t.text.muted,
              boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
