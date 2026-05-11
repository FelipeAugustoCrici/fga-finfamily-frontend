import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '../types/credit-card.types';

export function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_COLORS[status] || 'bg-primary-100 text-primary-700'}`}
    >
      {INVOICE_STATUS_LABELS[status] || status}
    </span>
  );
}
