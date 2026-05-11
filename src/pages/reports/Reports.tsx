import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonReports } from '@/components/ui/Skeleton';
import { useTokens } from '@/hooks/useTokens';
import { Calendar } from 'lucide-react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useReportsSummary } from './hooks/useReportsSummary';
import {
  MonthlyEvolution,
  PeriodComparison,
  TopExpenses,
  CategoryTrends,
  ConsistencyIndicator,
  SmartInsights,
} from './components';
import { transformToMonthlyData } from './utils/reports-helpers';

export function Reports() {
  const filters = useUrlFilters({ defaultPage: 1 });
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const selectedPeriod = (parseInt(filters.search) || 6) as 3 | 6 | 12;
  const setSelectedPeriod = (period: 3 | 6 | 12) => filters.setSearch(String(period));

  const { data: summaries, isLoading, error } = useReportsSummary(selectedPeriod);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PageHeader />
        <SkeletonReports t={t} />
      </div>
    );
  }

  if (error || !summaries || summaries.length === 0 || summaries.every((s) => !s)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PageHeader />
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 20,
            padding: '64px 24px',
            textAlign: 'center',
            boxShadow: t.shadow.card,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 700, color: t.text.primary, marginBottom: 6 }}>
            {error ? 'Erro ao carregar relatórios' : 'Nenhum dado disponível'}
          </p>
          <p style={{ fontSize: 13, color: t.text.muted }}>
            {error ? 'Tente novamente mais tarde' : 'Comece registrando suas receitas e despesas'}
          </p>
        </div>
      </div>
    );
  }

  const validSummaries = summaries.filter((s) => !!s) as NonNullable<(typeof summaries)[0]>[];
  const currentSummary = validSummaries[validSummaries.length - 1];
  const prevSummary = validSummaries.length >= 2 ? validSummaries[validSummaries.length - 2] : null;
  const monthlyData = transformToMonthlyData(validSummaries);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader />

      {/* Seletor de período */}
      <div
        style={{
          background: t.bg.card,
          border: `1px solid ${t.border.default}`,
          borderRadius: 14,
          padding: '12px 16px',
          boxShadow: t.shadow.card,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Calendar size={16} style={{ color: t.text.muted, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: t.text.secondary }}>
          Período de análise:
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {([3, 6, 12] as const).map((period) => {
            const active = selectedPeriod === period;
            return (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriod(period)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: active ? '#6366f1' : isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  color: active ? '#fff' : t.text.muted,
                  transition: 'all 0.15s',
                }}
              >
                {period} meses
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparação com período anterior */}
      {prevSummary && <PeriodComparison current={currentSummary} previous={prevSummary} />}

      {/* Evolução mensal com tendências */}
      <MonthlyEvolution data={monthlyData} />

      {/* Consistência financeira */}
      <ConsistencyIndicator summaries={validSummaries} />

      {/* Tendências por categoria */}
      <CategoryTrends summaries={validSummaries} />

      {/* Top gastos do período */}
      <TopExpenses summary={currentSummary} />

      {/* Insights inteligentes */}
      <SmartInsights summaries={validSummaries} current={currentSummary} previous={prevSummary} />
    </div>
  );
}
