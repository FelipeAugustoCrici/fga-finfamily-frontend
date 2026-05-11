import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCreditCardById, useInvoices } from './hooks/useCreditCards';
import { CardVisual } from './components/CardVisual';
import { InvoiceStatusBadge } from './components/InvoiceStatusBadge';
import { PurchaseFormModal } from './components/PurchaseFormModal';
import { PayInvoiceModal } from './components/PayInvoiceModal';
import type { CreditCardInvoice } from './types/credit-card.types';
import { formatShortDate } from '@/common/utils/date';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, ShoppingBag, CreditCard, Receipt } from 'lucide-react';

export function CreditCardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState<CreditCardInvoice | null>(null);

  const { data: card, isLoading } = useCreditCardById(id!);
  const { data: invoices = [] } = useInvoices(id!);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (isLoading)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, padding: '24px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height={180} borderRadius={18} />
          <Skeleton height={120} borderRadius={18} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={64} borderRadius={12} />
          ))}
        </div>
      </div>
    );
  if (!card) return <div className="text-center py-16 text-primary-500">Cartão não encontrado</div>;

  const usedAmount = card.limitAmount - card.availableLimit;
  const usedPercent = card.limitAmount > 0 ? (usedAmount / card.limitAmount) * 100 : 0;
  const openInvoice = invoices.find((i) => i.status === 'open');
  const nextInvoice = invoices.find((i) => i.status === 'open' || i.status === 'closed');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/credit-cards')}>
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{card.name}</h1>
          <p className="text-primary-500 text-sm">{card.bank || 'Cartão de Crédito'}</p>
        </div>
        <Button onClick={() => setPurchaseModalOpen(true)}>
          <ShoppingBag size={16} className="mr-2" /> Nova Compra
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="space-y-4">
          <CardVisual card={card} />
          <Card>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Limite Total</span>
                <span className="font-bold text-primary-800">{fmt(card.limitAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Limite Usado</span>
                <span className="font-bold text-danger-600">{fmt(usedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Disponível</span>
                <span className="font-bold text-success-600">{fmt(card.availableLimit)}</span>
              </div>
              <div className="w-full bg-primary-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${usedPercent > 80 ? 'bg-danger-500' : usedPercent > 60 ? 'bg-amber-400' : 'bg-success-500'}`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              <p className="text-xs text-primary-400 text-center">
                {usedPercent.toFixed(0)}% do limite utilizado
              </p>
            </div>
          </Card>

          {nextInvoice && (
            <Card title="Próxima Fatura">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-500">Vencimento</span>
                  <span className="font-medium">{formatShortDate(nextInvoice.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-500">Valor</span>
                  <span className="font-bold text-primary-800">{fmt(nextInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-500">Status</span>
                  <InvoiceStatusBadge status={nextInvoice.status} />
                </div>
                {nextInvoice.status !== 'paid' && (
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setPayInvoice(nextInvoice)}
                  >
                    Pagar Fatura
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Histórico de Faturas" description="Todas as faturas do cartão">
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-primary-400">
                <Receipt size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhuma fatura ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-primary-100 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <CreditCard size={18} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary-800">
                          {String(invoice.referenceMonth).padStart(2, '0')}/{invoice.referenceYear}
                        </p>
                        <p className="text-xs text-primary-500">
                          Vence {formatShortDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary-800">
                          {fmt(invoice.totalAmount)}
                        </p>
                        <InvoiceStatusBadge status={invoice.status} />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/credit-cards/invoices/${invoice.id}`)}
                        >
                          {' '}
                          Ver
                        </Button>
                        {invoice.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPayInvoice(invoice)}
                          >
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {}
          {openInvoice?.installments && openInvoice.installments.length > 0 && (
            <Card title="Compras na Fatura Atual">
              <div className="space-y-2">
                {openInvoice.installments.map((inst) => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-primary-50/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary-800">
                        {inst.purchase?.description}
                        {inst.totalInstallments > 1 && (
                          <span className="ml-2 text-xs text-primary-500">
                            {inst.installmentNumber}/{inst.totalInstallments}
                          </span>
                        )}
                      </p>
                      {inst.purchase?.category && (
                        <p className="text-xs text-primary-400">{inst.purchase.category.name}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-primary-800">{fmt(inst.amount)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <PurchaseFormModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        familyId={card.familyId}
        defaultCardId={id}
      />
      <PayInvoiceModal
        isOpen={!!payInvoice}
        onClose={() => setPayInvoice(null)}
        invoice={payInvoice}
      />
    </div>
  );
}
