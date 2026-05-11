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
  color?: string;
}

function ToggleCard({ icon, title, description, checked, onToggle, color = '#6366f1' }: ToggleCardProps) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const [hovered, setHovered] = useState(false);

  const activeBg     = isDark ? `${color}14` : `${color}0d`;
  const activeBorder = isDark ? `${color}50` : `${color}60`;
  const activeText   = isDark ? `${color}dd` : color;
  const inactiveBg   = hovered ? t.bg.cardHover : t.bg.card;
  const inactiveBorder = hovered ? t.border.focus : t.border.default;

  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 14px',
        borderRadius: 12,
        border: `1.5px solid ${checked ? activeBorder : inactiveBorder}`,
        background: checked ? activeBg : inactiveBg,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.18s ease',
        boxShadow: checked ? `0 0 0 3px ${color}18` : 'none',
      }}
    >
      {/* Top row: icon + dot indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: checked
            ? (isDark ? `${color}25` : `${color}18`)
            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
          color: checked ? activeText : t.text.muted,
          transition: 'all 0.18s ease',
          flexShrink: 0,
        }}>
          {icon}
        </div>

        {/* Status dot */}
        <div style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: checked ? color : (isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'),
          transition: 'background 0.18s ease',
          boxShadow: checked ? `0 0 6px ${color}80` : 'none',
        }} />
      </div>

      {/* Text */}
      <div>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: checked ? activeText : t.text.primary,
          margin: 0,
          lineHeight: 1.3,
          transition: 'color 0.18s ease',
        }}>
          {title}
        </p>
        <p style={{
          fontSize: 11,
          color: checked ? activeText : t.text.muted,
          margin: '2px 0 0',
          opacity: checked ? 0.8 : 0.7,
          lineHeight: 1.4,
          transition: 'color 0.18s ease',
        }}>
          {description}
        </p>
      </div>
    </button>
  );
}

interface ToggleCardsProps {
  showShared?: boolean;
}

export function ToggleCards({ showShared = true }: ToggleCardsProps) {
  const { register, setValue } = useFormContext();
  const isShared    = useWatch({ name: 'isShared' });
  const isRecurring = useWatch({ name: 'isRecurring' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showShared ? '1fr 1fr' : '1fr',
        gap: 10,
      }}>
        {showShared && (
          <ToggleCard
            icon={<Users size={15} />}
            title="Compartilhada"
            description="Dividir entre membros"
            checked={!!isShared}
            onToggle={() => setValue('isShared', !isShared)}
            color="#6366f1"
          />
        )}
        <ToggleCard
          icon={<Repeat size={15} />}
          title="Recorrente"
          description="Repetir mensalmente"
          checked={!!isRecurring}
          onToggle={() => setValue('isRecurring', !isRecurring)}
          color="#6366f1"
        />
      </div>

      {/* Hidden checkbox for form registration */}
      <input type="checkbox" {...register('isRecurring')} style={{ display: 'none' }} />

      {/* Recurrence duration — smooth expand */}
      <div style={{
        overflow: 'hidden',
        maxHeight: isRecurring ? 90 : 0,
        opacity: isRecurring ? 1 : 0,
        transition: 'max-height 0.28s ease, opacity 0.22s ease',
      }}>
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
