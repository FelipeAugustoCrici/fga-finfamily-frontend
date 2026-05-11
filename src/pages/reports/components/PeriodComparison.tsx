import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import type { SummaryData } from '../types/reports.types';
import { formatCurrency } from '../utils/reports-helpers';

interface Props {
  current: SummaryData;
  previous: SummaryData;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export function PeriodComparison({ current, previous }: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const prevLabel = `${MONTHS[previous.month - 1]}/${previous.year}`;
  const currLabel = `${MONTHS[current.month - 1]}/${current.year}`;

  const items = [
    {
      label: 'Receitas',
      curr: current.totals.incomes,
      prev: previous.totals.incomes,
      positiveIsGood: true,
    },
    {
      label: 'Despesas',
      curr: current.totals.expenses,
      prev: previous.totals.expenses,
      positiveIsGood: false,
    },
    {
      label: 'Saldo',
      curr: current.totals.balance,
      prev: previous.totals.balance,
      positiveIsGood: true,
    },
  ];

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
          Comparação de Períodos
        </p>
        <p style={{ fontSize: 12, color: t.text.muted, marginTop: 2 }}>
          {currLabel} vs {prevLabel}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {items.map(({ label, curr, prev, positiveIsGood }) => {
          const pct = pctChange(curr, prev);
          const isUp = pct > 0;
          const isNeutral = Math.abs(pct) < 0.5;
          const isGood = isNeutral ? null : isUp === positiveIsGood;

          const color = isNeutral
            ? t.text.muted
            : isGood
              ? isDark
                ? '#6ee7b7'
                : '#059669'
              : isDark
                ? '#fca5a5'
                : '#dc2626';

          const bg = isNeutral
            ? isDark
              ? 'rgba(255,255,255,0.04)'
              : '#f8fafc'
            : isGood
              ? isDark
                ? 'rgba(16,185,129,0.08)'
                : '#ecfdf5'
              : isDark
                ? 'rgba(239,68,68,0.08)'
                : '#fef2f2';

          const border = isNeutral
            ? t.border.subtle
            : isGood
              ? isDark
                ? 'rgba(16,185,129,0.2)'
                : '#a7f3d0'
              : isDark
                ? 'rgba(239,68,68,0.2)'
                : '#fecaca';

          const Icon = isNeutral ? Minus : isUp ? TrendingUp : TrendingDown;

          return (
            <div
              key={label}
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                background: bg,
                border: `1px solid ${border}`,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: t.text.muted,
                  marginBottom: 8,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: t.text.primary,
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {formatCurrency(curr)}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon size={13} style={{ color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color }}>
                  {isNeutral ? 'Estável' : `${isUp ? '+' : ''}${pct.toFixed(1)}%`}
                </span>
                <span style={{ fontSize: 11, color: t.text.subtle }}>vs {prevLabel}</span>
              </div>
              <p style={{ fontSize: 11, color: t.text.subtle, marginTop: 4 }}>
                Anterior: {formatCurrency(prev)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
