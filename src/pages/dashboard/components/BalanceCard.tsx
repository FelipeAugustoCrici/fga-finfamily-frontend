import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useCountUp } from '@/hooks/useCountUp';

type Props = {
  balance: number;
  incomes: number;
  expenses: number;
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function BalanceCard({ balance, incomes, expenses }: Props) {
  const [visible, setVisible] = React.useState(true);
  const { isDark } = useTheme();
  const isPositive = balance >= 0;

  const animatedBalance = useCountUp(balance, 700);
  const animatedIncomes = useCountUp(incomes, 600);
  const animatedExpenses = useCountUp(expenses, 650);

  const darkCard = {
    background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
  };

  const lightCard = {
    background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 60%, #f1f5f9 100%)',
    boxShadow: '0 10px 40px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid rgba(99,102,241,0.12)',
  };

  const cardStyle = isDark ? darkCard : lightCard;

  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : '#64748b';
  const iconWrapBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.1)';
  const iconWrapBdr = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.15)';
  const walletColor = isDark ? 'rgba(255,255,255,0.8)' : '#6366f1';
  const eyeBtnBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.06)';
  const eyeBtnHover = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(99,102,241,0.12)';
  const eyeBtnBdr = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.15)';
  const eyeColor = isDark ? 'rgba(255,255,255,0.6)' : '#6366f1';

  const balanceColor = isDark
    ? isPositive
      ? '#ffffff'
      : '#f87171'
    : isPositive
      ? '#0f172a'
      : '#dc2626';

  const badgeStyle = isPositive
    ? isDark
      ? {
          background: 'rgba(74,222,128,0.15)',
          color: '#4ade80',
          border: '1px solid rgba(74,222,128,0.2)',
        }
      : {
          background: 'rgba(16,185,129,0.1)',
          color: '#047857',
          border: '1px solid rgba(16,185,129,0.2)',
        }
    : isDark
      ? {
          background: 'rgba(248,113,113,0.15)',
          color: '#f87171',
          border: '1px solid rgba(248,113,113,0.2)',
        }
      : {
          background: 'rgba(220,38,38,0.08)',
          color: '#dc2626',
          border: '1px solid rgba(220,38,38,0.15)',
        };

  const indicatorBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)';
  const indicatorBdr = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.1)';
  const indicatorHov = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.06)';

  const incomeIconBg = isDark ? 'rgba(74,222,128,0.2)' : 'rgba(16,185,129,0.12)';
  const incomeIconClr = isDark ? '#4ade80' : '#059669';
  const incomeLbl = isDark ? 'rgba(255,255,255,0.4)' : '#64748b';
  const incomeVal = isDark ? '#86efac' : '#047857';

  const expenseIconBg = isDark ? 'rgba(248,113,113,0.2)' : 'rgba(220,38,38,0.1)';
  const expenseIconClr = isDark ? '#f87171' : '#dc2626';
  const expenseLbl = isDark ? 'rgba(255,255,255,0.4)' : '#64748b';
  const expenseVal = isDark ? '#fca5a5' : '#be123c';

  return (
    <div className="relative overflow-hidden rounded-3xl p-8 h-full" style={cardStyle}>
      {}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 70% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 70% 20%, rgba(99,102,241,0.06) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"
        style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"
        style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.03)' }}
      />

      <div className="relative z-10">
        {}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm"
              style={{ background: iconWrapBg, border: `1px solid ${iconWrapBdr}` }}
            >
              <Wallet size={20} style={{ color: walletColor }} />
            </div>
            <span
              className="font-medium text-xs uppercase tracking-widest"
              style={{ color: labelColor }}
            >
              Saldo atual
            </span>
          </div>
          <button
            onClick={() => setVisible((v) => !v)}
            className="p-2 rounded-lg transition-all duration-200"
            style={{ background: eyeBtnBg, border: `1px solid ${eyeBtnBdr}` }}
            onMouseEnter={(e) => (e.currentTarget.style.background = eyeBtnHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = eyeBtnBg)}
            aria-label="Alternar visibilidade"
          >
            {visible ? (
              <Eye size={15} style={{ color: eyeColor }} />
            ) : (
              <EyeOff size={15} style={{ color: eyeColor }} />
            )}
          </button>
        </div>

        {}
        <div className="mb-8">
          <div
            className="text-5xl font-black tracking-tight transition-all duration-300"
            style={{ color: balanceColor }}
          >
            {visible ? fmt(animatedBalance) : 'R$ ••••••'}
          </div>
          <div
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={badgeStyle}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? 'Saldo positivo' : 'Saldo negativo'}
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4 border transition-all duration-200"
            style={{ background: indicatorBg, borderColor: indicatorBdr }}
            onMouseEnter={(e) => (e.currentTarget.style.background = indicatorHov)}
            onMouseLeave={(e) => (e.currentTarget.style.background = indicatorBg)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: incomeIconBg }}
              >
                <TrendingUp size={11} style={{ color: incomeIconClr }} />
              </div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: incomeLbl }}
              >
                Entradas
              </span>
            </div>
            <p className="text-lg font-bold" style={{ color: incomeVal }}>
              {visible ? fmt(animatedIncomes) : 'R$ ••••'}
            </p>
          </div>
          <div
            className="rounded-2xl p-4 border transition-all duration-200"
            style={{ background: indicatorBg, borderColor: indicatorBdr }}
            onMouseEnter={(e) => (e.currentTarget.style.background = indicatorHov)}
            onMouseLeave={(e) => (e.currentTarget.style.background = indicatorBg)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: expenseIconBg }}
              >
                <TrendingDown size={11} style={{ color: expenseIconClr }} />
              </div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: expenseLbl }}
              >
                Saídas
              </span>
            </div>
            <p className="text-lg font-bold" style={{ color: expenseVal }}>
              {visible ? fmt(animatedExpenses) : 'R$ ••••'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
