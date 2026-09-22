import _ from 'lodash';
import { useFormContext, useWatch } from 'react-hook-form';
import { Check, RotateCw, CreditCard } from 'lucide-react';
import { Person } from '@/types';
import { formatShortDate, formatMonthYear } from '@/common/utils/date';
import { useTokens } from '@/hooks/useTokens';
import { Tokens } from '@/theme/tokens';

type RecordReceiptPreviewProps = {
  people: Person[];
  categories?: any[];
  creditCards?: any[];
};

function getTypeMeta(t: Tokens) {
  return {
    expense: { label: 'Despesa', color: t.expense.textAlt },
    salary: { label: 'Salário', color: t.income.textAlt },
    income: { label: 'Receita extra', color: t.extra.textAlt },
  };
}

function zigStyle(paper: string, flip: boolean): React.CSSProperties {
  return {
    height: 12,
    width: '100%',
    backgroundImage: `linear-gradient(135deg, ${paper} 50%, transparent 50%), linear-gradient(-135deg, ${paper} 50%, transparent 50%)`,
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 0 0',
    backgroundRepeat: 'repeat-x',
    transform: flip ? 'rotate(180deg)' : undefined,
  };
}

export function RecordReceiptPreview({
  people,
  categories = [],
  creditCards = [],
}: RecordReceiptPreviewProps) {
  const { control } = useFormContext();
  const t = useTokens();
  const meta = getTypeMeta(t);

  const description = useWatch({ control, name: 'description' });
  const value = useWatch({ control, name: 'value' });
  const date = useWatch({ control, name: 'date' });
  const personId = useWatch({ control, name: 'personId' });
  const type = useWatch({ control, name: 'type' });
  const isRecurring = useWatch({ control, name: 'isRecurring' });
  const isShared = useWatch({ control, name: 'isShared' });
  const categoryId = useWatch({ control, name: 'categoryId' });
  const durationMonths = useWatch({ control, name: 'durationMonths' });
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const creditCardId = useWatch({ control, name: 'creditCardId' });
  const installments = useWatch({ control, name: 'installments' });

  const personName = _.find(people, { id: personId })?.name || '';
  const categoryName = _.find(categories, { id: categoryId })?.name || '';
  const cardName = _.find(creditCards, { id: creditCardId })?.name || '';
  const isCreditCard = type === 'expense' && paymentMethod === 'credit_card';
  const shortDate = date ? formatShortDate(date) : '';
  const refDate = date ? formatMonthYear(date) : '';

  const numericValue = Number(value || 0);
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);

  const typeMeta = meta[type as keyof typeof meta] || meta.expense;

  return (
    <div style={{ position: 'sticky', top: 24, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          fontFamily: "'Space Mono', monospace",
          color: t.receipt.ink,
          boxShadow: t.shadow.card,
          filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.03))',
        }}
      >
        <div style={zigStyle(t.receipt.paper, false)} />

        <div
          style={{
            padding: '22px 22px 6px',
            background: t.receipt.paper,
            backgroundImage: `repeating-linear-gradient(180deg, transparent, transparent 41px, rgba(127,127,127,0.06) 42px)`,
          }}
        >
          {/* Head */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: '0.02em',
                color: t.text.primary,
              }}
            >
              finfamily
            </div>
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: t.receipt.sub,
                marginTop: 3,
              }}
            >
              Comprovante de lançamento
            </div>
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: `1.5px dashed ${t.receipt.line}`,
              margin: '14px 0',
            }}
          />

          {/* Type + description */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 4,
              color: typeMeta.color,
            }}
          >
            {typeMeta.label}
          </div>
          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: description ? t.text.primary : t.receipt.sub,
              fontStyle: description ? 'normal' : 'italic',
              marginBottom: 18,
              minHeight: 16,
              wordBreak: 'break-word',
            }}
          >
            {description || 'sem descrição'}
          </div>

          {/* Total */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: t.receipt.sub,
              marginBottom: 4,
            }}
          >
            Total
          </div>
          <div
            style={{
              textAlign: 'center',
              fontWeight: 700,
              fontSize: numericValue >= 100000 ? 24 : 30,
              letterSpacing: '-0.02em',
              color: t.text.primary,
              marginBottom: 16,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formattedValue}
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: `1.5px dashed ${t.receipt.line}`,
              margin: '14px 0',
            }}
          />

          {/* Detail lines */}
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span style={{ color: t.receipt.sub }}>Data</span>
              <span style={{ fontWeight: 700, color: t.text.primary }}>{shortDate || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span style={{ color: t.receipt.sub }}>Referência</span>
              <span style={{ fontWeight: 700, color: t.text.primary }}>{refDate || '—'}</span>
            </div>
            {type === 'expense' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ color: t.receipt.sub }}>Categoria</span>
                <span style={{ fontWeight: 700, color: t.text.primary }}>
                  {categoryName || '—'}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span style={{ color: t.receipt.sub }}>Responsável</span>
              <span style={{ fontWeight: 700, color: t.text.primary }}>{personName || '—'}</span>
            </div>
            {type === 'expense' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ color: t.receipt.sub }}>Pagamento</span>
                <span style={{ fontWeight: 700, color: t.text.primary }}>
                  {isCreditCard ? cardName || 'Cartão' : 'Conta'}
                </span>
              </div>
            )}
          </div>

          {/* Stamps */}
          {(isRecurring || isCreditCard || (type === 'expense' && isShared)) && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'center',
                flexWrap: 'wrap',
                margin: '14px 0 4px',
              }}
            >
              {type === 'expense' && isShared && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 9px',
                    border: `1.5px solid ${t.income.textAlt}`,
                    color: t.income.textAlt,
                    borderRadius: 3,
                    transform: 'rotate(-2deg)',
                  }}
                >
                  <Check size={10} strokeWidth={3} /> compartilhada
                </span>
              )}
              {isRecurring && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 9px',
                    border: `1.5px solid ${t.extra.textAlt}`,
                    color: t.extra.textAlt,
                    borderRadius: 3,
                    transform: 'rotate(1.5deg)',
                  }}
                >
                  <RotateCw size={10} strokeWidth={3} /> recorrente
                  {durationMonths ? ` · ${durationMonths}m` : ''}
                </span>
              )}
              {isCreditCard && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 9px',
                    border: `1.5px solid ${t.text.primary}`,
                    color: t.text.primary,
                    borderRadius: 3,
                    transform: 'rotate(-1deg)',
                  }}
                >
                  <CreditCard size={10} strokeWidth={3} />{' '}
                  {Number(installments) > 1 ? `${installments}x` : 'cartão'}
                </span>
              )}
            </div>
          )}

          <hr
            style={{
              border: 'none',
              borderTop: `1.5px dashed ${t.receipt.line}`,
              margin: '14px 0',
            }}
          />

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '14px 0 20px' }}>
            <div
              style={{
                height: 26,
                margin: '0 auto 8px',
                width: '80%',
                backgroundImage: `repeating-linear-gradient(90deg, ${t.receipt.ink} 0px, ${t.receipt.ink} 2px, transparent 2px, transparent 3px, ${t.receipt.ink} 3px, ${t.receipt.ink} 4px, transparent 4px, transparent 6px)`,
                opacity: 0.75,
              }}
            />
            <div style={{ fontSize: 9, letterSpacing: '0.1em', color: t.receipt.sub }}>
              Nº 0000-FF · via não fiscal
            </div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: 'italic',
                fontSize: 12,
                color: t.receipt.sub,
                marginTop: 8,
              }}
            >
              registrado com carinho
            </div>
          </div>
        </div>

        <div style={zigStyle(t.receipt.paper, true)} />
      </div>
    </div>
  );
}
