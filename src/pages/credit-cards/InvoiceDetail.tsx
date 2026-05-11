import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useInvoiceById } from './hooks/useCreditCards';
import { InvoiceStatusBadge } from './components/InvoiceStatusBadge';
import { PayInvoiceModal } from './components/PayInvoiceModal';
import { formatShortDate } from '@/common/utils/date';
import { ArrowLeft } from 'lucide-react';
import _ from 'lodash';

export function InvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [payOpen, setPayOpen] = useState(false);

  const { data: invoice, isLoading } = useInvoiceById(invoiceId!);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (isLoading)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '8px 0' }}>
        <Skeleton height={40} width={200} borderRadius={10} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={88} borderRadius={18} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <Skeleton height={320} borderRadius={18} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton height={150} borderRadius={18} />
            <Skeleton height={150} borderRadius={18} />
          </div>
        </div>
      </div>
    );
  if (!invoice)
    return <div className="text-center py-16 text-primary-500">Fatura não encontrada</div>;

  const byCategory = _.groupBy(
    invoice.installments,
    (i) => i.purchase?.category?.name || 'Sem categoria',
  );
  const byPerson = _.groupBy(
    invoice.installments,
    (i) => i.purchase?.owner?.name || 'Sem responsável',
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            Fatura {String(invoice.referenceMonth).padStart(2, '0')}/{invoice.referenceYear}
          </h1>
          <p className="text-primary-500 text-sm">{invoice.creditCard?.name}</p>
        </div>
        {invoice.status !== 'paid' && (
          <Button onClick={() => setPayOpen(true)}>Pagar Fatura</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Fechamento', value: formatShortDate(invoice.closingDate) },
          { label: 'Vencimento', value: formatShortDate(invoice.dueDate) },
          { label: 'Total', value: fmt(invoice.totalAmount) },
          { label: 'Status', value: <InvoiceStatusBadge status={invoice.status} /> },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-xs text-primary-500 uppercase font-medium tracking-wider mb-1">
              {item.label}
            </p>
            <div className="text-lg font-bold text-primary-800">{item.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2">
          <Card title="Compras e Parcelas">
            {!invoice.installments?.length ? (
              <p className="text-center py-8 text-primary-400 text-sm">
                Nenhuma compra nesta fatura
              </p>
            ) : (
              <div className="space-y-2">
                {invoice.installments.map((inst) => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-primary-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary-800">
                        {inst.purchase?.description}
                        {inst.totalInstallments > 1 && (
                          <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">
                            {inst.installmentNumber}/{inst.totalInstallments}
                          </span>
                        )}
                      </p>
                      <div className="flex gap-2 mt-0.5">
                        {inst.purchase?.category && (
                          <span className="text-xs text-primary-400">
                            {inst.purchase.category.name}
                          </span>
                        )}
                        {inst.purchase?.owner && (
                          <span className="text-xs text-primary-400">
                            • {inst.purchase.owner.name}
                          </span>
                        )}
                        <span className="text-xs text-primary-400">
                          • {formatShortDate(inst.purchase?.purchaseDate || '')}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary-800">{fmt(inst.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {}
        <div className="space-y-4">
          <Card title="Por Categoria">
            <div className="space-y-2">
              {Object.entries(byCategory).map(([cat, items]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-primary-600">{cat}</span>
                  <span className="font-medium text-primary-800">
                    {fmt(items.reduce((s, i) => s + i.amount, 0))}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Por Responsável">
            <div className="space-y-2">
              {Object.entries(byPerson).map(([person, items]) => (
                <div key={person} className="flex justify-between text-sm">
                  <span className="text-primary-600">{person}</span>
                  <span className="font-medium text-primary-800">
                    {fmt(items.reduce((s, i) => s + i.amount, 0))}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <PayInvoiceModal isOpen={payOpen} onClose={() => setPayOpen(false)} invoice={invoice} />
    </div>
  );
}
