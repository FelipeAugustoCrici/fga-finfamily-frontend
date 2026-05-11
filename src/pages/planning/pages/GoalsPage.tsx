import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, Plus, Trash2, PlusCircle, Eye, TrendingUp, Calendar, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { ActionButton } from '@/components/ui/ActionButton';
import { GoalFormModal } from '../components/GoalFormModal';
import { GoalContributionModal } from '../components/GoalContributionModal';
import { GoalDetailModal } from '../components/GoalDetailModal';
import { useGoals } from '../hooks/useGoals';
import { useDeleteGoal } from '../hooks/useDeleteGoal';
import {
  fmt,
  getBadge,
  getMotivation,
  getProgressBarColor,
  GOAL_TYPE_META,
  computeInsights,
} from '../components/goalUtils';
import { api } from '@/services/api.service';
import { useTokens } from '@/hooks/useTokens';
import type { Goal } from '../types/planning.types';

const PROGRESS_COLORS: Record<string, { from: string; to: string; glow: string }> = {
  'from-emerald-400 to-emerald-600': {
    from: '#34d399',
    to: '#059669',
    glow: 'rgba(52,211,153,0.35)',
  },
  'from-amber-400 to-amber-500': { from: '#fbbf24', to: '#f59e0b', glow: 'rgba(251,191,36,0.35)' },
  'from-sky-400 to-sky-600': { from: '#38bdf8', to: '#0284c7', glow: 'rgba(56,189,248,0.35)' },
  'from-primary-400 to-primary-600': {
    from: '#818cf8',
    to: '#6366f1',
    glow: 'rgba(99,102,241,0.35)',
  },
};

