import { useForm, Controller } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { usePayInvoice } from '../hooks/useCreditCards';
import type { CreditCardInvoice } from '../types/credit-card.types';
import { formatShortDate } from '@/common/utils/date';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: CreditCardInvoice | null;
}

export function PayInvoiceModal({ isOpen, onClose, invoice }: Props) {
  const pay = usePayInvoice();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { paidAmount: invoice?.totalAmount?.toString() || '' },
  });

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const onSubmit = (data: { paidAmount: string }) => {
    if (!invoice) return;
    pay.mutate(
      { invoiceId: invoice.id, paidAmount: Number(data.paidAmount) },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pagar Fatura">
      <div className="space-y-4">
        <div className="bg-primary-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-primary-500">Vencimento</span>
            <span className="font-medium text-primary-800">{formatShortDate(invoice.dueDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary-500">Valor total</span>
            <span className="font-bold text-primary-800">{fmt(invoice.totalAmount)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="paidAmount"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Valor pago"
                placeholder="0,00"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={pay.isPending}>
              Confirmar Pagamento
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
