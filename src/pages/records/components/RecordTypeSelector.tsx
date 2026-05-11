import { useFormContext, useWatch } from 'react-hook-form';
import { ArrowDownCircle, Wallet, TrendingUp } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

const TYPES = [
  {
    id: 'expense',
    label: 'Gastei',
    icon: <ArrowDownCircle size={14} />,
    activeColor: '#ef4444',
    activeBg: (d: boolean) => (d ? 'rgba(239,68,68,0.14)' : '#fef2f2'),
    activeBorder: (d: boolean) => (d ? 'rgba(239,68,68,0.50)' : '#fca5a5'),
    activeText: (d: boolean) => (d ? '#fca5a5' : '#991b1b'),
  },
  {
    id: 'salary',
    label: 'Salário',
    icon: <Wallet size={14} />,
    activeColor: '#10b981',
    activeBg: (d: boolean) => (d ? 'rgba(16,185,129,0.14)' : '#ecfdf5'),
    activeBorder: (d: boolean) => (d ? 'rgba(16,185,129,0.50)' : '#6ee7b7'),
    activeText: (d: boolean) => (d ? '#6ee7b7' : '#166534'),
  },
  {
    id: 'income',
    label: 'Receita extra',
    icon: <TrendingUp size={14} />,
    activeColor: '#6366f1',
    activeBg: (d: boolean) => (d ? 'rgba(99,102,241,0.14)' : '#eef2ff'),
    activeBorder: (d: boolean) => (d ? 'rgba(99,102,241,0.50)' : '#a5b4fc'),
    activeText: (d: boolean) => (d ? '#a5b4fc' : '#3730a3'),
  },
] as const;

export function RecordTypeSelector() {
  const { register, setValue } = useFormContext();
  const selectedType = useWatch({ name: 'type' });
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {TYPES.map((opt) => {
        const active = selectedType === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setValue('type', opt.id, { shouldValidate: true })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 999,
              border: `1.5px solid ${active ? opt.activeBorder(isDark) : t.border.default}`,
              background: active ? opt.activeBg(isDark) : 'transparent',
              color: active ? opt.activeText(isDark) : t.text.muted,
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
      <input type="radio" {...register('type')} style={{ display: 'none' }} />
    </div>
  );
}
