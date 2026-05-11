import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { api } from '@/services/api.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { creditCardsService } from '@/pages/credit-cards/services/credit-cards.service';
import { CreditCard, AlertCircle, TrendingDown, ArrowRight } from 'lucide-react';
import { formatShortDate } from '@/common/utils/date';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  month: number;
  year: number;
}

export function CreditCardsSummary({ month, year }: Props) {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data } = await api.get('/finance/families');
      return data;
    },
  });
  const familyId = families[0]?.id;

  const { data: cards = [] } = useQuery({
    queryKey: ['credit-cards-summary', familyId, month, year],
    queryFn: () => creditCardsService.getSummaryByFamily(familyId, month, year),
    enabled: !!familyId,
  });

  const { data: allInvoices = [] } = useQuery({
    queryKey: ['family-invoices', familyId],
    queryFn: () => creditCardsService.getAllInvoicesByFamily(familyId),
    enabled: !!familyId,
  });

  if (!cards.length) return null;

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const totalLimit = cards.reduce((s, c) => s + c.limitAmount, 0);
  const totalAvailable = cards.reduce((s, c) => s + c.availableLimit, 0);
  const totalUsed = totalLimit - totalAvailable;
  const usedPercent = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

  const openInvoices = allInvoices.filter((i) => i.status === 'open' || i.status === 'overdue');
  const totalOpen = openInvoices.reduce((s, i) => s + i.totalAmount, 0);

  const nextDue = openInvoices
    .filter((i) => i.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const daysUntilDue = nextDue
    ? moment(nextDue.dueDate).diff(moment().startOf('day'), 'days')
    : null;

  const futureInstallments = allInvoices
    .filter((i) => {
      const isFuture =
        i.referenceYear > year || (i.referenceYear === year && i.referenceMonth > month);
      return isFuture && i.status !== 'paid';
    })
    .reduce((s, i) => s + i.totalAmount, 0);

  const limitBarColor =
    usedPercent > 80
      ? isDark
        ? '#fca5a5'
        : '#ef4444'
      : usedPercent > 60
        ? isDark
          ? '#fcd34d'
          : '#f59e0b'
        : isDark
          ? '#6ee7b7'
          : '#16a34a';

  const trackBg = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const dividerClr = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  const utilizationColor =
    usedPercent > 80
      ? isDark
        ? '#fca5a5'
        : '#991b1b'
      : usedPercent > 60
        ? isDark
          ? '#fcd34d'
          : '#92400e'
        : isDark
          ? '#6ee7b7'
          : '#166534';

  return (
    <Card
      title="Cartões de Crédito"
      footer={
        <Button
          variant="ghost"
          className="w-full text-primary-600 hover:text-primary-800"
          onClick={() => navigate('/credit-cards')}
        >
          Ver todos os cartões <ArrowRight size={16} className="ml-2" />
        </Button>
      }
    >
      <div className="space-y-6">
        {}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-primary-500 font-medium">Limite Usado</span>
              <span className="text-primary-800 font-bold">{fmt(totalUsed)}</span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: trackBg }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${usedPercent}%`, background: limitBarColor }}
              />
            </div>
            <p className="text-xs text-primary-400">de {fmt(totalLimit)} disponível</p>
          </div>

          {}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-primary-500 font-medium">Faturas em Aberto</span>
              <span className="text-danger-600 font-bold">{fmt(totalOpen)}</span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: trackBg }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: '100%', background: isDark ? '#fca5a5' : '#ef4444' }}
              />
            </div>
            <p className="text-xs text-primary-400">
              {openInvoices.length} fatura{openInvoices.length !== 1 ? 's' : ''} pendente
              {openInvoices.length !== 1 ? 's' : ''}
            </p>
          </div>

          {}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-primary-500 font-medium">Parcelamentos Futuros</span>
              <span className="text-primary-800 font-bold">{fmt(futureInstallments)}</span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: trackBg }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: '100%', background: isDark ? '#93c5fd' : '#6366f1' }}
              />
            </div>
            <p className="text-xs text-primary-400">comprometido nos próximos meses</p>
          </div>
        </div>

        {}
        <div className="pt-4" style={{ borderTop: `1px solid ${dividerClr}` }}>
          <p className="text-xs text-primary-400 uppercase font-bold tracking-wider mb-2">
            Índice de Utilização
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold" style={{ color: utilizationColor }}>
              {usedPercent.toFixed(1)}%
            </span>
            <span className="text-sm text-primary-500 pb-1">do limite total utilizado</span>
          </div>
          <p className="text-xs text-primary-400 mt-2">
            O ideal é manter o uso abaixo de 30% do limite para não impactar o score.
          </p>
        </div>

        {}
        {(daysUntilDue !== null || usedPercent > 70 || futureInstallments > 0) && (
          <div className="space-y-2 pt-2" style={{ borderTop: `1px solid ${dividerClr}` }}>
            {daysUntilDue !== null && daysUntilDue <= 7 && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{
                  background: isDark ? 'rgba(252,211,77,0.08)' : '#fefce8',
                  border: `1px solid ${isDark ? 'rgba(252,211,77,0.2)' : '#fde68a'}`,
                  color: isDark ? '#fcd34d' : '#92400e',
                }}
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>
                  Sua próxima fatura vence{' '}
                  {daysUntilDue === 0
                    ? 'hoje'
                    : `em ${daysUntilDue} dia${daysUntilDue !== 1 ? 's' : ''}`}{' '}
                  — {fmt(nextDue!.totalAmount)} ({formatShortDate(nextDue!.dueDate)})
                </span>
              </div>
            )}
            {usedPercent > 70 && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{
                  background: isDark ? 'rgba(252,165,165,0.08)' : '#fef2f2',
                  border: `1px solid ${isDark ? 'rgba(252,165,165,0.2)' : '#fecaca'}`,
                  color: isDark ? '#fca5a5' : '#991b1b',
                }}
              >
                <CreditCard size={15} className="flex-shrink-0" />
                <span>
                  Você já utilizou {usedPercent.toFixed(0)}% do limite total dos seus cartões
                </span>
              </div>
            )}
            {futureInstallments > 0 && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{
                  background: isDark ? 'rgba(147,197,253,0.08)' : '#eff6ff',
                  border: `1px solid ${isDark ? 'rgba(147,197,253,0.2)' : '#bfdbfe'}`,
                  color: isDark ? '#93c5fd' : '#1e40af',
                }}
              >
                <TrendingDown size={15} className="flex-shrink-0" />
                <span>
                  Compras parceladas comprometem {fmt(futureInstallments)} dos próximos meses
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
