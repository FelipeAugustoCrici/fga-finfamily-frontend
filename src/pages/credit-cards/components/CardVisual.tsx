import { CreditCard as CreditCardIcon } from 'lucide-react';
import type { CreditCard } from '../types/credit-card.types';

interface CardVisualProps {
  card: CreditCard;
  compact?: boolean;
}

const brandLogos: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  elo: 'ELO',
  amex: 'AMEX',
  hipercard: 'HIPER',
  other: '',
};

export function CardVisual({ card, compact = false }: CardVisualProps) {
  const usedPercent =
    card.limitAmount > 0
      ? Math.min(((card.limitAmount - card.availableLimit) / card.limitAmount) * 100, 100)
      : 0;

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div
      className={`rounded-xl text-white shadow-lg relative overflow-hidden ${compact ? 'p-4' : 'p-5'}`}
      style={{
        background: `linear-gradient(135deg, ${card.color || '#334155'}, ${card.color || '#334155'}cc)`,
      }}
    >
      {}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
              {card.bank || 'Cartão'}
            </p>
            <h4 className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>{card.name}</h4>
          </div>
          <div className="text-right">
            <span className="text-white/80 text-sm font-bold">
              {brandLogos[card.brand || 'other'] || <CreditCardIcon size={20} />}
            </span>
          </div>
        </div>

        {!compact && (
          <>
            <div className="mb-3">
              <p className="text-white/60 text-xs mb-1">Limite disponível</p>
              <p className="text-xl font-bold">{fmt(card.availableLimit)}</p>
              <p className="text-white/60 text-xs">de {fmt(card.limitAmount)}</p>
            </div>

            <div className="w-full bg-white/20 rounded-full h-1.5 mb-3">
              <div
                className="bg-white rounded-full h-1.5 transition-all"
                style={{ width: `${100 - usedPercent}%` }}
              />
            </div>
          </>
        )}

        <div className="flex gap-4 text-xs text-white/70">
          <span>Fecha dia {card.closingDay}</span>
          <span>Vence dia {card.dueDay}</span>
        </div>
      </div>
    </div>
  );
}
