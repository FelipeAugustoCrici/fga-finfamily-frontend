import { ShieldCheck } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  score: number;
  incomes: number;
  expenses: number;
};

export function FinancialHealth({ score, incomes, expenses }: Props) {
  const { isDark } = useTheme();
  const isGood = score > 70;
  const isMid = score > 40;

  const scoreColor = isGood
    ? isDark
      ? '#6ee7b7'
      : '#166534'
    : isMid
      ? isDark
        ? '#fcd34d'
        : '#92400e'
      : isDark
        ? '#fca5a5'
        : '#991b1b';

  const trackStroke = isGood
    ? isDark
      ? '#6ee7b7'
      : '#16a34a'
    : isMid
      ? isDark
        ? '#fcd34d'
        : '#f59e0b'
      : isDark
        ? '#fca5a5'
        : '#ef4444';

  const trackBg = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  const label = isGood ? 'Ótimo' : isMid ? 'Atenção' : 'Crítico';

  const badgeStyle = isGood
    ? {
        background: isDark ? 'rgba(110,231,183,0.15)' : '#dcfce7',
        color: isDark ? '#6ee7b7' : '#166534',
        border: `1px solid ${isDark ? 'rgba(110,231,183,0.25)' : '#bbf7d0'}`,
      }
    : isMid
      ? {
          background: isDark ? 'rgba(252,211,77,0.15)' : '#fef9c3',
          color: isDark ? '#fcd34d' : '#92400e',
          border: `1px solid ${isDark ? 'rgba(252,211,77,0.25)' : '#fde68a'}`,
        }
      : {
          background: isDark ? 'rgba(252,165,165,0.15)' : '#fee2e2',
          color: isDark ? '#fca5a5' : '#991b1b',
          border: `1px solid ${isDark ? 'rgba(252,165,165,0.25)' : '#fecaca'}`,
        };

  const expenseRatio = incomes > 0 ? (expenses / incomes) * 100 : 0;
  const savingsRate = Math.max(0, 100 - expenseRatio);

  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (circumference * score) / 100;

  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBdr = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const headerBdr = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const titleClr = isDark ? '#f1f5f9' : '#1e293b';
  const subClr = isDark ? '#64748b' : '#94a3b8';
  const bodyTxt = isDark ? '#94a3b8' : '#475569';
  const descTxt = isDark ? '#64748b' : '#94a3b8';
  const dividerClr = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  const expenseValColor =
    expenseRatio > 90
      ? isDark
        ? '#fca5a5'
        : '#991b1b'
      : expenseRatio > 70
        ? isDark
          ? '#fcd34d'
          : '#92400e'
        : isDark
          ? '#f1f5f9'
          : '#1e293b';

  const savingsValColor =
    savingsRate < 10 ? (isDark ? '#fca5a5' : '#991b1b') : isDark ? '#6ee7b7' : '#166534';

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-soft"
      style={{
        background: cardBg,
        border: `1px solid ${cardBdr}`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div className="px-6 py-5" style={{ borderBottom: `1px solid ${headerBdr}` }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold" style={{ color: titleClr }}>
              Saúde Financeira
            </h3>
            <p className="text-xs mt-0.5" style={{ color: subClr }}>
              Situação do mês atual
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc' }}
          >
            <ShieldCheck size={15} style={{ color: isDark ? '#64748b' : '#94a3b8' }} />
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
              <span className="text-2xl font-black" style={{ color: scoreColor }}>
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
            <p className="text-sm font-medium" style={{ color: bodyTxt }}>
              Score de saúde financeira
            </p>
            <p className="text-xs leading-relaxed" style={{ color: descTxt }}>
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
          style={{ borderTop: `1px solid ${dividerClr}` }}
        >
          <div
            className="rounded-xl p-3 space-y-1"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: isDark ? '#64748b' : '#94a3b8' }}
            >
              Taxa de Gastos
            </p>
            <p className="text-xl font-black" style={{ color: expenseValColor }}>
              {expenseRatio.toFixed(1)}%
            </p>
            <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              da renda comprometida
            </p>
          </div>
          <div
            className="rounded-xl p-3 space-y-1"
            style={{
              background: isDark ? 'rgba(110,231,183,0.06)' : '#ecfdf5',
              border: `1px solid ${isDark ? 'rgba(110,231,183,0.1)' : '#d1fae5'}`,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: isDark ? '#6ee7b7' : '#166534' }}
            >
              Poupança
            </p>
            <p className="text-xl font-black" style={{ color: savingsValColor }}>
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs" style={{ color: isDark ? 'rgba(110,231,183,0.6)' : '#4ade80' }}>
              do que sobra da renda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
