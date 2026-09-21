import { useTokens } from '@/hooks/useTokens';

export function RecordFormHeader({ isEdit }: { isEdit: boolean; isLoading?: boolean }) {
  const t = useTokens();

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: t.text.muted,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: t.income.textAlt,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        fga-finfamily · lançamentos
      </div>
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 600,
          fontSize: 'clamp(24px, 3.4vw, 32px)',
          letterSpacing: '-0.01em',
          color: t.text.primary,
          margin: 0,
        }}
      >
        {isEdit ? 'Editar lançamento' : 'Novo lançamento'}
      </h1>
    </div>
  );
}
