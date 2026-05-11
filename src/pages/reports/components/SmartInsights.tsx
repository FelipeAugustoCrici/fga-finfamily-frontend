import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import type { SummaryData } from '../types/reports.types';
import { formatCurrency } from '../utils/reports-helpers';

interface Props {
  summaries: SummaryData[];
  current: SummaryData;
  previous: SummaryData | null;
}

interface Insight {
  icon: typeof AlertTriangle;
  title: string;
  message: string;
  type: 'positive' | 'warning' | 'danger' | 'info';
  group: 'alerta' | 'oportunidade' | 'evolucao';
}

function buildInsights(
  summaries: SummaryData[],
  current: SummaryData,
  previous: SummaryData | null,
): Insight[] {
  const insights: Insight[] = [];

  if (previous) {
    const expChange =
      previous.totals.expenses > 0
        ? ((current.totals.expenses - previous.totals.expenses) / previous.totals.expenses) * 100
        : 0;
    const incChange =
      previous.totals.incomes > 0
        ? ((current.totals.incomes - previous.totals.incomes) / previous.totals.incomes) * 100
        : 0;

    if (expChange > 15) {
      insights.push({
        icon: TrendingUp,
        title: 'Aumento expressivo de despesas',
        message: `Seus gastos aumentaram ${expChange.toFixed(1)}% em relação ao mês anterior (${formatCurrency(current.totals.expenses - previous.totals.expenses)} a mais).`,
        type: 'danger',
        group: 'alerta',
      });
    } else if (expChange < -10) {
      insights.push({
        icon: TrendingDown,
        title: 'Redução de despesas',
        message: `Você reduziu seus gastos em ${Math.abs(expChange).toFixed(1)}% comparado ao mês anterior.`,
        type: 'positive',
        group: 'evolucao',
      });
    }

    if (incChange > 10) {
      insights.push({
        icon: TrendingUp,
        title: 'Receitas em alta',
        message: `Suas receitas cresceram ${incChange.toFixed(1)}% em relação ao mês anterior.`,
        type: 'positive',
        group: 'evolucao',
      });
    }

    const prevCatMap: Record<string, number> = {};
    for (const exp of previous.details?.expenses ?? []) {
      const cat = exp.category?.name || exp.categoryName || 'Outros';
      prevCatMap[cat] = (prevCatMap[cat] ?? 0) + exp.value;
    }

    const currCatMap: Record<string, number> = {};
    for (const exp of current.details?.expenses ?? []) {
      const cat = exp.category?.name || exp.categoryName || 'Outros';
      currCatMap[cat] = (currCatMap[cat] ?? 0) + exp.value;
    }

    let biggestCatIncrease = { cat: '', pct: 0, abs: 0 };
    for (const [cat, curr] of Object.entries(currCatMap)) {
      const prev = prevCatMap[cat] ?? 0;
      if (prev > 0) {
        const pct = ((curr - prev) / prev) * 100;
        if (pct > biggestCatIncrease.pct && curr > 50) {
          biggestCatIncrease = { cat, pct, abs: curr - prev };
        }
      }
    }

    if (biggestCatIncrease.pct > 30) {
      insights.push({
        icon: AlertTriangle,
        title: `${biggestCatIncrease.cat} com alta`,
        message: `Gastos com "${biggestCatIncrease.cat}" aumentaram ${biggestCatIncrease.pct.toFixed(0)}% em relação ao mês anterior (+${formatCurrency(biggestCatIncrease.abs)}).`,
        type: 'warning',
        group: 'alerta',
      });
    }

    const biggestCat = Object.entries(currCatMap).sort((a, b) => b[1] - a[1])[0];
    if (biggestCat && current.totals.expenses > 0) {
      const pct = (biggestCat[1] / current.totals.expenses) * 100;
      if (pct > 40) {
        insights.push({
          icon: Target,
          title: `Concentração em ${biggestCat[0]}`,
          message: `${pct.toFixed(0)}% dos seus gastos estão concentrados em "${biggestCat[0]}" (${formatCurrency(biggestCat[1])}). Diversificar pode ajudar no controle.`,
          type: 'info',
          group: 'oportunidade',
        });
      }
    }
  }

  const alerts = current.budgetAlerts?.filter((a) => a.alert) ?? [];
  if (alerts.length > 0) {
    const worst = alerts.sort((a, b) => b.percent - a.percent)[0];
    insights.push({
      icon: AlertTriangle,
      title: `Orçamento de ${worst.category.name} no limite`,
      message: `Você utilizou ${worst.percent.toFixed(0)}% do orçamento de "${worst.category.name}" (${formatCurrency(worst.spent)} de ${formatCurrency(worst.limit)}).`,
      type: worst.percent >= 100 ? 'danger' : 'warning',
      group: 'alerta',
    });
  }

  if (summaries.length >= 3) {
    const positiveMonths = summaries.filter((s) => s.totals.balance > 0).length;
    const pct = (positiveMonths / summaries.length) * 100;
    if (pct >= 80) {
      insights.push({
        icon: CheckCircle2,
        title: 'Alta consistência financeira',
        message: `Você manteve saldo positivo em ${positiveMonths} dos últimos ${summaries.length} meses. Excelente disciplina!`,
        type: 'positive',
        group: 'evolucao',
      });
    } else if (pct < 50) {
      insights.push({
        icon: Target,
        title: 'Consistência abaixo do ideal',
        message: `Apenas ${positiveMonths} dos últimos ${summaries.length} meses tiveram saldo positivo. Revise seus hábitos de gasto.`,
        type: 'warning',
        group: 'oportunidade',
      });
    }
  }

  if (current.totals.fixedExpenseCommitment > 70) {
    insights.push({
      icon: AlertTriangle,
      title: 'Alto comprometimento com fixos',
      message: `${current.totals.fixedExpenseCommitment.toFixed(0)}% da sua renda está comprometida com despesas fixas. O ideal é abaixo de 50%.`,
      type: 'warning',
      group: 'alerta',
    });
  }

  if (current.aiReport?.insights?.length) {
    for (const insight of current.aiReport.insights.slice(0, 2)) {
      insights.push({
        icon: Sparkles,
        title: 'Análise inteligente',
        message: insight,
        type: 'info',
        group: 'oportunidade',
      });
    }
  }

  return insights.slice(0, 8);
}

