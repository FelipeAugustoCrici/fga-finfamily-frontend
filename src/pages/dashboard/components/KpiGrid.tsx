import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useCountUp } from '@/hooks/useCountUp';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

type KpiCardProps = {
  title: string;
  value: number;
  visible: boolean;
  color: string;
  iconBg: string;
  icon: React.ReactNode;
  change?: number;
  subtitle?: string;
  primary?: boolean;
};

function KpiCard({ title, value, visible, color, iconBg, icon, change, subtitle, primary }: KpiCardProps) {
  const { isDark } = useTheme();
  const animated = useCountUp(value, 650);

  const hasChange = change !== undefined;
  const isUp = (change ?? 0) >= 0;

  const bg     = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const shadow = isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)';

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 16,
      padding: primary ? '20px 20px' : '16px 18px',
      boxShadow: shadow,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
          ? '0 8px 28px rgba(0,0,0,0.4)'
          : '0 6px 20px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = shadow;
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: iconBg,
          color,
        }}>
          {icon}
        </div>

        {hasChange && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 700,
            padding: '2px 7px', borderRadius: 999,
            background: isUp
              ? (isDark ? 'rgba(74,222,128,0.12)' : '#dcfce7')
              : (isDark ? 'rgba(248,113,113,0.12)' : '#fee2e2'),
            color: isUp
              ? (isDark ? '#4ade80' : '#15803d')
              : (isDark ? '#f87171' : '#dc2626'),
          }}>
            {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            {fmt(Math.abs(change!))}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8',
          marginBottom: 4,
        }}>
          {title}
        </p>
        <p style={{
          fontSize: primary ? 28 : 22,
          fontWeight: 800,
          color: visible ? color : (isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'),
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          transition: 'color 0.2s ease',
        }}>
          {visible ? fmt(animated) : '••••••'}
        </p>
        {subtitle && (
          <p style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8', marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

type KpiGridProps = {
  balance: number;
  incomes: number;
  expenses: number;
  salary: number;
  incomeChange?: number;
  expenseChange?: number;
};

export function KpiGrid({ balance, incomes, expenses, salary, incomeChange, expenseChange }: KpiGridProps) {
  const [visible, setVisible] = React.useState(true);
  const { isDark } = useTheme();
  const isPositive = balance >= 0;
  const savings = salary * 0.2;

  const balanceColor = isPositive
    ? (isDark ? '#a7f3d0' : '#047857')
    : (isDark ? '#fca5a5' : '#dc2626');

  return (
    <div>
      {/* Visibility toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600,
            padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)')}
          onMouseLeave={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')}
        >
          {visible ? <EyeOff size={13} /> : <Eye size={13} />}
          {visible ? 'Ocultar valores' : 'Mostrar valores'}
        </button>
      </div>

      {/* KPI grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
      }} className="kpi-grid">
        <KpiCard
          title="Saldo Total"
          value={balance}
          visible={visible}
          color={balanceColor}
          iconBg={isPositive
            ? (isDark ? 'rgba(74,222,128,0.12)' : '#dcfce7')
            : (isDark ? 'rgba(248,113,113,0.12)' : '#fee2e2')}
          icon={<Wallet size={16} />}
          subtitle={isPositive ? 'Saldo positivo' : 'Saldo negativo'}
          primary
        />
        <KpiCard
          title="Entradas"
          value={incomes}
          visible={visible}
          color={isDark ? '#6ee7b7' : '#059669'}
          iconBg={isDark ? 'rgba(110,231,183,0.12)' : '#d1fae5'}
          icon={<TrendingUp size={15} />}
          change={incomeChange}
          subtitle="este mês"
        />
        <KpiCard
          title="Saídas"
          value={expenses}
          visible={visible}
          color={isDark ? '#fca5a5' : '#dc2626'}
          iconBg={isDark ? 'rgba(252,165,165,0.12)' : '#fee2e2'}
          icon={<TrendingDown size={15} />}
          change={expenseChange}
          subtitle="este mês"
        />
        <KpiCard
          title="Meta Poupança"
          value={savings}
          visible={visible}
          color={isDark ? '#93c5fd' : '#2563eb'}
          iconBg={isDark ? 'rgba(147,197,253,0.12)' : '#dbeafe'}
          icon={<PiggyBank size={15} />}
          subtitle="20% da renda"
        />
      </div>
    </div>
  );
}
