import { useTokens } from '@/hooks/useTokens';
import { CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { formatShortDate } from '@/common/utils/date';
import { useDeletePayment } from '../hooks/useExpensePayments';
import { ExpensePayment } from '../types/record.types';

interface Props {
  expenseId: string;
  payments: ExpensePayment[];
  totalValue: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function PaymentHistory({ expenseId, payments, totalValue }: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const deletePayment = useDeletePayment(expenseId);

  if (payments.length === 0) return null;

  return (
    <div
      style={{
        background: t.bg.card,
        border: `1px solid ${t.border.default}`,
        borderRadius: 18,
        padding: '18px 22px',
        boxShadow: t.shadow.card,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: t.text.muted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 16,
        }}
      >
        Histórico de Pagamentos
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {payments.map((payment, idx) => {
          const isLast = idx === payments.length - 1;
          const percentPaid = totalValue > 0
            ? (((totalValue - payment.remainingAfter) / totalValue) * 100).toFixed(0)
            : '0';

          return (
            <div key={payment.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
              {/* Timeline line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: 11,
                    top: 24,
                    bottom: 0,
                    width: 2,
                    background: t.border.default,
                  }}
                />
              )}

              {/* Dot */}
              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: payment.remainingAfter <= 0.001
                      ? isDark ? 'rgba(16,185,129,0.20)' : '#dcfce7'
                      : isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff',
                    border: `2px solid ${payment.remainingAfter <= 0.001 ? '#10b981' : '#6366f1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2
                    size={12}
                    color={payment.remainingAfter <= 0.001 ? '#10b981' : '#6366f1'}
                  />
                </div>
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  paddingBottom: isLast ? 0 : 16,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                      {fmt(payment.amount)}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 5,
                        background: isDark ? 'rgba(16,185,129,0.12)' : '#dcfce7',
                        color: '#10b981',
                      }}
                    >
                      {percentPaid}% quitado
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: t.text.muted, margin: '2px 0 0' }}>
                    {formatShortDate(payment.paidAt)} · Saldo restante: {fmt(payment.remainingAfter)}
                  </p>
                  {payment.note && (
                    <p style={{ fontSize: 11, color: t.text.subtle, margin: '2px 0 0', fontStyle: 'italic' }}>
                      {payment.note}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => deletePayment.mutate(payment.id)}
                  disabled={deletePayment.isPending}
                  title="Remover pagamento"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: t.text.muted,
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = isDark
                      ? 'rgba(239,68,68,0.12)'
                      : '#fef2f2';
                    (e.currentTarget as HTMLElement).style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = t.text.muted;
                  }}
                >
                  {deletePayment.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
