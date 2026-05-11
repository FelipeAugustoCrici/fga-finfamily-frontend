import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import type { MonthlyData } from '../types/reports.types';
import { formatCurrency, calculateAverage } from '../utils/reports-helpers';

interface MonthlyEvolutionProps {
  data: MonthlyData[];
}

export function MonthlyEvolution({ data }: MonthlyEvolutionProps) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const avgIncome = calculateAverage(data.map((d) => d.income));
  const avgExpense = calculateAverage(data.map((d) => d.expense));
  const avgBalance = calculateAverage(data.map((d) => d.balance));

  const maxIncome = Math.max(...data.map((d) => d.income), 1);
  const maxExpense = Math.max(...data.map((d) => d.expense), 1);

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
        <p style={{ fontSize: 14, fontWeight: 700, color: t.text.primary }}>Evolução Mensal</p>
        <p style={{ fontSize: 12, color: t.text.muted, marginTop: 2 }}>
          Receitas, despesas e saldo mês a mês
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((month, index) => {
          const isCurrentMonth = index === data.length - 1;
          const prevBalance = index > 0 ? data[index - 1].balance : null;
          const trend =
            prevBalance === null
              ? null
              : month.balance > prevBalance
                ? 'up'
                : month.balance < prevBalance
                  ? 'down'
                  : 'stable';

          const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
          const trendColor =
            trend === 'up'
              ? isDark
                ? '#6ee7b7'
                : '#059669'
              : trend === 'down'
                ? isDark
                  ? '#fca5a5'
                  : '#dc2626'
                : t.text.muted;

          const isPositive = month.balance >= 0;
          const incPct = Math.min((month.income / maxIncome) * 100, 100);
          const expPct = Math.min((month.expense / maxExpense) * 100, 100);

          const opacity = isCurrentMonth ? 1 : 0.65;

          return (
            <div
              key={index}
              style={{
                padding: isCurrentMonth ? '12px 14px' : '9px 14px',
                borderRadius: 12,
                background: isCurrentMonth
                  ? isDark
                    ? 'rgba(99,102,241,0.1)'
                    : '#eef2ff'
                  : isDark
                    ? 'rgba(255,255,255,0.03)'
                    : '#f8fafc',
                border: `1px solid ${
                  isCurrentMonth ? (isDark ? 'rgba(99,102,241,0.3)' : '#c7d2fe') : t.border.subtle
                }`,
                opacity,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: isCurrentMonth ? 13 : 12,
                      fontWeight: isCurrentMonth ? 800 : 600,
                      color: isCurrentMonth ? (isDark ? '#a5b4fc' : '#4338ca') : t.text.secondary,
                      minWidth: 36,
                    }}
                  >
                    {month.month}
                  </span>
                  {isCurrentMonth && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 999,
                        background: isDark ? 'rgba(99,102,241,0.2)' : '#c7d2fe',
                        color: isDark ? '#a5b4fc' : '#4338ca',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      atual
                    </span>
                  )}
                  {trend && <TrendIcon size={12} style={{ color: trendColor }} />}
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span
                    style={{ fontSize: 12, color: isDark ? '#6ee7b7' : '#059669', fontWeight: 600 }}
                  >
                    +{formatCurrency(month.income)}
                  </span>
                  <span
                    style={{ fontSize: 12, color: isDark ? '#fca5a5' : '#dc2626', fontWeight: 600 }}
                  >
                    -{formatCurrency(month.expense)}
                  </span>
                  <span
                    style={{
                      fontSize: isCurrentMonth ? 13 : 12,
                      fontWeight: 800,
                      color: isPositive
                        ? isDark
                          ? '#6ee7b7'
                          : '#059669'
                        : isDark
                          ? '#fca5a5'
                          : '#dc2626',
                      minWidth: 80,
                      textAlign: 'right',
                    }}
                  >
                    {isPositive ? '+' : ''}
                    {formatCurrency(month.balance)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{ fontSize: 9, color: t.text.subtle, width: 14, textAlign: 'right' }}
                  >
                    R
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 999,
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 999,
                        width: `${incPct}%`,
                        background: 'linear-gradient(90deg, #34d399, #10b981)',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{ fontSize: 9, color: t.text.subtle, width: 14, textAlign: 'right' }}
                  >
                    D
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 999,
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 999,
                        width: `${expPct}%`,
                        background: 'linear-gradient(90deg, #f87171, #ef4444)',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${t.border.divider}`,
        }}
      >
        {[
          { label: `Receita média`, value: avgIncome, color: isDark ? '#6ee7b7' : '#059669' },
          { label: `Despesa média`, value: avgExpense, color: isDark ? '#fca5a5' : '#dc2626' },
          {
            label: `Saldo médio`,
            value: avgBalance,
            color:
              avgBalance >= 0 ? (isDark ? '#6ee7b7' : '#059669') : isDark ? '#fca5a5' : '#dc2626',
          },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: t.text.muted, marginBottom: 3 }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 800, color }}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
