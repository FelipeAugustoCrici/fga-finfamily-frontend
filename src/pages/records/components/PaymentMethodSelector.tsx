import { useState } from 'react';
import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { Wallet, CreditCard as CreditCardIcon } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useTokens } from '@/hooks/useTokens';
import { formatInvoicePreview } from '../utils/invoicePreview';
import type { CreditCard } from '@/pages/credit-cards/types/credit-card.types';

interface MethodCardProps {
  icon: React.ReactNode;
  title: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function MethodCard({ icon, title, checked, onToggle, disabled }: MethodCardProps) {
  const t = useTokens();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '11px 12px',
        borderRadius: 999,
        border: `1px solid ${checked ? t.text.primary : hovered ? t.border.strong : t.border.default}`,
        background: checked ? t.bg.cardHover : t.bg.card,
        color: checked ? t.text.primary : t.text.muted,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontSize: 13.5,
        fontWeight: 600,
        flex: 1,
        minWidth: 140,
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
      {title}
    </button>
  );
}

const installmentOptions = Array.from({ length: 24 }, (_, i) => ({
  value: String(i + 1),
  label: i === 0 ? 'À vista (1x)' : `${i + 1}x`,
}));

interface PaymentMethodSelectorProps {
  creditCards: CreditCard[];
  disabled?: boolean;
}

export function PaymentMethodSelector({ creditCards, disabled }: PaymentMethodSelectorProps) {
  const { control, setValue, formState } = useFormContext();
  const t = useTokens();

  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const creditCardId = useWatch({ control, name: 'creditCardId' });
  const value = useWatch({ control, name: 'value' });
  const date = useWatch({ control, name: 'date' });

  const selectedCard = creditCards.find((c) => c.id === creditCardId);
  const isCreditCard = paymentMethod === 'credit_card';

  const cardOptions = creditCards.map((c) => ({ value: c.id, label: c.name }));

  const installmentValue = Number(value || 0);
  const previewText =
    isCreditCard && selectedCard && date
      ? formatInvoicePreview(date, selectedCard.closingDay, selectedCard.dueDay)
      : '';

  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: t.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 10,
        }}
      >
        Forma de pagamento
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: isCreditCard ? 12 : 0 }}>
        <MethodCard
          icon={<Wallet size={14} />}
          title="Conta"
          checked={!isCreditCard}
          disabled={disabled}
          onToggle={() => setValue('paymentMethod', 'account', { shouldValidate: true })}
        />
        <MethodCard
          icon={<CreditCardIcon size={14} />}
          title="Cartão de crédito"
          checked={isCreditCard}
          disabled={disabled || creditCards.length === 0}
          onToggle={() => setValue('paymentMethod', 'credit_card', { shouldValidate: true })}
        />
      </div>

      {isCreditCard && creditCards.length === 0 && !disabled && (
        <p style={{ fontSize: 11.5, color: t.warning.text, marginTop: 6 }}>
          Cadastre um cartão em Cartões para poder usá-lo aqui.
        </p>
      )}

      {isCreditCard && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
            className="grid-cols-1 sm:grid-cols-2"
          >
            <Controller
              name="creditCardId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Cartão"
                  placeholder="Selecione"
                  options={cardOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  error={formState.errors.creditCardId?.message as string}
                />
              )}
            />
            <Controller
              name="installments"
              control={control}
              render={({ field }) => (
                <Select
                  label="Parcelas"
                  options={installmentOptions}
                  value={field.value || '1'}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              )}
            />
          </div>

          {selectedCard && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '10px 12px',
                borderRadius: 10,
                background: t.bg.muted,
                border: `1px solid ${t.border.default}`,
              }}
            >
              {previewText && (
                <p style={{ fontSize: 12, color: t.text.secondary, fontWeight: 600 }}>
                  {previewText}
                </p>
              )}
              <p style={{ fontSize: 11.5, color: t.text.muted }}>
                Limite disponível:{' '}
                <strong style={{ color: t.text.secondary }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    selectedCard.availableLimit,
                  )}
                </strong>
                {installmentValue > selectedCard.availableLimit && (
                  <span style={{ color: t.expense.text, fontWeight: 700 }}>
                    {' '}
                    · valor acima do limite disponível
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
