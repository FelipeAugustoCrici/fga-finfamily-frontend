import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Users, Repeat } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useTokens } from '@/hooks/useTokens';

interface ToggleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function ToggleCard({ icon, title, description, checked, onToggle }: ToggleCardProps) {
  const t = useTokens();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        border: `1px solid ${checked ? t.text.primary : hovered ? t.border.strong : t.border.default}`,
        background: checked ? t.bg.cardHover : t.bg.card,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Top row: icon box + switch */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: checked ? t.text.primary : t.bg.mutedStrong,
            color: checked ? t.bg.card : t.text.muted,
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Switch */}
        <div
          style={{
            width: 32,
            height: 18,
            borderRadius: 20,
            background: checked ? t.text.primary : t.bg.mutedStrong,
            position: 'relative',
            transition: 'background 0.15s',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              content: '',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: t.bg.card,
              position: 'absolute',
              top: 2,
              left: checked ? 16 : 2,
              transition: 'left 0.15s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Text */}
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: t.text.primary, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12.5, color: t.text.muted, margin: '2px 0 0' }}>{description}</p>
      </div>
    </button>
  );
}

interface ToggleCardsProps {
  showShared?: boolean;
}

export function ToggleCards({ showShared = true }: ToggleCardsProps) {
  const { register, setValue } = useFormContext();
  const isShared = useWatch({ name: 'isShared' });
  const isRecurring = useWatch({ name: 'isRecurring' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showShared ? '1fr 1fr' : '1fr',
          gap: 12,
        }}
      >
        {showShared && (
          <ToggleCard
            icon={<Users size={15} />}
            title="Compartilhada"
            description="Dividir entre membros"
            checked={!!isShared}
            onToggle={() => setValue('isShared', !isShared)}
          />
        )}
        <ToggleCard
          icon={<Repeat size={15} />}
          title="Recorrente"
          description="Repetir mensalmente"
          checked={!!isRecurring}
          onToggle={() => setValue('isRecurring', !isRecurring)}
        />
      </div>

      {/* Hidden checkbox for form registration */}
      <input type="checkbox" {...register('isRecurring')} style={{ display: 'none' }} />

      {/* Recurrence duration — smooth expand */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: isRecurring ? 90 : 0,
          opacity: isRecurring ? 1 : 0,
          transition: 'max-height 0.28s ease, opacity 0.22s ease',
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
