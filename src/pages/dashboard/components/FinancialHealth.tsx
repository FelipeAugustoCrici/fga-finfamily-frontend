import { ShieldCheck } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

type Props = {
  score: number;
  incomes: number;
  expenses: number;
};

export function FinancialHealth({ score, incomes, expenses }: Props) {
  const t = useTokens();
  const isGood = score > 70;
  const isMid = score > 40;

  const statusAccent = isGood ? t.income : isMid ? t.warning : t.expense;
  const scoreColor = statusAccent.text;
  const trackStroke = statusAccent.textAlt;
  const trackBg = t.bg.mutedStrong;

  const label = isGood ? 'Ótimo' : isMid ? 'Atenção' : 'Crítico';

  const badgeStyle = {
    background: statusAccent.bg,
    color: statusAccent.text,
    border: `1px solid ${statusAccent.border}`,
  };

  const expenseRatio = incomes > 0 ? (expenses / incomes) * 100 : 0;
  const savingsRate = Math.max(0, 100 - expenseRatio);

  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (circumference * score) / 100;

  const expenseValColor =
    expenseRatio > 90 ? t.expense.textAlt : expenseRatio > 70 ? t.warning.text : t.text.primary;

  const savingsValColor = savingsRate < 10 ? t.expense.textAlt : t.income.textAlt;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: t.bg.card,
        border: `1px solid ${t.border.default}`,
        boxShadow: t.shadow.card,
      }}
    >
      <div className="px-6 py-5" style={{ borderBottom: `1px solid ${t.border.divider}` }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold" style={{ color: t.text.primary }}>
              Saúde Financeira
            </h3>
            <p className="text-xs mt-0.5" style={{ color: t.text.subtle }}>
              Situação do mês atual
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: t.bg.icon }}
          >
            <ShieldCheck size={15} style={{ color: t.text.muted }} />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-6">
          {}
          <div className="relative inline-flex items-center justify-center shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 80 80">
              <circle strokeWidth="7" stroke={trackBg} fill="transparent" r="34" cx="40" cy="40" />
              <circle
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke={trackStroke}
                fill="transparent"
                r="34"
                cx="40"
                cy="40"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black font-mono" style={{ color: scoreColor }}>
                {score}%
              </span>
            </div>
          </div>

          {}
          <div className="flex-1 space-y-3">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full inline-block"
              style={badgeStyle}
            >
              {label}
            </span>
            <p className="text-sm font-medium" style={{ color: t.text.muted }}>
              Score de saúde financeira
            </p>
            <p className="text-xs leading-relaxed" style={{ color: t.text.subtle }}>
              {isGood
                ? 'Suas finanças estão equilibradas. Continue assim!'
                : isMid
                  ? 'Atenção: seus gastos estão próximos da renda.'
                  : 'Seus gastos superam a renda. Revise o orçamento.'}
            </p>
          </div>
        </div>

        {}
        <div
          className="grid grid-cols-2 gap-3 mt-5 pt-5"
          style={{ borderTop: `1px solid ${t.border.divider}` }}
        >
          <div
            className="rounded-xl p-3 space-y-1"
            style={{
              background: t.expense.bg,
              border: `1px solid ${t.expense.border}`,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: t.text.subtle }}
            >
              Taxa de Gastos
            </p>
            <p
              className="text-xl font-black"
              style={{ color: expenseValColor, fontFamily: "'Space Mono', monospace" }}
            >
              {expenseRatio.toFixed(1)}%
            </p>
            <p className="text-xs" style={{ color: t.text.subtle }}>
              da renda comprometida
            </p>
          </div>
          <div
            className="rounded-xl p-3 space-y-1"
            style={{
              background: t.income.bg,
              border: `1px solid ${t.income.border}`,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: t.income.text }}
            >
              Poupança
            </p>
            <p
              className="text-xl font-black"
              style={{ color: savingsValColor, fontFamily: "'Space Mono', monospace" }}
            >
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs" style={{ color: t.income.textAlt }}>
              do que sobra da renda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
