import { useTokens } from '@/hooks/useTokens';
import type { SummaryData } from '../types/reports.types';
import { formatCurrency } from '../utils/reports-helpers';

interface Props {
  summary: SummaryData;
}

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function TopExpenses({ summary }: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const allExpenses = summary.details?.expenses ?? [];
  const totalPeriod = allExpenses.reduce((a: number, e: any) => a + e.value, 0);

  const expenses = allExpenses
    .map((e: any) => ({
      id: e.id,
      description: e.description,
      value: e.value,
      category: e.category?.name || e.categoryName || 'Outros',
    }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 8);

  if (expenses.length === 0) return null;

  const maxVal = expenses[0]?.value ?? 1;

  return (
    <div
      style={{
        background: t.bg.card,
        border: `1px solid ${t.border.default}`,
        borderRadius: 18,
        padding: '18px 20px',
        boxShadow: t.shadow.card,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>
          Maiores Gastos do Período
        </p>
        <p style={{ fontSize: 12, color: t.text.muted, marginTop: 2 }}>
          Top 8 despesas de {MONTHS[summary.month - 1]} {summary.year}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {expenses.map((exp: any, i: number) => {
          const barPct = Math.min((exp.value / maxVal) * 100, 100);
          const pctOfTotal = totalPeriod > 0 ? (exp.value / totalPeriod) * 100 : 0;

          return (
            <div
              key={exp.id ?? i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 10,
                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                border: `1px solid ${t.border.subtle}`,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  flexShrink: 0,
                  background:
                    i === 0
                      ? isDark
                        ? 'rgba(239,68,68,0.2)'
                        : '#fee2e2'
                      : isDark
                        ? 'rgba(255,255,255,0.06)'
                        : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 800,
                  color: i === 0 ? (isDark ? '#fca5a5' : '#dc2626') : t.text.muted,
                }}
              >
                {i + 1}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: t.text.primary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '55%',
                    }}
                  >
                    {exp.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {pctOfTotal > 0 && (
                      <span style={{ fontSize: 10, color: t.text.subtle }}>
                        {pctOfTotal.toFixed(1)}%
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: isDark ? '#fca5a5' : '#dc2626',
                      }}
                    >
                      {formatCurrency(exp.value)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 999,
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 999,
                        width: `${barPct}%`,
                        background:
                          i === 0
                            ? 'linear-gradient(90deg, #f87171, #ef4444)'
                            : 'linear-gradient(90deg, #818cf8, #6366f1)',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 999,
                      flexShrink: 0,
                      background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
                      color: isDark ? '#a5b4fc' : '#4338ca',
                      border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : '#c7d2fe'}`,
                    }}
                  >
                    {exp.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
