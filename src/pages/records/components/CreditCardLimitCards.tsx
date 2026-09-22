import { useState } from 'react';
import { ChevronDown, CreditCard, PiggyBank, Wallet } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCreditCards } from '@/pages/credit-cards/hooks/useCreditCards';
import { ResumoCard } from './RecordsResumoCards';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

interface Props {
  familyId?: string;
}

export function CreditCardLimitCards({ familyId }: Props) {
  const t = useTokens();
  const [expanded, setExpanded] = useState(false);
  const { data: creditCards, isLoading } = useCreditCards(familyId);
  const cards = (creditCards ?? []).filter((c) => c.isActive);

  if (!familyId || isLoading) {
    return <Skeleton height={56} borderRadius={16} />;
  }

  if (cards.length === 0) return null;

  const limitTotal = cards.reduce((sum, c) => sum + c.limitAmount, 0);
  const limitAvailable = cards.reduce((sum, c) => sum + c.availableLimit, 0);
  const limitUsed = limitTotal - limitAvailable;
  const usedPercent = limitTotal > 0 ? (limitUsed / limitTotal) * 100 : 0;
  const cardCountLabel = `${cards.length} cartão${cards.length !== 1 ? 'ões' : ''}`;

  return (
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
            Cartões de Crédito
          </p>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: t.income.bgIcon,
              color: t.income.text,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {fmt(limitAvailable)} livres
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

      {/* Collapsed: barra compacta */}
      {!expanded && (
        <div className="px-5 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium" style={{ color: t.text.secondary }}>
            {cardCountLabel}
          </span>
          <span style={{ color: t.border.subtle }}>·</span>
          <span className="text-xs" style={{ color: t.text.muted }}>
            Usado{' '}
            <span
              className="font-bold"
              style={{ color: t.expense.text, fontFamily: "'Space Mono', monospace" }}
            >
              {fmt(limitUsed)}
            </span>{' '}
            ({usedPercent.toFixed(0)}%)
          </span>
          <span style={{ color: t.border.subtle }}>·</span>
          <span className="text-xs" style={{ color: t.text.muted }}>
            Total{' '}
            <span
              className="font-bold"
              style={{ color: t.text.primary, fontFamily: "'Space Mono', monospace" }}
            >
              {fmt(limitTotal)}
            </span>
          </span>
        </div>
      )}

      {/* Expanded: cards detalhados */}
      {expanded && (
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResumoCard
              icon={<CreditCard size={16} />}
              label="Limite Total"
              value={fmt(limitTotal)}
              sub={cardCountLabel}
              accentColor={t.investment.text}
              accentBg={t.investment.bgIcon}
              t={t}
            />
            <ResumoCard
              icon={<Wallet size={16} />}
              label="Limite Usado"
              value={fmt(limitUsed)}
              sub={`${usedPercent.toFixed(0)}% do total`}
              accentColor={t.expense.text}
              accentBg={t.expense.bgIcon}
              t={t}
            />
            <ResumoCard
              icon={<PiggyBank size={16} />}
              label="Limite Disponível"
              value={fmt(limitAvailable)}
              sub={cardCountLabel}
              accentColor={t.income.text}
              accentBg={t.income.bgIcon}
              t={t}
            />
          </div>
        </div>
      )}
    </div>
  );
}
