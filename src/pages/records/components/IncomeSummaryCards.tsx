import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { financeService } from '@/services/api';
import { ConfirmModal } from '@/components/ui/Modal';
import { useTokens } from '@/hooks/useTokens';
import { Skeleton } from '@/components/ui/Skeleton';
import { Edit2, Trash2, ChevronDown } from 'lucide-react';
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
  const personAccents = [t.extra, t.investment, t.income, t.expense];
  const accentFor = (i: number) => personAccents[i % personAccents.length];
  const [expanded, setExpanded] = useState(false);
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

  const extras = Array.isArray(extrasData) ? extrasData : (extrasData as any)?.data || [];
  const isLoading = isLoadingIncomes || isLoadingExtras;

  const handleConfirmDelete = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete.id, itemToDelete.type);
      setItemToDelete(null);
    }
  };

  if (isLoading) return <Skeleton height={120} borderRadius={16} />;

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
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: t.bg.card,
          border: `1px solid ${t.border.default}`,
          boxShadow: t.shadow.card,
        }}
      >
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: expanded ? `1px solid ${t.border.divider}` : 'none' }}
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold" style={{ color: t.text.primary }}>
              Renda Familiar
            </p>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: t.income.bgIcon,
                color: t.income.text,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {fmt(familyTotal)}
            </span>
          </div>
          <ChevronDown
            size={15}
            style={{
              color: t.text.muted,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {/* Collapsed: barra compacta com avatares */}
        {!expanded && (
          <div className="px-5 py-3 flex items-center gap-3 flex-wrap">
            {personSummaries.map(({ person, total }, idx) => {
              const pct = familyTotal > 0 ? (total / familyTotal) * 100 : 0;
              const accent = accentFor(idx);
              const initials = person.name
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div key={person.id} className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: accent.bgIcon, color: accent.text }}
                  >
                    {initials}
                  </div>
                  <span className="text-xs font-medium truncate" style={{ color: t.text.secondary }}>
                    {person.name.split(' ')[0]}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: t.text.primary, fontFamily: "'Space Mono', monospace" }}
                  >
                    {fmt(total)}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: t.text.subtle, fontFamily: "'Space Mono', monospace" }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                  {idx < personSummaries.length - 1 && (
                    <span style={{ color: t.border.subtle, marginLeft: 4 }}>·</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Expanded: lista detalhada por pessoa */}
        {expanded && (
          <div className="divide-y" style={{ borderColor: t.border.divider }}>
            {personSummaries.map(({ person, total, incomes: pIncomes, extras: pExtras }, idx) => {
              const pct = familyTotal > 0 ? (total / familyTotal) * 100 : 0;
              const accent = accentFor(idx);
              const initials = person.name
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              const allItems = [
                ...pIncomes.map((i: any) => ({ ...i, kind: 'income' as const })),
                ...pExtras.map((e: any) => ({ ...e, kind: 'extra' as const })),
              ];
              const singleItem = allItems.length === 1 ? allItems[0] : null;

              return (
                <div key={person.id} className="px-5 py-3.5">
                  {/* Pessoa: avatar + nome + barra + valor + ações */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: accent.bgIcon, color: accent.text }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-sm font-bold truncate block mb-1.5"
                        style={{ color: t.text.primary }}
                      >
                        {person.name.split(' ')[0]}
                      </span>
                      {/* Barra de progresso */}
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ background: t.bg.mutedStrong }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: accent.textAlt }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: t.text.primary, fontFamily: "'Space Mono', monospace" }}
                      >
                        {fmt(total)}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: t.text.subtle, fontFamily: "'Space Mono', monospace" }}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    {singleItem && (
                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        <button
                          onClick={() => navigate(`/record/edit/${singleItem.id}`)}
                          className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors"
                          style={{ borderColor: t.border.default, color: t.text.muted }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = t.bg.mutedStrong;
                            (e.currentTarget as HTMLElement).style.color = t.text.primary;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = t.text.muted;
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({
                              id: singleItem.id,
                              type: singleItem.kind,
                              description: singleItem.description,
                            })
                          }
                          className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors"
                          style={{ borderColor: t.border.default, color: t.text.muted }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = t.expense.bgIcon;
                            (e.currentTarget as HTMLElement).style.color = t.expense.text;
                            (e.currentTarget as HTMLElement).style.borderColor = t.expense.border;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = t.text.muted;
                            (e.currentTarget as HTMLElement).style.borderColor = t.border.default;
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Itens individuais — só quando há mais de um lançamento */}
                  {allItems.length > 1 && (
                    <div className="ml-12 mt-2 space-y-0.5">
                      {allItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1 group">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{
                                background: item.kind === 'income' ? t.income.text : t.investment.text,
                              }}
                            />
                            <span className="text-xs truncate" style={{ color: t.text.muted }}>
                              {item.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span
                              className="text-xs font-semibold"
                              style={{
                                color: item.kind === 'income' ? t.income.text : t.investment.text,
                                fontFamily: "'Space Mono', monospace",
                              }}
                            >
                              {fmt(item.value)}
                            </span>
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => navigate(`/record/edit/${item.id}`)}
                                className="p-1 rounded transition-colors"
                                style={{ color: t.text.muted }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = t.bg.mutedStrong)}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={() =>
                                  setItemToDelete({ id: item.id, type: item.kind, description: item.description })
                                }
                                className="p-1 rounded transition-colors"
                                style={{ color: t.text.muted }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLElement).style.background = t.expense.bgIcon;
                                  (e.currentTarget as HTMLElement).style.color = t.expense.text;
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                                  (e.currentTarget as HTMLElement).style.color = t.text.muted;
                                }}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
