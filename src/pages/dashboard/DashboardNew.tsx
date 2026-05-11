import { useState } from 'react';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { AlertTriangle } from 'lucide-react';

import { useDashboard } from './hooks/useDashboard';
import { KpiGrid } from './components/KpiGrid';
import { TransactionsList } from './components/TransactionsList';
import { MembersContribution } from './components/MembersContribution';
import { FinancialHealth } from './components/FinancialHealth';
import { AIInsight } from './components/AIInsight';
import { CreditCardsSummary } from './components/CreditCardsSummary';
import { UpcomingWeekCard } from '@/pages/calendar/components/UpcomingWeekCard';
import { QuickLaunchInput } from '@/pages/records/components/QuickLaunch/QuickLaunchInput';
import { useGoals } from '@/pages/planning/hooks/useGoals';
import {
  fmt as fmtGoal,
  getBadge,
  getProgressBarColor,
  GOAL_TYPE_META,
} from '@/pages/planning/components/goalUtils';
import { Button, cn } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTheme } from '@/hooks/useTheme';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const DashboardNew = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: summary, isLoading, error } = useDashboard({ month, year });
  const { data: goals = [] } = useGoals();

  const handlePrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const handleNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <PageHeader
          showPeriod
          month={month}
          year={year}
          onPrevMonth={handlePrev}
          onNextMonth={handleNext}
        />
        <SkeletonDashboard
          t={{
            bg: {
              card: isDark ? '#0f172a' : '#ffffff',
              muted: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
              mutedStrong: isDark ? 'rgba(255,255,255,0.10)' : '#e2e8f0',
            },
            border: {
              default: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
              divider: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              subtle: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            },
            shadow: { card: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.06)' },
          }}
        />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-primary-50 border border-primary-200 p-8 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-primary-800">Ops! Algo deu errado.</h2>
        <p className="text-primary-600 max-w-md mx-auto">
          Não conseguimos carregar os dados do seu dashboard.
        </p>
        <Button onClick={() => navigate('/register')}>Começar Agora</Button>
      </div>
    );
  }

  const recentTransactions = _.take(
    _.orderBy(
      [
        ..._.map(_.get(summary, 'details.salaries', []), (s) => ({
          ...s,
          description: 'Salário',
          type: 'income' as const,
          date: new Date((s as any).year, (s as any).month - 1, 5).toISOString(),
        })),
        ..._.map(_.get(summary, 'details.extras', []), (e) => ({ ...e, type: 'income' as const })),
        ..._.map(_.get(summary, 'details.incomes', []), (i) => ({ ...i, type: 'income' as const })),
        ..._.map(_.get(summary, 'details.expenses', []), (e) => ({
          ...e,
          type: 'expense' as const,
        })),
      ],
      [(t) => new Date((t as any).date).getTime()],
      ['desc'],
    ),
    5,
  );

  const budgetAlerts = summary.budgetAlerts ?? [];
  const alertsWithName = budgetAlerts.map((item: any) => ({
    ...item,
    categoryName:
      typeof item.category === 'object' && item.category?.name
        ? item.category.name
        : typeof item.category === 'string'
          ? item.category
          : 'Sem categoria',
  }));

  const activeGoals = goals.filter((g) => g.status !== 'archived');

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        showPeriod
        month={month}
        year={year}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
      />

      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 via-primary-500/10 to-primary-600/20 rounded-3xl blur-sm pointer-events-none" />
        <div className="relative">
          <QuickLaunchInput />
        </div>
      </div>

      <KpiGrid
        balance={summary.totals?.balance || 0}
        incomes={summary.totals?.incomes || 0}
        expenses={summary.totals?.expenses || 0}
        salary={summary.totals?.salary || 0}
        incomeChange={summary.comparison?.incomeChange}
        expenseChange={summary.comparison?.expenseChange}
      />

      {(summary.totals?.incomes > 0 || summary.aiReport) && (
        <AIInsight
          incomes={summary.totals?.incomes || 0}
          expenses={summary.totals?.expenses || 0}
          balance={summary.totals?.balance || 0}
          prevIncomes={
            summary.comparison?.incomeChange !== undefined
              ? (summary.totals?.incomes || 0) - (summary.comparison.incomeChange || 0)
              : undefined
          }
          prevExpenses={
            summary.comparison?.expenseChange !== undefined
              ? (summary.totals?.expenses || 0) - (summary.comparison.expenseChange || 0)
              : undefined
          }
          topCategory={(() => {
            const expenses = summary.details?.expenses ?? [];
            if (!expenses.length) return undefined;
            const byCategory: Record<string, number> = {};
            expenses.forEach((e: any) => {
              const cat = e.category?.name ?? e.categoryName ?? 'Outros';
              byCategory[cat] = (byCategory[cat] || 0) + e.value;
            });
            return Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0];
          })()}
          healthScore={summary.healthScore}
          message={summary.aiReport}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TransactionsList transactions={recentTransactions as any} />
        </div>
        <div>
          <MembersContribution perPerson={summary.perPerson} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FinancialHealth
          score={summary.healthScore ?? 0}
          incomes={summary.totals?.incomes || 0}
          expenses={summary.totals?.expenses || 0}
        />
        <UpcomingWeekCard />
      </div>

      {alertsWithName.length > 0 && (
        <Card title="Alertas de Orçamento" description="Acompanhe o uso do orçamento por categoria">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertsWithName.map((item: any, idx: number) => {
              const pct = Math.min(item.percent, 100);
              const isCrit = item.percent > 90;
              const isWarn = item.percent > 70 && item.percent <= 90;
              const barCls = isCrit ? 'bg-danger-500' : isWarn ? 'bg-amber-400' : 'bg-success-500';
              const cardCls = isCrit
                ? 'border-danger-200 bg-danger-50/40'
                : isWarn
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-primary-100 bg-primary-50/30';
              const pctCls = isCrit
                ? 'text-danger-600'
                : isWarn
                  ? 'text-amber-600'
                  : 'text-success-600';
              return (
                <div
                  key={`${item.categoryName}-${idx}`}
                  className={cn('rounded-xl border p-4 space-y-3', cardCls)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCrit && <AlertTriangle size={13} className="text-danger-500 shrink-0" />}
                      <span className="text-sm font-semibold text-primary-800 capitalize">
                        {item.categoryName}
                      </span>
                    </div>
                    <span className={cn('text-sm font-bold', pctCls)}>
                      {Math.round(item.percent)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', barCls)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-primary-500">
                    <span>
                      Gasto:{' '}
                      <span className="font-semibold text-primary-700">{fmt(item.spent)}</span>
                    </span>
                    <span>
                      Limite:{' '}
                      <span className="font-semibold text-primary-700">{fmt(item.limit)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Previsibilidade de Renda">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-500 font-medium">Renda Fixa</span>
                  <span className="text-primary-800 font-bold">
                    {fmt(summary.totals.fixedIncome || 0)}
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: isDark ? 'rgba(110,231,183,0.12)' : '#dcfce7' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(summary.totals.fixedIncome / summary.totals.incomes) * 100 || 0}%`,
                      background: isDark ? '#6ee7b7' : '#16a34a',
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-500 font-medium">Renda Variável</span>
                  <span className="text-primary-800 font-bold">
                    {fmt(summary.totals.variableIncome || 0)}
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: isDark ? 'rgba(110,231,183,0.12)' : '#dcfce7' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(summary.totals.variableIncome / summary.totals.incomes) * 100 || 0}%`,
                      background: isDark ? '#4ade80' : '#4ade80',
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              className="pt-4"
              style={{
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
              }}
            >
              <p className="text-xs text-primary-400 uppercase font-bold tracking-wider mb-2">
                Índice de Previsibilidade
              </p>
              <div className="flex items-end gap-2">
                <span
                  className="text-3xl font-black"
                  style={{ color: isDark ? '#6ee7b7' : '#166534' }}
                >
                  {(summary.totals.predictableIncomePercent || 0).toFixed(1)}%
                </span>
                <span className="text-sm text-primary-500 pb-1">da renda é garantida</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Estrutura de Gastos">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-500 font-medium">Gastos Fixos</span>
                  <span className="text-primary-800 font-bold">
                    {fmt(summary.totals.fixedExpenses || 0)}
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(summary.totals.fixedExpenses / summary.totals.expenses) * 100 || 0}%`,
                      background: isDark ? '#94a3b8' : '#475569',
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-500 font-medium">Gastos Variáveis</span>
                  <span className="text-primary-800 font-bold">
                    {fmt(summary.totals.variableExpenses || 0)}
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(summary.totals.variableExpenses / summary.totals.expenses) * 100 || 0}%`,
                      background: isDark ? '#fca5a5' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              className="pt-4"
              style={{
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
              }}
            >
              <p className="text-xs text-primary-400 uppercase font-bold tracking-wider mb-2">
                Comprometimento da Renda
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-primary-800">
                  {(summary.totals.fixedExpenseCommitment || 0).toFixed(1)}%
                </span>
                <span className="text-sm text-primary-500 pb-1">da renda mensal</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {activeGoals.length > 0 && (
        <Card
          title="Metas Financeiras"
          description={`${activeGoals.filter((g) => g.status === 'completed').length} de ${activeGoals.length} concluídas`}
          footer={
            <Button
              variant="ghost"
              className="w-full text-primary-600 hover:text-primary-800"
              onClick={() => navigate('/planning')}
            >
              Ver todas as metas
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeGoals.slice(0, 6).map((goal) => {
              const pct = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
              const badge = getBadge(pct);
              const barColor = getProgressBarColor(pct);
              const meta = GOAL_TYPE_META[goal.type ?? 'savings'];
              const Icon = meta.icon;
              const goalCardBg =
                goal.status === 'completed'
                  ? isDark
                    ? 'rgba(110,231,183,0.08)'
                    : '#ecfdf5'
                  : isDark
                    ? 'rgba(255,255,255,0.04)'
                    : '#ffffff';
              const goalCardBdr =
                goal.status === 'completed'
                  ? isDark
                    ? 'rgba(110,231,183,0.2)'
                    : '#d1fae5'
                  : isDark
                    ? 'rgba(255,255,255,0.07)'
                    : '#e2e8f0';
              const goalTitleClr = isDark ? '#e2e8f0' : '#1e293b';
              const goalSubClr = isDark ? '#64748b' : '#94a3b8';
              const goalPctClr = isDark ? '#f1f5f9' : '#1e293b';
              const trackBg = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl border"
                  style={{ background: goalCardBg, borderColor: goalCardBdr }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.bg}`}
                    >
                      <Icon size={13} className={meta.color} />
                    </div>
                    <p
                      className="text-sm font-semibold truncate flex-1"
                      style={{ color: goalTitleClr }}
                    >
                      {goal.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-bold" style={{ color: goalPctClr }}>
                      {pct.toFixed(0)}%
                    </span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: trackBg }}
                  >
                    <div
                      className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: goalSubClr }}>
                    {fmtGoal(goal.currentValue)} / {fmtGoal(goal.targetValue)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <CreditCardsSummary month={month} year={year} />
    </div>
  );
};
