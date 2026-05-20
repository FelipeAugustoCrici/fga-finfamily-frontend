import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { ActionButton } from '@/components/ui/ActionButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTokens } from '@/hooks/useTokens';
import { BudgetFormModal } from '../components/BudgetFormModal';
import { useBudgets } from '../hooks/useBudgets';
import { useDeleteBudget } from '../hooks/useDeleteBudget';
import { api } from '@/services/api.service';
import { financeService } from '@/services/api';
import { PiggyBank } from 'lucide-react';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const MONTHS_FULL = [
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

function getStatusColor(pct: number, isDark: boolean) {
  if (pct >= 90)
    return {
      bar: ['#f87171', '#ef4444'],
      glow: 'rgba(239,68,68,0.35)',
      text: isDark ? '#fca5a5' : '#dc2626',
      bg: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2',
      border: isDark ? 'rgba(239,68,68,0.25)' : '#fecaca',
    };
  if (pct >= 70)
    return {
      bar: ['#fbbf24', '#f59e0b'],
      glow: 'rgba(245,158,11,0.35)',
      text: isDark ? '#fcd34d' : '#d97706',
      bg: isDark ? 'rgba(245,158,11,0.10)' : '#fffbeb',
      border: isDark ? 'rgba(245,158,11,0.25)' : '#fde68a',
    };
  return {
    bar: ['#34d399', '#10b981'],
    glow: 'rgba(16,185,129,0.35)',
    text: isDark ? '#6ee7b7' : '#059669',
    bg: isDark ? 'rgba(16,185,129,0.10)' : '#ecfdf5',
    border: isDark ? 'rgba(16,185,129,0.25)' : '#a7f3d0',
  };
}

export function BudgetsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data } = await api.get('/finance/families');
      return data;
    },
  });
  const familyId = families[0]?.id || '';

  const { data: budgets = [], isLoading } = useBudgets(currentMonth, currentYear);

  const { data: expensesData } = useQuery({
    queryKey: ['expenses', currentMonth, currentYear, familyId, undefined, 1, 999],
    queryFn: () =>
      financeService.getExpenses(currentMonth, currentYear, familyId, undefined, 1, 999),
    enabled: !!familyId && budgets.length > 0,
  });

  const expenses = expensesData?.data ?? [];

  const spentByCategory: Record<string, number> = {};
  for (const exp of expenses) {
    const key = (exp.categoryName || '').toLowerCase();
    spentByCategory[key] = (spentByCategory[key] ?? 0) + (exp.value ?? 0);
  }

  const deleteBudget = useDeleteBudget();

  const totalLimit = budgets.reduce((s, b) => s + b.limitValue, 0);
  const totalSpent = budgets.reduce((s, b) => {
    const key = (b.categoryName || b.category?.name || '').toLowerCase();
    return s + (spentByCategory[key] ?? 0);
  }, 0);
  const overBudget = budgets.filter((b) => {
    const key = (b.categoryName || b.category?.name || '').toLowerCase();
    const spent = spentByCategory[key] ?? 0;
    return spent > b.limitValue;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        actions={<ActionButton onClick={() => setModalOpen(true)}>Novo Orçamento</ActionButton>}
      />

      {}
      {!isLoading && budgets.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {[
            {
              label: 'Total orçado',
              value: fmt(totalLimit),
              color: t.text.link,
              icon: <PiggyBank size={16} />,
            },
            {
              label: 'Total gasto',
              value: fmt(totalSpent),
              color:
                totalSpent > totalLimit
                  ? isDark
                    ? '#fca5a5'
                    : '#dc2626'
                  : isDark
                    ? '#6ee7b7'
                    : '#059669',
              icon: <TrendingUp size={16} />,
            },
            {
              label: 'Categorias acima',
              value: `${overBudget.length}`,
              color: overBudget.length > 0 ? (isDark ? '#fcd34d' : '#d97706') : t.text.muted,
              icon: <AlertTriangle size={16} />,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: t.bg.card,
                border: `1px solid ${t.border.default}`,
                borderRadius: 14,
                padding: '14px 18px',
                boxShadow: t.shadow.card,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ color: item.color, opacity: 0.8 }}>{item.icon}</div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: item.color, lineHeight: 1 }}>
                  {item.value}
                </p>
                <p style={{ fontSize: 11, color: t.text.muted, marginTop: 3 }}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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
            <Skeleton key={i} height={160} borderRadius={16} />
          ))}
        </div>
      )}

      {}
      {!isLoading && budgets.length === 0 && (
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
            <PiggyBank size={28} color="#6366f1" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text.primary, marginBottom: 8 }}>
            Nenhum orçamento definido
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
            Defina limites por categoria e acompanhe seus gastos em tempo real
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ActionButton onClick={() => setModalOpen(true)}>Criar primeiro orçamento</ActionButton>
          </div>
        </div>
      )}

      {}
      {!isLoading && budgets.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {budgets.map((budget) => {
            const catKey = (budget.categoryName || budget.category?.name || '').toLowerCase();
            const catLabel = budget.category?.name || budget.categoryName;
            const spent = spentByCategory[catKey] ?? 0;
            const pct = Math.min((spent / budget.limitValue) * 100, 100);
            const colors = getStatusColor(pct, isDark);
            const remaining = Math.max(budget.limitValue - spent, 0);
            const isOver = spent > budget.limitValue;

            return (
              <div
                key={budget.id}
                style={{
                  background: t.bg.card,
                  border: `1px solid ${isOver ? colors.border : t.border.default}`,
                  borderRadius: 18,
                  padding: '20px',
                  boxShadow: t.shadow.card,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  transition: 'transform 0.18s, box-shadow 0.18s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.cardLg;
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
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: colors.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PiggyBank size={18} style={{ color: colors.text }} />
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
                        {catLabel}
                      </p>
                      <p style={{ fontSize: 11, color: t.text.muted, marginTop: 2 }}>
                        {MONTHS_FULL[budget.month - 1]} {budget.year}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteId(budget.id)}
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
                      flexShrink: 0,
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

                {}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <span
                    style={{ fontSize: 30, fontWeight: 900, color: colors.text, lineHeight: 1 }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: t.text.primary }}>
                      {fmt(spent)}
                    </p>
                    <p style={{ fontSize: 11, color: t.text.subtle }}>
                      de {fmt(budget.limitValue)}
                    </p>
                  </div>
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
                      background: `linear-gradient(90deg, ${colors.bar[0]}, ${colors.bar[1]})`,
                      boxShadow: `0 0 8px ${colors.glow}`,
                      transition: 'width 0.7s ease',
                    }}
                  />
                </div>

                {}
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isOver ? (
                    <AlertTriangle size={12} style={{ color: colors.text, flexShrink: 0 }} />
                  ) : (
                    <TrendingUp size={12} style={{ color: colors.text, flexShrink: 0 }} />
                  )}
                  <p style={{ fontSize: 11, color: colors.text }}>
                    {isOver
                      ? `Limite excedido em ${fmt(spent - budget.limitValue)}`
                      : pct >= 70
                        ? `Atenção: restam apenas ${fmt(remaining)}`
                        : `Restam ${fmt(remaining)} disponíveis`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BudgetFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} familyId={familyId} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Remover Orçamento">
        <p style={{ color: t.text.secondary, marginBottom: 24, fontSize: 14 }}>
          Tem certeza que deseja excluir este orçamento?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (deleteId) {
                deleteBudget.mutate(deleteId);
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
