import { useTokens } from '@/hooks/useTokens';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCw,
  Users,
} from 'lucide-react';
import { RecordsResumoResponse } from '../types/records-resumo.types';

interface Props {
  data?: RecordsResumoResponse;
  isLoading: boolean;
  isError: boolean;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

function VariacaoIndicador({ variacao }: { variacao?: number }) {
  if (variacao == null) return null;
  const isPositive = variacao >= 0;
  return (
    <span
      className="text-xs font-semibold flex items-center gap-0.5"
      style={{ color: isPositive ? '#6ee7b7' : '#fca5a5' }}
    >
      {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isPositive ? '+' : ''}
      {variacao.toFixed(0)}%
    </span>
  );
}

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  variacao?: number;
  accentColor: string;
  accentBg: string;
  t: ReturnType<typeof useTokens>;
}

function ResumoCard({ icon, label, value, sub, variacao, accentColor, accentBg, t }: CardProps) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2 transition-all duration-200"
      style={{
        background: t.bg.card,
        border: `1px solid ${t.border.default}`,
        boxShadow: t.shadow.card,
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = t.bg.cardHover)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = t.bg.card)}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accentBg, color: accentColor }}
        >
          {icon}
        </div>
        <VariacaoIndicador variacao={variacao} />
      </div>
      <div>
        <p className="text-xs font-medium mb-0.5" style={{ color: t.text.muted }}>
          {label}
        </p>
        <p className="text-lg font-black leading-tight" style={{ color: t.text.primary }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: t.text.subtle }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} height={100} borderRadius={16} />
      ))}
    </div>
  );
}

export function RecordsResumoCards({ data, isLoading, isError }: Props) {
  const t = useTokens();

  if (isLoading) return <SkeletonCards />;

  if (isError || !data) return null;

  const {
    totalPago,
    totalPendente,
    totalAtrasado,
    entradas,
    saidas,
    saldoLiquido,
    recorrentes,
    responsaveis,
  } = data;

  const saldoPositivo = saldoLiquido >= 0;

  const cards: CardProps[] = [
    {
      icon: <CheckCircle2 size={16} />,
      label: 'Total Pago',
      value: fmt(totalPago.valor),
      sub: `${totalPago.quantidade} lançamento${totalPago.quantidade !== 1 ? 's' : ''}${totalPago.percentual != null ? ` · ${totalPago.percentual.toFixed(0)}% do período` : ''}`,
      variacao: totalPago.variacao,
      accentColor: t.income.text,
      accentBg: t.income.bgIcon,
      t,
    },
    {
      icon: <Clock size={16} />,
      label: 'Total Pendente',
      value: fmt(totalPendente.valor),
      sub: `${totalPendente.quantidade} lançamento${totalPendente.quantidade !== 1 ? 's' : ''}`,
      accentColor: t.warning.text,
      accentBg: t.warning.bg,
      t,
    },
    {
      icon: <AlertTriangle size={16} />,
      label: 'Total Atrasado',
      value: fmt(totalAtrasado.valor),
      sub: `${totalAtrasado.quantidade} lançamento${totalAtrasado.quantidade !== 1 ? 's' : ''}`,
      accentColor: t.expense.text,
      accentBg: t.expense.bgIcon,
      t,
    },
    {
      icon: <Wallet size={16} />,
      label: 'Saldo Líquido',
      value: fmt(saldoLiquido),
      accentColor: saldoPositivo ? t.income.text : t.expense.text,
      accentBg: saldoPositivo ? t.income.bgIcon : t.expense.bgIcon,
      t,
    },
    {
      icon: <TrendingUp size={16} />,
      label: 'Entradas',
      value: fmt(entradas),
      accentColor: t.income.text,
      accentBg: t.income.bgIcon,
      t,
    },
    {
      icon: <TrendingDown size={16} />,
      label: 'Saídas',
      value: fmt(saidas),
      accentColor: t.expense.text,
      accentBg: t.expense.bgIcon,
      t,
    },
    {
      icon: <RefreshCw size={16} />,
      label: 'Recorrentes',
      value: fmt(recorrentes.valor),
      accentColor: t.investment.text,
      accentBg: t.investment.bgIcon,
      t,
    },
    {
      icon: <Users size={16} />,
      label: 'Responsáveis',
      value: `${responsaveis.length}`,
      sub:
        responsaveis.length > 0
          ? responsaveis
              .slice(0, 2)
              .map((r) => r.nome)
              .join(', ') + (responsaveis.length > 2 ? '…' : '')
          : 'Nenhum',
      accentColor: t.info.text,
      accentBg: t.info.bg,
      t,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => (
        <ResumoCard key={card.label} {...card} />
      ))}
    </div>
  );
}
