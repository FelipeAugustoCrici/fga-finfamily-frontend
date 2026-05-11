import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useCountUp } from '@/hooks/useCountUp';

type Props = {
  title: string;
  value: number;
  type: 'income' | 'expense' | 'balance' | 'investment';
  icon: React.ComponentType<{ size: number; className?: string }>;
  change?: number;
  subtitle?: string;
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtCompact = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toFixed(0);
};

type ColorSet = {
  bg: string;
  border: string;
  shadow: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  labelColor: string;
  subtitleColor: string;
};

const LIGHT: Record<string, ColorSet> = {
  income: {
    bg: '#ecfdf5',
    border: '#d1fae5',
    shadow: 'rgba(16,185,129,0.08)',
    iconBg: '#a7f3d0',
    iconColor: '#059669',
    valueColor: '#047857',
    labelColor: '#6b7280',
    subtitleColor: '#9ca3af',
  },
  expense: {
    bg: '#fff1f2',
    border: '#fecdd3',
    shadow: 'rgba(244,63,94,0.08)',
    iconBg: '#fda4af',
    iconColor: '#e11d48',
    valueColor: '#be123c',
    labelColor: '#6b7280',
    subtitleColor: '#9ca3af',
  },
  balance: {
    bg: '#ffffff',
    border: '#e2e8f0',
    shadow: 'rgba(0,0,0,0.06)',
    iconBg: '#f1f5f9',
    iconColor: '#475569',
    valueColor: '#1e293b',
    labelColor: '#6b7280',
    subtitleColor: '#9ca3af',
  },
  investment: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    shadow: 'rgba(59,130,246,0.08)',
    iconBg: '#bfdbfe',
    iconColor: '#2563eb',
    valueColor: '#1d4ed8',
    labelColor: '#6b7280',
    subtitleColor: '#9ca3af',
  },
};

const DARK: Record<string, ColorSet> = {
  income: {
    bg: 'linear-gradient(135deg,#052e1b,#064e3b)',
    border: 'rgba(110,231,183,0.15)',
    shadow: 'rgba(74,222,128,0.08)',
    iconBg: 'rgba(110,231,183,0.15)',
    iconColor: '#6ee7b7',
    valueColor: '#a7f3d0',
    labelColor: '#94a3b8',
    subtitleColor: '#64748b',
  },
  expense: {
    bg: 'linear-gradient(135deg,#3f0a0a,#7f1d1d)',
    border: 'rgba(252,165,165,0.15)',
    shadow: 'rgba(248,113,113,0.08)',
    iconBg: 'rgba(252,165,165,0.15)',
    iconColor: '#fca5a5',
    valueColor: '#fecaca',
    labelColor: '#94a3b8',
    subtitleColor: '#64748b',
  },
  balance: {
    bg: '#0f172a',
    border: 'rgba(255,255,255,0.07)',
    shadow: 'rgba(0,0,0,0.3)',
    iconBg: 'rgba(255,255,255,0.07)',
    iconColor: '#94a3b8',
    valueColor: '#f1f5f9',
    labelColor: '#94a3b8',
    subtitleColor: '#64748b',
  },
  investment: {
    bg: 'linear-gradient(135deg,#0a1f44,#1e3a8a)',
    border: 'rgba(147,197,253,0.15)',
    shadow: 'rgba(96,165,250,0.08)',
    iconBg: 'rgba(147,197,253,0.15)',
    iconColor: '#93c5fd',
    valueColor: '#bfdbfe',
    labelColor: '#94a3b8',
    subtitleColor: '#64748b',
  },
};

export function SummaryCardNew({ title, value, type, icon: Icon, change, subtitle }: Props) {
  const { isDark } = useTheme();
  const cfg = isDark ? DARK[type] : LIGHT[type];
  const hasChange = change !== undefined;
  const isPositiveChange = (change ?? 0) >= 0;
  const animatedValue = useCountUp(value, 650);

  const changeBg = isPositiveChange
    ? isDark
      ? 'rgba(110,231,183,0.15)'
      : '#d1fae5'
    : isDark
      ? 'rgba(252,165,165,0.15)'
      : '#fecdd3';
  const changeColor = isPositiveChange
    ? isDark
      ? '#6ee7b7'
      : '#047857'
    : isDark
      ? '#fca5a5'
      : '#be123c';

  return (
    <div
      className="rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: cfg.bg,
        borderColor: cfg.border,
        boxShadow: `0 4px 20px ${cfg.shadow}, 0 1px 4px rgba(0,0,0,0.06)`,
        padding: 'clamp(10px, 3vw, 20px)',
      }}
    >
      {}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 6,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: cfg.iconBg,
          }}
        >
          <span style={{ color: cfg.iconColor, display: 'flex' }}>
            <Icon size={17} />
          </span>
        </div>

        {hasChange && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 7px',
              borderRadius: 999,
              flexShrink: 0,
              backgroundColor: changeBg,
              color: changeColor,
              maxWidth: '55%',
              overflow: 'hidden',
            }}
          >
            {isPositiveChange ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {}
            <span className="hidden sm:inline" style={{ whiteSpace: 'nowrap' }}>
              {fmt(Math.abs(change!))}
            </span>
            <span className="sm:hidden" style={{ whiteSpace: 'nowrap' }}>
              R${fmtCompact(Math.abs(change!))}
            </span>
          </div>
        )}
      </div>

      {}
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: cfg.labelColor,
          marginBottom: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </p>

      {}
      <p
        style={{
          color: cfg.valueColor,
          fontWeight: 900,
          lineHeight: 1.1,
          fontSize: 'clamp(0.9rem, 3.5vw, 1.4rem)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {fmt(animatedValue)}
      </p>

      {subtitle && (
        <p style={{ fontSize: 10, marginTop: 3, color: cfg.subtitleColor }}>{subtitle}</p>
      )}
    </div>
  );
}
