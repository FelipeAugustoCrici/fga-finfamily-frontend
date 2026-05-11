import { Sparkles } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

type Props = {
  incomes: number;
  expenses: number;
  balance: number;
  prevIncomes?: number;
  prevExpenses?: number;
  topCategory?: string;
  healthScore?: number;
  message?: string;
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function buildInsight({
  incomes,
  expenses,
  balance,
  prevIncomes,
  prevExpenses,
  topCategory,
  healthScore,
  message,
}: Props): string {
  const insights: string[] = [];

  if (balance > 0) {
    insights.push(`Você manteve um saldo positivo de ${fmt(balance)} este mês 👏`);
  } else if (balance < 0) {
    insights.push(`Atenção: seu saldo está negativo em ${fmt(Math.abs(balance))} este mês ⚠️`);
  }

  if (prevExpenses !== undefined && prevExpenses > 0) {
    const diff = expenses - prevExpenses;
    const pct = Math.abs((diff / prevExpenses) * 100).toFixed(0);
    if (diff < 0)
      insights.push(`Você gastou ${pct}% menos que no mês passado — ótimo controle! 📉`);
    else if (diff > 0) insights.push(`Seus gastos aumentaram ${pct}% em relação ao mês passado 📈`);
  }

  if (prevIncomes !== undefined && prevIncomes > 0) {
    const diff = incomes - prevIncomes;
    const pct = Math.abs((diff / prevIncomes) * 100).toFixed(0);
    if (diff > 0) insights.push(`Sua renda cresceu ${pct}% comparado ao mês anterior 💰`);
  }

  if (incomes > 0) {
    const ratio = (expenses / incomes) * 100;
    if (ratio < 50)
      insights.push(
        `Você comprometeu apenas ${ratio.toFixed(0)}% da sua renda com gastos — excelente! 🎯`,
      );
    else if (ratio > 90)
      insights.push(
        `Seus gastos representam ${ratio.toFixed(0)}% da renda. Considere revisar o orçamento 🔍`,
      );
  }

  if (topCategory) insights.push(`Seu maior gasto foi com ${topCategory} 🏷️`);

  if (healthScore !== undefined) {
    if (healthScore >= 90)
      insights.push(`Sua saúde financeira está em ${healthScore}% — continue assim! 🌟`);
    else if (healthScore < 50)
      insights.push(
        `Sua saúde financeira está em ${healthScore}%. Pequenos ajustes fazem grande diferença 💡`,
      );
  }

  return (
    insights[0] ??
    message ??
    'Seus dados financeiros estão sendo analisados. Continue registrando seus lançamentos! 📊'
  );
}

export function AIInsight(props: Props) {
  const t = useTokens();
  const insight = buildInsight(props);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: `linear-gradient(135deg, ${t.info.bg} 0%, ${t.info.bgAlt} 100%)`,
        border: `1px solid ${t.info.border}`,
        boxShadow: `0 4px 24px ${t.info.shadow}`,
        marginTop: '8px',
      }}
    >
      {}
      <div
        className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${t.info.shadow} 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />
      <div className="relative z-10 flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
          }}
        >
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-bold text-sm" style={{ color: t.text.primary }}>
              FinFamily AI
            </p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: t.info.bg,
                color: t.info.textAlt,
                border: `1px solid ${t.info.border}`,
              }}
            >
              Insight
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: t.info.text }}>
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}
