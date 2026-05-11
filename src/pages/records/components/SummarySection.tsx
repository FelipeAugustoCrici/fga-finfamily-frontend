import _ from 'lodash';
import { useFormContext, useWatch } from 'react-hook-form';
import { Person } from '@/types';
import { formatShortDate, formatMonthYear } from '@/common/utils/date';
import { useTokens } from '@/hooks/useTokens';
import { Repeat, Users, Tag, Calendar, User } from 'lucide-react';

type SummarySectionProps = {
  people: Person[];
  categories?: any[];
};

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  expense: { label: 'Despesa', icon: '💸', color: '#ef4444' },
  salary: { label: 'Salário', icon: '💰', color: '#10b981' },
  income: { label: 'Extra / Bônus', icon: '✨', color: '#6366f1' },
};

function PreviewRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const t = useTokens();
  if (!value || value === '—') return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: t.text.subtle, flexShrink: 0, display: 'flex' }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 10, color: t.text.subtle, margin: 0, lineHeight: 1.2 }}>{label}</p>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: t.text.primary,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function SummarySection({ people, categories = [] }: SummarySectionProps) {
  const { control } = useFormContext();
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const description = useWatch({ control, name: 'description' });
  const value = useWatch({ control, name: 'value' });
  const date = useWatch({ control, name: 'date' });
  const personId = useWatch({ control, name: 'personId' });
  const type = useWatch({ control, name: 'type' });
  const isRecurring = useWatch({ control, name: 'isRecurring' });
  const isShared = useWatch({ control, name: 'isShared' });
  const categoryId = useWatch({ control, name: 'categoryId' });
  const durationMonths = useWatch({ control, name: 'durationMonths' });

  const personName = _.find(people, { id: personId })?.name || '';
  const categoryName = _.find(categories, { id: categoryId })?.name || '';
  const shortDate = date ? formatShortDate(date) : '';
  const refDate = date ? formatMonthYear(date) : '';

  const numericValue = Number(value || 0);
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);

  const meta = TYPE_META[type] || TYPE_META.expense;
  const hasContent = numericValue > 0 || description;

  const accentAlpha = isDark ? '18' : '10';
  const borderAlpha = isDark ? '30' : '20';

  return (
    <div
      style={{
        position: 'sticky',
        top: 24,
        background: t.bg.card,
        border: `1px solid ${t.border.default}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: t.shadow.card,
      }}
    >
      {/* Accent top bar */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)`,
          transition: 'background 0.3s ease',
        }}
      />

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Type badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: `${meta.color}${accentAlpha}`,
              border: `1px solid ${meta.color}${borderAlpha}`,
              borderRadius: 6,
              padding: '3px 8px',
            }}
          >
            <span style={{ fontSize: 12 }}>{meta.icon}</span>
            <span
              style={{ fontSize: 11, fontWeight: 700, color: meta.color, letterSpacing: '0.02em' }}
            >
              {meta.label}
            </span>
          </div>
          <span style={{ fontSize: 10, color: t.text.subtle, fontWeight: 500 }}>Prévia</span>
        </div>

        {/* Value — hero element */}
        <div style={{ transition: 'opacity 0.2s ease' }}>
          <p
            style={{
              fontSize: 10,
              color: t.text.subtle,
              margin: '0 0 4px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Valor
          </p>
          <p
            style={{
              fontSize: numericValue >= 10000 ? 26 : 32,
              fontWeight: 800,
              color: hasContent ? meta.color : t.text.subtle,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              margin: 0,
              transition: 'color 0.25s ease, font-size 0.15s ease',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formattedValue}
          </p>
          {description && (
            <p
              style={{
                fontSize: 12,
                color: t.text.muted,
                margin: '6px 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: t.border.divider }} />

        {/* Detail rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PreviewRow icon={<User size={13} />} label="Responsável" value={personName} />
          <PreviewRow icon={<Calendar size={13} />} label="Data" value={shortDate} />
          {refDate && shortDate && (
            <PreviewRow icon={<Calendar size={13} />} label="Referência" value={refDate} />
          )}
          {type === 'expense' && categoryName && (
            <PreviewRow icon={<Tag size={13} />} label="Categoria" value={categoryName} />
          )}
        </div>

        {/* Flags */}
        {(isRecurring || (type === 'expense' && isShared)) && (
          <>
            <div style={{ height: 1, background: t.border.divider }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {isRecurring && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff',
                    color: isDark ? '#a5b4fc' : '#4338ca',
                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : '#c7d2fe'}`,
                  }}
                >
                  <Repeat size={11} />
                  Recorrente{durationMonths ? ` · ${durationMonths}m` : ''}
                </span>
              )}
              {type === 'expense' && isShared && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff',
                    color: isDark ? '#a5b4fc' : '#4338ca',
                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : '#c7d2fe'}`,
                  }}
                >
                  <Users size={11} />
                  Compartilhada
                </span>
              )}
            </div>
          </>
        )}

        {/* Empty state */}
        {!hasContent && (
          <p style={{ fontSize: 12, color: t.text.subtle, textAlign: 'center', padding: '8px 0' }}>
            Preencha o formulário para ver a prévia
          </p>
        )}
      </div>
    </div>
  );
}
