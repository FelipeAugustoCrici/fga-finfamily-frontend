import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import type { SummaryData } from '../types/reports.types';
import { formatCurrency } from '../utils/reports-helpers';

interface Props {
  summaries: SummaryData[];
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function buildCategoryHistory(summaries: SummaryData[]) {
  const map: Record<string, { month: string; value: number }[]> = {};

  for (const s of summaries) {
    const label = `${MONTHS[s.month - 1]}/${s.year}`;
    const expenses = s.details?.expenses ?? [];
    const byCategory: Record<string, number> = {};

    for (const exp of expenses) {
      const cat = exp.category?.name || exp.categoryName || 'Outros';
      byCategory[cat] = (byCategory[cat] ?? 0) + exp.value;
    }

    for (const [cat, val] of Object.entries(byCategory)) {
      if (!map[cat]) map[cat] = [];
      map[cat].push({ month: label, value: val });
    }
  }

  return map;
}

export function CategoryTrends({ summaries }: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const history = buildCategoryHistory(summaries);

  const categories = Object.entries(history)
    .map(([name, data]) => {
      const total = data.reduce((a, b) => a + b.value, 0);
      const last = data[data.length - 1]?.value ?? 0;
      const prev = data[data.length - 2]?.value ?? 0;
      const change = prev > 0 ? ((last - prev) / prev) * 100 : 0;
      return { name, data, total, last, prev, change };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  if (categories.length === 0) return null;

  const maxTotal = categories[0]?.total ?? 1;

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
          Tendências por Categoria
        </p>
        <p style={{ fontSize: 12, color: t.text.muted, marginTop: 2 }}>
          Evolução e variação dos gastos por categoria no período
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map(({ name, total, change, data }) => {
          const isUp = change > 2;
          const isDown = change < -2;
          const barPct = Math.min((total / maxTotal) * 100, 100);

          const changeColor = isUp
            ? isDark
              ? '#fca5a5'
              : '#dc2626'
            : isDown
              ? isDark
                ? '#6ee7b7'
                : '#059669'
              : t.text.muted;

          const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

          const statusLabel = isUp ? '↑ Aumentando' : isDown ? '↓ Diminuindo' : '→ Estável';

          return (
            <div
              key={name}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                border: `1px solid ${t.border.subtle}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 7,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: t.text.primary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {name}
                  </p>
                  <span style={{ fontSize: 10, color: t.text.subtle, flexShrink: 0 }}>
                    {data.length}m
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon size={11} style={{ color: changeColor }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: changeColor }}>
                      {statusLabel}
                    </span>
                    {Math.abs(change) >= 0.5 && (
                      <span style={{ fontSize: 10, color: t.text.subtle }}>
                        ({isUp ? '+' : ''}
                        {change.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: t.text.primary }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  width: '100%',
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
                    width: `${barPct}%`,
                    background: isUp
                      ? `linear-gradient(90deg, #f87171, #ef4444)`
                      : isDown
                        ? `linear-gradient(90deg, #34d399, #10b981)`
                        : `linear-gradient(90deg, #818cf8, #6366f1)`,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>

              {data.length > 1 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {data.map((d, i) => (
                    <span key={i} style={{ fontSize: 10, color: t.text.subtle }}>
                      {d.month}:{' '}
                      <span style={{ color: t.text.secondary, fontWeight: 600 }}>
                        {formatCurrency(d.value)}
                      </span>
                      {i < data.length - 1 && <span style={{ color: t.border.default }}> · </span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
