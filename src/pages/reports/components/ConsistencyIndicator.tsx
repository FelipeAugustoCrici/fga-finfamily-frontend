import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import type { SummaryData } from '../types/reports.types';
import { formatCurrency } from '../utils/reports-helpers';

interface Props {
  summaries: SummaryData[];
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function ConsistencyIndicator({ summaries }: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const positiveMonths = summaries.filter((s) => s.totals.balance > 0).length;
  const negativeMonths = summaries.length - positiveMonths;
  const consistencyPct =
    summaries.length > 0 ? Math.round((positiveMonths / summaries.length) * 100) : 0;

  const balances = summaries.map((s) => s.totals.balance);
  const lastThree = balances.slice(-3);
  const trend =
    lastThree.length >= 2
      ? lastThree[lastThree.length - 1] > lastThree[0]
        ? 'up'
        : lastThree[lastThree.length - 1] < lastThree[0]
          ? 'down'
          : 'stable'
      : 'stable';

  const avgBalance = balances.reduce((a, b) => a + b, 0) / (balances.length || 1);
  const avgIncome = summaries.reduce((a, s) => a + s.totals.incomes, 0) / (summaries.length || 1);
  const avgExpense = summaries.reduce((a, s) => a + s.totals.expenses, 0) / (summaries.length || 1);

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

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

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
          Consistência Financeira
        </p>
        <p style={{ fontSize: 12, color: t.text.muted, marginTop: 2 }}>
          Análise dos últimos {summaries.length} meses
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {/* Meses positivos */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: isDark ? 'rgba(16,185,129,0.08)' : '#ecfdf5',
            border: `1px solid ${isDark ? 'rgba(16,185,129,0.2)' : '#a7f3d0'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <CheckCircle2 size={14} style={{ color: isDark ? '#6ee7b7' : '#059669' }} />
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: t.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Meses positivos
            </p>
          </div>
          <p
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: isDark ? '#6ee7b7' : '#059669',
              lineHeight: 1,
            }}
          >
            {positiveMonths}
            <span style={{ fontSize: 14, fontWeight: 600, color: t.text.muted }}>
              {' '}
              / {summaries.length}
            </span>
          </p>
          <p style={{ fontSize: 11, color: t.text.muted, marginTop: 4 }}>
            {consistencyPct}% de consistência
          </p>
        </div>

        {/* Meses negativos */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background:
              negativeMonths > 0
                ? isDark
                  ? 'rgba(239,68,68,0.08)'
                  : '#fef2f2'
                : isDark
                  ? 'rgba(255,255,255,0.04)'
                  : '#f8fafc',
            border: `1px solid ${negativeMonths > 0 ? (isDark ? 'rgba(239,68,68,0.2)' : '#fecaca') : t.border.subtle}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <XCircle
              size={14}
              style={{
                color: negativeMonths > 0 ? (isDark ? '#fca5a5' : '#dc2626') : t.text.muted,
              }}
            />
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: t.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Meses negativos
            </p>
          </div>
          <p
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: negativeMonths > 0 ? (isDark ? '#fca5a5' : '#dc2626') : t.text.muted,
              lineHeight: 1,
            }}
          >
            {negativeMonths}
            <span style={{ fontSize: 14, fontWeight: 600, color: t.text.muted }}>
              {' '}
              / {summaries.length}
            </span>
          </p>
          <p style={{ fontSize: 11, color: t.text.muted, marginTop: 4 }}>
            {negativeMonths === 0
              ? 'Nenhum mês negativo'
              : `${negativeMonths} ${negativeMonths === 1 ? 'mês' : 'meses'} no vermelho`}
          </p>
        </div>

        {/* Tendência recente */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
            border: `1px solid ${t.border.subtle}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <TrendIcon size={14} style={{ color: trendColor }} />
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: t.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Tendência recente
            </p>
          </div>
          <p
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: trendColor,
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {trend === 'up' ? 'Melhorando' : trend === 'down' ? 'Piorando' : 'Estável'}
          </p>
          <p style={{ fontSize: 11, color: t.text.muted }}>Últimos 3 meses</p>
        </div>

        {/* Médias */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : '#c7d2fe'}`,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: t.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}
          >
            Médias do período
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: t.text.muted }}>Receita média</span>
              <span
                style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#6ee7b7' : '#059669' }}
              >
                {formatCurrency(avgIncome)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: t.text.muted }}>Despesa média</span>
              <span
                style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#fca5a5' : '#dc2626' }}
              >
                {formatCurrency(avgExpense)}
              </span>
            </div>
            <div style={{ height: 1, background: t.border.divider, margin: '2px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: t.text.muted }}>Saldo médio</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color:
                    avgBalance >= 0
                      ? isDark
                        ? '#6ee7b7'
                        : '#059669'
                      : isDark
                        ? '#fca5a5'
                        : '#dc2626',
                }}
              >
                {formatCurrency(avgBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline de meses */}
      <div style={{ marginTop: 16 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: t.text.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          Histórico mensal
        </p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {summaries.map((s, i) => {
            const isPos = s.totals.balance >= 0;
            return (
              <div
                key={i}
                title={`${MONTHS[s.month - 1]}/${s.year}: ${formatCurrency(s.totals.balance)}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: isPos
                    ? isDark
                      ? 'rgba(16,185,129,0.12)'
                      : '#ecfdf5'
                    : isDark
                      ? 'rgba(239,68,68,0.12)'
                      : '#fef2f2',
                  border: `1px solid ${isPos ? (isDark ? 'rgba(16,185,129,0.2)' : '#a7f3d0') : isDark ? 'rgba(239,68,68,0.2)' : '#fecaca'}`,
                  minWidth: 44,
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, color: t.text.muted }}>
                  {MONTHS[s.month - 1]}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: isPos
                      ? isDark
                        ? '#6ee7b7'
                        : '#059669'
                      : isDark
                        ? '#fca5a5'
                        : '#dc2626',
                  }}
                >
                  {isPos ? '+' : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
