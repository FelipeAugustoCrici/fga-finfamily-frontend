import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { financeService } from '@/services/api';
import { ConfirmModal } from '@/components/ui/Modal';
import { useTokens } from '@/hooks/useTokens';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import _ from 'lodash';

interface IncomeSummaryCardsProps {
  month: number;
  year: number;
  familyId?: string;
  people: Array<{ id: string; name: string }>;
  onDelete?: (id: string, type: 'income' | 'extra') => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function IncomeSummaryCards({
  month,
  year,
  familyId,
  people,
  onDelete,
}: IncomeSummaryCardsProps) {
  const navigate = useNavigate();
  const t = useTokens();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: 'income' | 'extra';
    description: string;
  } | null>(null);

  const { data: incomes = [], isLoading: isLoadingIncomes } = useQuery({
    queryKey: ['incomes-summary', month, year, familyId],
    queryFn: () => financeService.getIncomes(month, year, familyId),
    enabled: !!familyId,
  });

  const { data: extrasData, isLoading: isLoadingExtras } = useQuery({
    queryKey: ['extras-summary', month, year],
    queryFn: () => financeService.getExtras(month, year),
  });

  const extras = Array.isArray(extrasData) ? extrasData : extrasData?.data || [];
  const isLoading = isLoadingIncomes || isLoadingExtras;

  const toggleCard = (personId: string) =>
    setExpandedCards((prev) => ({ ...prev, [personId]: !prev[personId] }));

  const handleConfirmDelete = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete.id, itemToDelete.type);
      setItemToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={144} borderRadius={18} />
        ))}
      </div>
    );
  }

  const incomesByPerson = _.groupBy(incomes, 'personId');
  const extrasByPerson = _.groupBy(extras, 'personId');

  const personSummaries = people
    .map((person) => {
      const personIncomes = incomesByPerson[person.id] || [];
      const personExtras = extrasByPerson[person.id] || [];
      const salary = _.sumBy(personIncomes, 'value');
      const bonus = _.sumBy(personExtras, 'value');
      const total = salary + bonus;
      return { person, salary, bonus, total, incomes: personIncomes, extras: personExtras };
    })
    .filter((s) => s.total > 0);

  if (personSummaries.length === 0) return null;

  const familyTotal = _.sumBy(personSummaries, 'total');

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personSummaries.map(
          ({ person, salary, bonus, total, incomes: pIncomes, extras: pExtras }) => {
            const isExpanded = expandedCards[person.id];
            const hasItems = pIncomes.length > 0 || pExtras.length > 0;
            const familyPct = familyTotal > 0 ? (total / familyTotal) * 100 : 0;
            const initials = person.name
              .split(' ')
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={person.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: t.bg.card,
                  border: `1px solid ${t.border.default}`,
                  boxShadow: t.shadow.card,
                }}
              >
                <div className="p-5">
                  {}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: t.income.bgIcon,
                          color: t.income.text,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: t.text.primary }}>
                          {person.name}
                        </p>
                        <p className="text-xs" style={{ color: t.text.subtle }}>
                          Rendimentos do mês
                        </p>
                      </div>
                    </div>
                    {hasItems && (
                      <button
                        onClick={() => toggleCard(person.id)}
                        className="p-1.5 rounded-lg transition-all duration-200"
                        style={{ color: t.text.muted }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.muted)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <ChevronDown
                          size={16}
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </button>
                    )}
                  </div>

                  {}
                  <div className="mb-4">
                    <p className="text-2xl font-black" style={{ color: t.income.text }}>
                      {fmt(total)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: t.text.subtle }}>
                      {familyPct.toFixed(0)}% da renda familiar
                    </p>
                  </div>

                  {}
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden mb-4"
                    style={{ background: t.bg.mutedStrong }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${familyPct}%`,
                        background: `linear-gradient(90deg, ${t.income.text}, ${t.income.textAlt})`,
                      }}
                    />
                  </div>

                  {}
                  <div className="flex items-center gap-3">
                    {salary > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: t.income.text }}
                        />
                        <span className="text-xs" style={{ color: t.text.muted }}>
                          Salário{' '}
                          <span style={{ color: t.text.secondary, fontWeight: 600 }}>
                            {fmt(salary)}
                          </span>
                        </span>
                      </div>
                    )}
                    {bonus > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: t.investment.text }}
                        />
                        <span className="text-xs" style={{ color: t.text.muted }}>
                          Extra{' '}
                          <span style={{ color: t.text.secondary, fontWeight: 600 }}>
                            {fmt(bonus)}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {}
                {isExpanded && hasItems && (
                  <div
                    className="px-5 pb-4 pt-3 space-y-1"
                    style={{ borderTop: `1px solid ${t.border.divider}` }}
                  >
                    {[
                      ...pIncomes.map((i: any) => ({ ...i, kind: 'income' as const })),
                      ...pExtras.map((e: any) => ({ ...e, kind: 'extra' as const })),
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 group">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background:
                                item.kind === 'income' ? t.income.text : t.investment.text,
                            }}
                          />
                          <span className="text-xs truncate" style={{ color: t.text.secondary }}>
                            {item.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span
                            className="text-xs font-semibold"
                            style={{
                              color: item.kind === 'income' ? t.income.text : t.investment.text,
                            }}
                          >
                            {fmt(item.value)}
                          </span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              onClick={() => navigate(`/record/edit/${item.id}`)}
                              className="p-1 rounded transition-colors"
                              style={{ color: t.text.muted }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = t.bg.mutedStrong)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = 'transparent')
                              }
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() =>
                                setItemToDelete({
                                  id: item.id,
                                  type: item.kind,
                                  description: item.description,
                                })
                              }
                              className="p-1 rounded transition-colors"
                              style={{ color: t.text.muted }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background =
                                  t.expense.bgIcon;
                                (e.currentTarget as HTMLElement).style.color = t.expense.text;
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = t.text.muted;
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Excluir ${itemToDelete?.type === 'income' ? 'Salário' : 'Bônus'}`}
        description={`Tem certeza que deseja excluir "${itemToDelete?.description}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
