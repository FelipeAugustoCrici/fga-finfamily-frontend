import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api.service';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTokens } from '@/hooks/useTokens';
import { useCreditCards, useDeleteCreditCard, useInvoices } from './hooks/useCreditCards';
import { CardVisual } from './components/CardVisual';
import { CreditCardFormModal } from './components/CreditCardFormModal';
import { PurchaseFormModal } from './components/PurchaseFormModal';
import { PayInvoiceModal } from './components/PayInvoiceModal';
import { InvoiceStatusBadge } from './components/InvoiceStatusBadge';
import { ConfirmModal } from '@/components/ui/Modal';
import { SkeletonCreditCards } from '@/components/ui/Skeleton';
import { formatShortDate } from '@/common/utils/date';
import type { CreditCard, CreditCardInvoice } from './types/credit-card.types';
import {
  Plus,
  Eye,
  Trash2,
  CreditCard as CreditCardIcon,
  ShoppingBag,
  Receipt,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function CreditCardItem({
  card,
  onDelete,
  onPurchase,
  onNavigate,
}: {
  card: CreditCard;
  onDelete: (id: string) => void;
  onPurchase: (cardId: string) => void;
  onNavigate: (id: string) => void;
}) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const [payInvoice, setPayInvoice] = useState<CreditCardInvoice | null>(null);

  const { data: invoices = [] } = useInvoices(card.id);
  const openInvoice = invoices.find((i) => i.status === 'open' || i.status === 'closed');
  const recentInstallments = openInvoice?.installments?.slice(0, 3) ?? [];

  const usedAmount = card.limitAmount - card.availableLimit;
  const usedPercent =
    card.limitAmount > 0 ? Math.min((usedAmount / card.limitAmount) * 100, 100) : 0;

  const usageColor =
    usedPercent > 80 ? t.expense.text : usedPercent > 60 ? t.warning.text : t.income.text;

  const usageLabel = usedPercent > 80 ? 'Alto uso' : usedPercent > 60 ? 'Moderado' : 'Baixo uso';

  const usageBg =
    usedPercent > 80 ? t.expense.bgIcon : usedPercent > 60 ? t.warning.bg : t.income.bgIcon;

  return (
    <>
      <div
        style={{
          background: t.bg.card,
          border: `1px solid ${t.border.default}`,
          borderRadius: 20,
          boxShadow: t.shadow.card,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}
        onClick={() => onNavigate(card.id)}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.cardLg;
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = t.shadow.card;
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {}
        <div style={{ padding: '16px 16px 0' }}>
          <CardVisual card={card} />
        </div>

        {}
        <div style={{ padding: '16px 18px 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 11, color: t.text.muted, fontWeight: 500 }}>
              Uso do limite
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 20,
                background: usageBg,
                color: usageColor,
              }}
            >
              {usageLabel}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 6,
              borderRadius: 99,
              background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 99,
                width: `${usedPercent}%`,
                background:
                  usedPercent > 80
                    ? `linear-gradient(90deg, ${t.expense.text}, ${t.expense.textAlt})`
                    : usedPercent > 60
                      ? `linear-gradient(90deg, ${t.warning.text}, #f59e0b)`
                      : `linear-gradient(90deg, ${t.income.text}, ${t.income.textAlt})`,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: t.text.muted }}>
              Usado:{' '}
              <span style={{ color: t.text.secondary, fontWeight: 600 }}>{fmt(usedAmount)}</span>
            </span>
            <span style={{ fontSize: 11, color: t.text.muted }}>
              Disponível:{' '}
              <span style={{ color: t.income.text, fontWeight: 600 }}>
                {fmt(card.availableLimit)}
              </span>
            </span>
          </div>
        </div>

        {}
        {openInvoice && (
          <div
            style={{
              margin: '14px 18px 0',
              padding: '12px 14px',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
              borderRadius: 12,
              border: `1px solid ${t.border.subtle}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: t.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Fatura atual
              </span>
              <InvoiceStatusBadge status={openInvoice.status} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
              {[
                { label: 'Total', value: fmt(openInvoice.totalAmount), highlight: true },
                { label: 'Vencimento', value: formatShortDate(openInvoice.dueDate) },
                { label: 'Fechamento', value: formatShortDate(openInvoice.closingDate) },
                { label: 'Limite total', value: fmt(card.limitAmount) },
              ].map(({ label, value, highlight }) => (
                <div key={label}>
                  <p style={{ fontSize: 10, color: t.text.subtle }}>{label}</p>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: highlight ? 700 : 500,
                      color: highlight ? t.text.primary : t.text.secondary,
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {recentInstallments.length > 0 && (
          <div style={{ padding: '12px 18px 0' }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: t.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}
            >
              Últimas compras
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentInstallments.map((inst) => (
                <div
                  key={inst.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: `1px solid ${t.border.divider}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: t.investment.text,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: t.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {inst.purchase?.description}
                    </span>
                    {inst.totalInstallments > 1 && (
                      <span style={{ fontSize: 10, color: t.text.subtle, flexShrink: 0 }}>
                        {inst.installmentNumber}/{inst.totalInstallments}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: t.text.primary,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {fmt(inst.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        <div
          style={{
            padding: '14px 18px 16px',
            marginTop: 'auto',
            display: 'flex',
            gap: 8,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onNavigate(card.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              border: `1px solid ${t.border.default}`,
              background: 'transparent',
              color: t.text.secondary,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = t.bg.muted;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <Eye size={13} /> Ver fatura
          </button>

          <button
            onClick={() => onPurchase(card.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              border: 'none',
              background: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.10)',
              color: t.text.link,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = isDark
                ? 'rgba(99,102,241,0.28)'
                : 'rgba(99,102,241,0.18)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = isDark
                ? 'rgba(99,102,241,0.18)'
                : 'rgba(99,102,241,0.10)';
            }}
          >
            <ShoppingBag size={13} /> Nova compra
          </button>

          {openInvoice && openInvoice.status !== 'paid' && (
            <button
              onClick={() => setPayInvoice(openInvoice)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                border: 'none',
                background: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.10)',
                color: t.income.text,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = isDark
                  ? 'rgba(34,197,94,0.25)'
                  : 'rgba(34,197,94,0.18)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = isDark
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(34,197,94,0.10)';
              }}
            >
              <Receipt size={13} /> Pagar
            </button>
          )}

          <button
            onClick={() => onDelete(card.id)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${t.border.default}`,
              background: 'transparent',
              color: t.text.muted,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = t.expense.bgIcon;
              (e.currentTarget as HTMLElement).style.color = t.expense.text;
              (e.currentTarget as HTMLElement).style.borderColor = t.expense.border;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = t.text.muted;
              (e.currentTarget as HTMLElement).style.borderColor = t.border.default;
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <PayInvoiceModal
        isOpen={!!payInvoice}
        onClose={() => setPayInvoice(null)}
        invoice={payInvoice}
      />
    </>
  );
}

export function CreditCardsList() {
  const navigate = useNavigate();
  const t = useTokens();

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [purchaseCardId, setPurchaseCardId] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data } = await api.get('/finance/families');
      return data;
    },
  });
  const familyId = families[0]?.id;

  const { data: cards = [], isLoading } = useCreditCards(familyId);
  const deleteCard = useDeleteCreditCard();

  const handlePurchase = (cardId: string) => {
    setPurchaseCardId(cardId);
    setPurchaseModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        actions={
          <>
            <ActionButton
              variant="secondary"
              onClick={() => {
                setPurchaseCardId(undefined);
                setPurchaseModalOpen(true);
              }}
              icon={<ShoppingBag size={15} />}
            >
              Nova Compra
            </ActionButton>
            <ActionButton onClick={() => setCardModalOpen(true)}>Novo Cartão</ActionButton>
          </>
        }
      />

      {isLoading ? (
        <SkeletonCreditCards count={3} t={t} />
      ) : cards.length === 0 ? (
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 20,
            boxShadow: t.shadow.card,
            padding: '64px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              margin: '0 auto 16px',
              background: t.bg.muted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCardIcon size={28} style={{ color: t.text.muted }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: t.text.primary, marginBottom: 6 }}>
            Nenhum cartão cadastrado
          </p>
          <p style={{ fontSize: 13, color: t.text.muted, marginBottom: 24 }}>
            Adicione seus cartões para controlar faturas e parcelamentos
          </p>
          <Button onClick={() => setCardModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Adicionar Cartão
          </Button>
        </div>
      ) : (
        <>
          {}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              {
                label: 'Limite total',
                value: fmt(cards.reduce((s, c) => s + c.limitAmount, 0)),
                icon: TrendingUp,
                color: t.investment.text,
                bg: t.investment.bgIcon,
              },
              {
                label: 'Total usado',
                value: fmt(cards.reduce((s, c) => s + (c.limitAmount - c.availableLimit), 0)),
                icon: AlertCircle,
                color: t.expense.text,
                bg: t.expense.bgIcon,
              },
              {
                label: 'Disponível',
                value: fmt(cards.reduce((s, c) => s + c.availableLimit, 0)),
                icon: CreditCardIcon,
                color: t.income.text,
                bg: t.income.bgIcon,
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                style={{
                  background: t.bg.card,
                  border: `1px solid ${t.border.default}`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  boxShadow: t.shadow.card,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p
                    style={{ fontSize: 18, fontWeight: 800, color: t.text.primary, lineHeight: 1 }}
                  >
                    {value}
                  </p>
                  <p style={{ fontSize: 11, color: t.text.muted, marginTop: 3 }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {cards.map((card) => (
              <CreditCardItem
                key={card.id}
                card={card}
                onDelete={(id) => setDeleteId(id)}
                onPurchase={handlePurchase}
                onNavigate={(id) => navigate(`/credit-cards/${id}`)}
              />
            ))}
          </div>
        </>
      )}

      <CreditCardFormModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        familyId={familyId}
      />
      <PurchaseFormModal
        isOpen={purchaseModalOpen}
        onClose={() => {
          setPurchaseModalOpen(false);
          setPurchaseCardId(undefined);
        }}
        familyId={familyId}
        defaultCardId={purchaseCardId}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteCard.mutate(deleteId);
            setDeleteId(null);
          }
        }}
        title="Remover Cartão"
        description="Tem certeza que deseja remover este cartão? As faturas e compras serão mantidas."
      />
    </div>
  );
}
