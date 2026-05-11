import { useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Target, Plus, Trash2, PlusCircle, Eye, TrendingUp, Calendar, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useGoals } from '../hooks/useGoals';
import { useDeleteGoal } from '../hooks/useDeleteGoal';
import { GoalContributionModal } from './GoalContributionModal';
import { GoalDetailModal } from './GoalDetailModal';
import {
  fmt,
  getBadge,
  getMotivation,
  getProgressBarColor,
  GOAL_TYPE_META,
  computeInsights,
} from './goalUtils';
import type { Goal } from '../types/planning.types';

export function GoalsCard({ onCreateNew }: { onCreateNew: () => void }) {
  const { data: goals = [], isLoading } = useGoals();
  const deleteGoal = useDeleteGoal();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);

  const confirmDelete = () => {
    if (deleteId) {
      deleteGoal.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <Card title="Metas Financeiras">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} borderRadius={14} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card title="Metas Financeiras">
        <div className="space-y-4">
          <Button onClick={onCreateNew} className="w-full" variant="primary">
            <Plus size={16} className="mr-2" />
            Nova Meta
          </Button>

          {goals.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Target size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma meta ainda</p>
              <p className="text-xs mt-1">Crie sua primeira meta financeira!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => {
                const pct = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                const badge = getBadge(pct);
                const motivation = getMotivation(pct);
                const barColor = getProgressBarColor(pct);
                const meta = GOAL_TYPE_META[goal.type ?? 'savings'];
                const Icon = meta.icon;
                const completed = goal.status === 'completed' || pct >= 100;
                const insights = computeInsights(
                  goal.contributions ?? [],
                  goal.targetValue,
                  goal.currentValue,
                  goal.deadline,
                );

                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-xl border transition-all ${
                      completed
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}
                        >
                          <Icon size={15} className={meta.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {goal.description}
                          </p>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <button
                          onClick={() => setDetailGoal(goal)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(goal.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-slate-800">{pct.toFixed(0)}%</span>
                        <span className="text-xs text-slate-500">
                          {fmt(goal.currentValue)} / {fmt(goal.targetValue)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 italic">{motivation}</p>
                    </div>

                    {}
                    {!completed && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                          <p className="text-xs text-slate-400 mb-0.5 flex items-center justify-center gap-0.5">
                            <Plus size={9} /> Este mês
                          </p>
                          <p
                            className={`text-xs font-bold ${insights.thisMonthTotal > 0 ? 'text-emerald-600' : 'text-slate-400'}`}
                          >
                            {insights.thisMonthTotal > 0 ? `+${fmt(insights.thisMonthTotal)}` : '—'}
                          </p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                          <p className="text-xs text-slate-400 mb-0.5 flex items-center justify-center gap-0.5">
                            <Minus size={9} /> Falta
                          </p>
                          <p className="text-xs font-bold text-rose-500">
                            {fmt(insights.remaining)}
                          </p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                          <p className="text-xs text-slate-400 mb-0.5 flex items-center justify-center gap-0.5">
                            <Calendar size={9} /> Previsão
                          </p>
                          <p className="text-xs font-bold text-amber-600">
                            {insights.estimatedMonths === null
                              ? '—'
                              : insights.estimatedMonths === 0
                                ? 'Concluída'
                                : `~${insights.estimatedMonths}m`}
                          </p>
                        </div>
                      </div>
                    )}

                    {}
                    {!completed && insights.monthlyAvg !== null && insights.monthlyAvg > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-50 border border-sky-100 rounded-lg mb-3">
                        <TrendingUp size={11} className="text-sky-500 shrink-0" />
                        <p className="text-xs text-sky-700">
                          Média {fmt(insights.monthlyAvg)}/mês
                          {insights.estimatedMonths !== null &&
                            insights.estimatedMonths > 0 &&
                            ` → conclui em ${insights.estimatedMonths} ${insights.estimatedMonths === 1 ? 'mês' : 'meses'}`}
                        </p>
                      </div>
                    )}

                    {}
                    {!completed &&
                      insights.suggestedMonthly !== null &&
                      insights.suggestedMonthly > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-50 border border-violet-100 rounded-lg mb-3">
                          <Calendar size={11} className="text-violet-500 shrink-0" />
                          <p className="text-xs text-violet-700">
                            Guardar {fmt(insights.suggestedMonthly)}/mês para bater o prazo
                          </p>
                        </div>
                      )}

                    {!completed ? (
                      <button
                        onClick={() => setContributeGoal(goal)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-100 transition-colors"
                      >
                        <PlusCircle size={13} />
                        Adicionar valor
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        🎉 Meta concluída!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {contributeGoal && (
        <GoalContributionModal
          goal={contributeGoal}
          isOpen={!!contributeGoal}
          onClose={() => setContributeGoal(null)}
        />
      )}

      {detailGoal && (
        <GoalDetailModal
          goal={detailGoal}
          isOpen={!!detailGoal}
          onClose={() => setDetailGoal(null)}
          onContribute={() => setContributeGoal(detailGoal)}
        />
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar Exclusão">
        <p className="text-slate-600 mb-6">Tem certeza que deseja excluir esta meta?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmDelete}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </>
  );
}