const GROUP_LABELS: Record<string, string> = {
  alerta: '⚠ Alertas',
  oportunidade: '💡 Oportunidades',
  evolucao: '📈 Evolução',
};

export function SmartInsights({ summaries, current, previous }: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const insights = buildInsights(summaries, current, previous);
  if (insights.length === 0) return null;

  const typeStyles = {
    positive: {
      bg: isDark ? 'rgba(16,185,129,0.08)' : '#ecfdf5',
      border: isDark ? 'rgba(16,185,129,0.2)' : '#a7f3d0',
      color: isDark ? '#6ee7b7' : '#059669',
      titleColor: isDark ? '#a7f3d0' : '#166534',
    },
    warning: {
      bg: isDark ? 'rgba(245,158,11,0.08)' : '#fffbeb',
      border: isDark ? 'rgba(245,158,11,0.2)' : '#fde68a',
      color: isDark ? '#fcd34d' : '#d97706',
      titleColor: isDark ? '#fde68a' : '#92400e',
    },
    danger: {
      bg: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
      border: isDark ? 'rgba(239,68,68,0.2)' : '#fecaca',
      color: isDark ? '#fca5a5' : '#dc2626',
      titleColor: isDark ? '#fecaca' : '#991b1b',
    },
    info: {
      bg: isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
      border: isDark ? 'rgba(99,102,241,0.2)' : '#c7d2fe',
      color: isDark ? '#a5b4fc' : '#4338ca',
      titleColor: isDark ? '#c7d2fe' : '#3730a3',
    },
  };

  const groups = ['alerta', 'oportunidade', 'evolucao'] as const;
  const grouped = groups
    .map((g) => ({
      key: g,
      label: GROUP_LABELS[g],
      items: insights.filter((i) => i.group === g),
    }))
    .filter((g) => g.items.length > 0);

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
          Insights Inteligentes
        </p>
        <p style={{ fontSize: 12, color: t.text.muted, marginTop: 2 }}>
          Análises baseadas nos seus dados reais
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {grouped.map(({ key, label, items }) => (
          <div key={key}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: t.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}
            >
              {label}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 8,
              }}
            >
              {items.map((insight, i) => {
                const styles = typeStyles[insight.type];
                const Icon = insight.icon;
                return (
                  <div
                    key={i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: styles.bg,
                      border: `1px solid ${styles.border}`,
                      display: 'flex',
                      gap: 10,
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: 1 }}>
                      <Icon size={14} style={{ color: styles.color }} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: styles.titleColor,
                          marginBottom: 3,
                        }}
                      >
                        {insight.title}
                      </p>
                      <p style={{ fontSize: 11, color: t.text.secondary, lineHeight: 1.5 }}>
                        {insight.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
