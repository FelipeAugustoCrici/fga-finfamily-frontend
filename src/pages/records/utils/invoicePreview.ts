/**
 * Espelha, no frontend, a mesma regra de `resolveInvoicePeriod` do backend
 * (fga-finfamily-backend/src/modules/credit-cards/credit-cards.service.ts)
 * — só para mostrar uma prévia de "em qual fatura isso cai" antes de
 * enviar o lançamento. O cálculo definitivo é sempre feito no servidor.
 */
export function resolveInvoicePeriodPreview(
  purchaseDateStr: string,
  closingDay: number,
  dueDay: number,
) {
  const purchaseDate = new Date(purchaseDateStr + 'T00:00:00');
  const day = purchaseDate.getDate();
  const month = purchaseDate.getMonth() + 1;
  const year = purchaseDate.getFullYear();

  const baseOffset = day > closingDay ? 2 : 1;

  let invoiceMonth = month + baseOffset;
  let invoiceYear = year;
  while (invoiceMonth > 12) {
    invoiceMonth -= 12;
    invoiceYear += 1;
  }

  const dueDate = new Date(invoiceYear, invoiceMonth - 1, dueDay);

  return { invoiceMonth, invoiceYear, dueDate };
}

const MONTHS_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

export function formatInvoicePreview(
  purchaseDateStr: string,
  closingDay: number,
  dueDay: number,
): string {
  if (!purchaseDateStr) return '';
  const { invoiceMonth, invoiceYear, dueDate } = resolveInvoicePeriodPreview(
    purchaseDateStr,
    closingDay,
    dueDay,
  );
  const monthLabel = `${MONTHS_SHORT[invoiceMonth - 1]}/${invoiceYear}`;
  const dueLabel = `${String(dueDate.getDate()).padStart(2, '0')}/${String(
    dueDate.getMonth() + 1,
  ).padStart(2, '0')}`;
  return `Cai na fatura de ${monthLabel} · vence em ${dueLabel}`;
}
