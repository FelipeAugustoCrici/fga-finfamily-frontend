import { useFormContext, useWatch } from 'react-hook-form';
import { CircleMinus, Wallet, TrendingUp } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

export function RecordTypeSelector() {
  const { register, setValue } = useFormContext();
  const selectedType = useWatch({ name: 'type' });
  const t = useTokens();

  const TYPES = [
    { id: 'expense', label: 'Gastei', icon: <CircleMinus size={14} />, accent: t.expense },
    { id: 'salary', label: 'Salário', icon: <Wallet size={14} />, accent: t.income },
    { id: 'income', label: 'Receita extra', icon: <TrendingUp size={14} />, accent: t.extra },
  ] as const;

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
              flex: 1,
              minWidth: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              padding: '11px 12px',
              borderRadius: 999,
              border: `1px solid ${active ? opt.accent.textAlt : t.border.default}`,
              background: active ? opt.accent.bg : t.bg.card,
              color: active ? opt.accent.text : t.text.muted,
              fontSize: 13.5,
              fontWeight: 600,
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
