import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { useTokens } from '@/hooks/useTokens';

export function RecurrenceSection() {
  const { register, setValue } = useFormContext();
  const isRecurring = useWatch({ name: 'isRecurring' });
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Switch inline */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="checkbox" {...register('isRecurring')} style={{ display: 'none' }} />
        <button
          type="button"
          onClick={() => setValue('isRecurring', !isRecurring)}
          style={{
            width: 36,
            height: 20,
            borderRadius: 999,
            background: isRecurring ? '#6366f1' : isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0,
            transition: 'background 0.18s ease',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 2,
              left: isRecurring ? 18 : 2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 0.18s ease',
            }}
          />
        </button>
        <span style={{ fontSize: 13, color: t.text.secondary }}>Recorrente</span>
      </label>

      {/* Duração — expande inline */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: isRecurring ? 80 : 0,
          opacity: isRecurring ? 1 : 0,
          transition: 'max-height 0.25s ease, opacity 0.2s ease',
        }}
      >
        <Input
          label="Duração (meses)"
          type="number"
          min="1"
          placeholder="Ex: 12"
          {...register('durationMonths')}
        />
      </div>
    </div>
  );
}
