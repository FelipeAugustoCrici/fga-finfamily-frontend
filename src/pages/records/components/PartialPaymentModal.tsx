import { useState } from 'react';
import { useTokens } from '@/hooks/useTokens';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { X, CreditCard, Loader2, AlertCircle, CalendarArrowUp } from 'lucide-react';
import { useAddPayment } from '../hooks/useExpensePayments';

interface Props {
  expenseId: string;
  totalValue: number;
  paidAmount: number;
  description: string;
  expenseMonth: number;
  expenseYear: number;
  onClose: () => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function PartialPaymentModal({
  expenseId,
  totalValue,
  paidAmount,
  description,
  expenseMonth,
  expenseYear,
  onClose,
}: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const remaining = totalValue - paidAmount;

  const [payFull, setPayFull] = useState(true);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [transferToNextMonth, setTransferToNextMonth] = useState(false);

  const addPayment = useAddPayment(expenseId);

  const numericAmount = payFull ? remaining : parseFloat(amount) || 0;
  const remainingAfterPayment = Math.max(0, remaining - numericAmount);
  const isPartial = !payFull && remainingAfterPayment > 0.001;

  // Next month label
  const nextMonth = expenseMonth === 12 ? 1 : expenseMonth + 1;
  const nextYear = expenseMonth === 12 ? expenseYear + 1 : expenseYear;
  const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const nextMonthLabel = `${MONTHS_PT[nextMonth - 1]}/${nextYear}`;

  const validate = () => {
    if (numericAmount <= 0) {
      setError('Informe um valor maior que zero.');
      return false;
    }
    if (numericAmount > remaining + 0.001) {
      setError(`Valor não pode ser maior que o saldo pendente (${fmt(remaining)}).`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addPayment.mutate(
      {
        amount: numericAmount,
        note: note || undefined,
        transferToNextMonth: isPartial ? transferToNextMonth : false,
      },
      { onSuccess: onClose },
    );
  };

  const percentPaid = totalValue > 0 ? ((paidAmount / totalValue) * 100).toFixed(0) : '0';
  const percentAfter =
    totalValue > 0
      ? (((paidAmount + numericAmount) / totalValue) * 100).toFixed(0)
      : '0';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: t.bg.card,
          border: `1px solid ${t.border.default}`,
          borderRadius: 20,
          boxShadow: t.shadow.drop,
          width: '100%',
          maxWidth: 440,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${t.border.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: isDark ? 'rgba(16,185,129,0.15)' : '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={16} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: t.text.primary, margin: 0 }}>
                Registrar Pagamento
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: t.text.muted,
                  margin: 0,
                  maxWidth: 260,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: t.text.muted,
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progress bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
                fontSize: 11,
                color: t.text.muted,
              }}
            >
              <span>Progresso de pagamento</span>
              <span style={{ fontWeight: 700, color: t.text.primary }}>{percentPaid}% pago</span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 99,
                background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 99,
                  background: '#10b981',
                  width: `${percentPaid}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
            }}
          >
            {[
              { label: 'Total', value: fmt(totalValue), color: t.text.primary },
              { label: 'Pago', value: fmt(paidAmount), color: '#10b981' },
              { label: 'Pendente', value: fmt(remaining), color: '#f59e0b' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  border: `1px solid ${t.border.default}`,
                  borderRadius: 10,
                  padding: '8px 10px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 10, color: t.text.muted, margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: item.color, margin: 0 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Payment type toggle */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: t.text.muted, marginBottom: 8 }}>
              Tipo de pagamento
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { value: true, label: 'Pagar valor total', sub: fmt(remaining) },
                { value: false, label: 'Registrar pagamento parcial', sub: 'Informe o valor' },
              ].map((opt) => (
                <label
                  key={String(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1.5px solid ${payFull === opt.value ? '#10b981' : t.border.default}`,
                    background:
                      payFull === opt.value
                        ? isDark
                          ? 'rgba(16,185,129,0.08)'
                          : '#f0fdf4'
                        : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    checked={payFull === opt.value}
                    onChange={() => {
                      setPayFull(opt.value);
                      setError('');
                    }}
                    style={{ accentColor: '#10b981' }}
                  />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: t.text.primary, margin: 0 }}>
                      {opt.label}
                    </p>
                    <p style={{ fontSize: 11, color: t.text.muted, margin: 0 }}>{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Partial amount input */}
          {!payFull && (
            <div>
              <CurrencyInput
                label="Valor pago"
                placeholder="0,00"
                value={amount}
                onChange={(val) => {
                  setAmount(val);
                  setError('');
                }}
                error={error}
              />
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginTop: 5,
                    color: '#ef4444',
                    fontSize: 11,
                  }}
                >
                  <AlertCircle size={12} />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Competência do saldo restante — só aparece quando é pagamento parcial com saldo */}
          {isPartial && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: t.text.muted, marginBottom: 8 }}>
                Competência do saldo restante
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  {
                    value: false,
                    label: 'Manter no mês atual',
                    sub: `Saldo de ${fmt(remainingAfterPayment)} permanece neste mês · Status: Parc. Pago`,
                    icon: '📌',
                  },
                  {
                    value: true,
                    label: 'Transferir para próximo mês',
                    sub: `Nova conta de ${fmt(remainingAfterPayment)} criada em ${nextMonthLabel} · Status: Pendente`,
                    icon: '📅',
                  },
                ].map((opt) => (
                  <label
                    key={String(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1.5px solid ${transferToNextMonth === opt.value ? '#6366f1' : t.border.default}`,
                      background:
                        transferToNextMonth === opt.value
                          ? isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff'
                          : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      checked={transferToNextMonth === opt.value}
                      onChange={() => setTransferToNextMonth(opt.value)}
                      style={{ accentColor: '#6366f1', marginTop: 2, flexShrink: 0 }}
                    />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: t.text.primary, margin: 0 }}>
                        {opt.icon} {opt.label}
                      </p>
                      <p style={{ fontSize: 11, color: t.text.muted, margin: '2px 0 0' }}>{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label
              style={{ fontSize: 12, fontWeight: 600, color: t.text.secondary, display: 'block', marginBottom: 6 }}
            >
              Observação <span style={{ color: t.text.muted, fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Pago via PIX"
              style={{
                width: '100%',
                height: 38,
                padding: '0 12px',
                borderRadius: 10,
                border: `1.5px solid ${t.border.input}`,
                background: t.bg.input,
                color: t.text.primary,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Preview after payment */}
          {numericAmount > 0 && numericAmount <= remaining + 0.001 && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
                border: `1px solid ${isDark ? 'rgba(99,102,241,0.20)' : '#c7d2fe'}`,
                fontSize: 12,
                color: isDark ? '#a5b4fc' : '#4338ca',
              }}
            >
              {isPartial && transferToNextMonth ? (
                <>
                  Conta atual encerrada com <strong>{fmt(numericAmount)}</strong> pago ·{' '}
                  Nova conta de <strong>{fmt(remainingAfterPayment)}</strong> criada em{' '}
                  <strong>{nextMonthLabel}</strong>
                </>
              ) : (
                <>
                  Após este pagamento: <strong>{fmt(paidAmount + numericAmount)}</strong> pago
                  ({percentAfter}%) · Saldo restante:{' '}
                  <strong>{fmt(remainingAfterPayment)}</strong>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: `1px solid ${t.border.divider}`,
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose} style={{ fontSize: 13 }}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={addPayment.isPending}
            style={{ fontSize: 13, minWidth: 140 }}
          >
            {addPayment.isPending ? (
              <Loader2 size={14} style={{ marginRight: 6 }} className="animate-spin" />
            ) : (
              <CreditCard size={14} style={{ marginRight: 6 }} />
            )}
            Confirmar pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}