export function GoalsPage() {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data } = await api.get('/finance/families');
      return data;
    },
  });
  const familyId = families[0]?.id || '';

  const { data: goals = [], isLoading } = useGoals();
  const deleteGoal = useDeleteGoal();

  const _active = goals.filter((g) => g.status !== 'archived' && g.currentValue / g.targetValue < 1);
  const _completed = goals.filter(
    (g) => g.status === 'completed' || g.currentValue / g.targetValue >= 1,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        actions={<ActionButton onClick={() => setModalOpen(true)}>Nova Meta</ActionButton>}
      />

      {}
      {isLoading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 220,
                borderRadius: 16,
                background: t.bg.muted,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {}
      {!isLoading && goals.length === 0 && (
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 20,
            padding: '56px 24px',
            textAlign: 'center',
            boxShadow: t.shadow.card,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 20,
              background: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff',
              marginBottom: 16,
            }}
          >
            <Target size={28} color="#6366f1" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text.primary, marginBottom: 8 }}>
            Nenhuma meta cadastrada
          </h3>
          <p
            style={{
              fontSize: 13,
              color: t.text.muted,
              marginBottom: 24,
              maxWidth: 320,
              margin: '0 auto 24px',
            }}
          >
            Crie sua primeira meta financeira e comece a acompanhar seu progresso
          </p>
          <ActionButton onClick={() => setModalOpen(true)}>Criar primeira meta</ActionButton>
        </div>
      )}

      {}
      {!isLoading && goals.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {goals.map((goal) => {
            const pct = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
            const badge = getBadge(pct);
            const motivation = getMotivation(pct);
            const barColorKey = getProgressBarColor(pct);
            const barColors =
              PROGRESS_COLORS[barColorKey] ?? PROGRESS_COLORS['from-primary-400 to-primary-600'];
            const meta = GOAL_TYPE_META[goal.type ?? 'savings'];
            const Icon = meta.icon;
            const isCompleted = goal.status === 'completed' || pct >= 100;
            const insights = computeInsights(
              goal.contributions ?? [],
              goal.targetValue,
              goal.currentValue,
              goal.deadline,
            );

            const cardAccent = isCompleted
              ? {
                  border: isDark ? 'rgba(52,211,153,0.25)' : '#a7f3d0',
                  glow: 'rgba(52,211,153,0.06)',
                }
              : { border: t.border.default, glow: 'transparent' };

            return (
              <div
                key={goal.id}
                style={{
                  background: t.bg.card,
                  border: `1px solid ${cardAccent.border}`,
                  borderRadius: 18,
                  padding: '20px',
                  boxShadow: `${t.shadow.card}, 0 0 0 0 ${cardAccent.glow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `${t.shadow.cardLg}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.card;
                }}
              >
                {}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}
                  >
                    {}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDark
                          ? `${barColors.glow}`
                          : meta.bg.replace('bg-', '') === 'emerald-50'
                            ? '#ecfdf5'
                            : meta.bg.includes('rose')
                              ? '#fff1f2'
                              : meta.bg.includes('violet')
                                ? '#f5f3ff'
                                : '#f0f9ff',
                      }}
                    >
                      <Icon size={18} style={{ color: barColors.from }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: t.text.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {goal.description}
                      </p>
                      {}
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          marginTop: 3,
                          background: isDark ? `${barColors.glow}` : undefined,
                          color: barColors.from,
                          border: `1px solid ${isDark ? barColors.glow : barColors.from + '40'}`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {}
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <button
                      onClick={() => setDetailGoal(goal)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: t.text.muted,
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = t.bg.muted;
                        e.currentTarget.style.color = t.text.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = t.text.muted;
                      }}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(goal.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: t.text.muted,
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark
                          ? 'rgba(252,165,165,0.1)'
                          : '#fff1f2';
                        e.currentTarget.style.color = isDark ? '#fca5a5' : '#e11d48';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = t.text.muted;
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: barColors.from,
                        lineHeight: 1,
                      }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                    <span style={{ fontSize: 11, color: t.text.muted, textAlign: 'right' }}>
                      {fmt(goal.currentValue)}
                      <br />
                      <span style={{ color: t.text.subtle }}>de {fmt(goal.targetValue)}</span>
                    </span>
                  </div>

                  {}
                  <div
                    style={{
                      width: '100%',
                      height: 8,
                      borderRadius: 999,
                      background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 999,
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${barColors.from}, ${barColors.to})`,
                        boxShadow: `0 0 8px ${barColors.glow}`,
                        transition: 'width 0.7s ease',
                      }}
                    />
                  </div>

                  <p style={{ fontSize: 11, color: t.text.muted, fontStyle: 'italic' }}>
                    {motivation}
                  </p>
                </div>

                {}
                {!isCompleted && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {[
                      {
                        icon: <Plus size={9} />,
                        label: 'Este mês',
                        value:
                          insights.thisMonthTotal > 0 ? `+${fmt(insights.thisMonthTotal)}` : '—',
                        color:
                          insights.thisMonthTotal > 0
                            ? isDark
                              ? '#6ee7b7'
                              : '#166534'
                            : t.text.muted,
                      },
                      {
                        icon: <Minus size={9} />,
                        label: 'Falta',
                        value: fmt(insights.remaining),
                        color: isDark ? '#fca5a5' : '#be123c',
                      },
                      {
                        icon: <Calendar size={9} />,
                        label: 'Previsão',
                        value:
                          insights.estimatedMonths === null
                            ? '—'
                            : insights.estimatedMonths === 0
                              ? 'Pronto'
                              : `~${insights.estimatedMonths}m`,
                        color: isDark ? '#fcd34d' : '#92400e',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          padding: '8px 6px',
                          borderRadius: 10,
                          textAlign: 'center',
                          background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                          border: `1px solid ${t.border.subtle}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 9,
                            color: t.text.subtle,
                            marginBottom: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                          }}
                        >
                          {item.icon} {item.label}
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: item.color }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {}
                {!isCompleted && insights.monthlyAvg !== null && insights.monthlyAvg > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: isDark ? 'rgba(56,189,248,0.08)' : '#f0f9ff',
                      border: `1px solid ${isDark ? 'rgba(56,189,248,0.15)' : '#bae6fd'}`,
                    }}
                  >
                    <TrendingUp
                      size={12}
                      style={{ color: isDark ? '#38bdf8' : '#0284c7', flexShrink: 0 }}
                    />
                    <p style={{ fontSize: 11, color: isDark ? '#7dd3fc' : '#0369a1' }}>
                      Média {fmt(insights.monthlyAvg)}/mês
                      {insights.estimatedMonths !== null &&
                        insights.estimatedMonths > 0 &&
                        ` · conclui em ${insights.estimatedMonths} ${insights.estimatedMonths === 1 ? 'mês' : 'meses'}`}
                    </p>
                  </div>
                )}

                {}
                {!isCompleted &&
                  insights.suggestedMonthly !== null &&
                  insights.suggestedMonthly > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: isDark ? 'rgba(167,139,250,0.08)' : '#f5f3ff',
                        border: `1px solid ${isDark ? 'rgba(167,139,250,0.15)' : '#ddd6fe'}`,
                      }}
                    >
                      <Calendar
                        size={12}
                        style={{ color: isDark ? '#a78bfa' : '#7c3aed', flexShrink: 0 }}
                      />
                      <p style={{ fontSize: 11, color: isDark ? '#c4b5fd' : '#5b21b6' }}>
                        Guardar {fmt(insights.suggestedMonthly)}/mês para bater o prazo
                      </p>
                    </div>
                  )}

                {}
                {!isCompleted ? (
                  <button
                    onClick={() => setContributeGoal(goal)}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      borderRadius: 12,
                      border: `1.5px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#c7d2fe'}`,
                      background: isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
                      color: isDark ? '#a5b4fc' : '#4338ca',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark
                        ? 'rgba(99,102,241,0.15)'
                        : '#e0e7ff';
                      e.currentTarget.style.borderColor = isDark
                        ? 'rgba(99,102,241,0.5)'
                        : '#a5b4fc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDark
                        ? 'rgba(99,102,241,0.08)'
                        : '#eef2ff';
                      e.currentTarget.style.borderColor = isDark
                        ? 'rgba(99,102,241,0.3)'
                        : '#c7d2fe';
                    }}
                  >
                    <PlusCircle size={14} /> Adicionar valor
                  </button>
                ) : (
                  <div
                    style={{
                      padding: '10px 0',
                      borderRadius: 12,
                      textAlign: 'center',
                      background: isDark ? 'rgba(52,211,153,0.10)' : '#ecfdf5',
                      border: `1px solid ${isDark ? 'rgba(52,211,153,0.2)' : '#a7f3d0'}`,
                      color: isDark ? '#6ee7b7' : '#166534',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    🎉 Meta concluída!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {}
      <GoalFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} familyId={familyId} />

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
        <p style={{ color: t.text.secondary, marginBottom: 24, fontSize: 14 }}>
          Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (deleteId) {
                deleteGoal.mutate(deleteId);
                setDeleteId(null);
              }
            }}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
