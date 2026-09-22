import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Check,
  Loader2,
  Undo2,
  CreditCard,
} from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../utils/formatters';
import { formatShortDate } from '@/common/utils/date';
import type { UnifiedRecord, RecordStatus } from '../types/record.types';

// ─── Date grouping helpers ────────────────────────────────────────────────────

function groupLabel(dateStr: string): string {
  const date = moment(dateStr);
  if (!date.isValid()) return 'Sem data';

  if (date.isSame(moment(), 'day')) return 'Hoje';
  if (date.isSame(moment().subtract(1, 'day'), 'day')) return 'Ontem';

  return date.toDate().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function groupByDate(records: UnifiedRecord[]): { label: string; items: UnifiedRecord[] }[] {
  const map = new Map<string, UnifiedRecord[]>();
  for (const r of records) {
    const label = groupLabel(r.date);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(r);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

// ─── Action menu ─────────────────────────────────────────────────────────────

function ActionMenu({
  record,
  onDelete,
  deleteLoading,
  onStatusChange,
  updateLoading,
}: {
  record: UnifiedRecord;
  onDelete: (r: UnifiedRecord) => void;
  deleteLoading: boolean;
  onStatusChange: (id: string, status: RecordStatus) => void;
  updateLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const t = useTokens();
  const isDark = t.bg.page === '#12161a';
  // Parcela de compra no cartão já nasce paga; a fatura agregada é que pode
  // ser marcada como paga por aqui.
  const canMarkPaid = record.status !== 'PAID' && !record.purchaseId;

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // itens (~39px cada) + divisor + bordas; "Marcar como pago" some quando já está pago ou é do cartão
      const menuHeight = (canMarkPaid ? 4 : 3) * 39 + 6;
      const right = window.innerWidth - rect.right;
      const spaceBelow = window.innerHeight - rect.bottom;
      // Sem espaço abaixo: abre para cima, acima do botão
      setPos(
        spaceBelow < menuHeight + 12
          ? { bottom: window.innerHeight - rect.top + 4, right }
          : { top: rect.bottom + 4, right },
      );
    }
    setOpen((o) => !o);
  };

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [open]);

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: t.text.muted,
        }}
      >
        <MoreVertical size={16} />
      </button>

      {open &&
        createPortal(
          <>
            {/* backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
              onClick={() => setOpen(false)}
            />
            <div
              style={{
                position: 'fixed',
                top: pos.top,
                bottom: pos.bottom,
                right: pos.right,
                zIndex: 9999,
                background: t.bg.card,
                border: `1px solid ${t.border.default}`,
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                minWidth: 170,
                overflow: 'hidden',
              }}
            >
              <MenuItem
                icon={<Eye size={14} />}
                label="Ver detalhes"
                onClick={() => {
                  navigate(`/record/detail/${record.id}`);
                  setOpen(false);
                }}
                t={t}
              />
              <MenuItem
                icon={<Edit2 size={14} />}
                label="Editar"
                onClick={() => {
                  navigate(`/record/edit/${record.id}`);
                  setOpen(false);
                }}
                t={t}
              />
              {canMarkPaid && (
                <MenuItem
                  icon={<Check size={14} />}
                  label="Marcar como pago"
                  onClick={() => {
                    onStatusChange(record.id, 'PAID');
                    setOpen(false);
                  }}
                  t={t}
                  color={isDark ? '#6ee7b7' : '#059669'}
                  loading={updateLoading}
                />
              )}
              <div style={{ height: 1, background: t.border.divider, margin: '2px 0' }} />
              <MenuItem
                icon={
                  deleteLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )
                }
                label="Excluir"
                onClick={() => {
                  onDelete(record);
                  setOpen(false);
                }}
                t={t}
                color={isDark ? '#fca5a5' : '#dc2626'}
                loading={deleteLoading}
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  t,
  color,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  t: ReturnType<typeof useTokens>;
  color?: string;
  loading?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        border: 'none',
        cursor: 'pointer',
        background: hovered ? t.bg.muted : 'transparent',
        color: color ?? t.text.secondary,
        fontSize: 13,
        fontWeight: 500,
        transition: 'background 0.12s',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Single record card ───────────────────────────────────────────────────────

function RecordCard({
  record,
  getPersonName,
  getCardName,
  onDelete,
  deleteLoading,
  onStatusChange,
  updateLoading,
  onPartialPayment,
}: {
  record: UnifiedRecord;
  getPersonName: (id: string) => string;
  getCardName: (id?: string | null) => string;
  onDelete: (r: UnifiedRecord) => void;
  deleteLoading: boolean;
  onStatusChange: (id: string, status: RecordStatus) => void;
  updateLoading: boolean;
  onPartialPayment?: (record: UnifiedRecord) => void;
}) {
  const t = useTokens();
  const isDark = t.bg.page === '#12161a';
  const isIncome = record.type === 'income';
  const valueColor = isIncome ? (isDark ? '#6ee7b7' : '#059669') : isDark ? '#fca5a5' : '#dc2626';

  return (
    <div
      style={{
        background: t.bg.card,
        border: `1px solid ${t.border.default}`,
        borderRadius: 14,
        padding: '12px 12px 12px 14px',
        display: 'flex',
        alignItems: 'stretch',
        gap: 10,
        overflow: 'hidden',
        maxWidth: '100%',
        minWidth: 0,
      }}
    >
      {/* Left: icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isIncome ? t.income.bgIcon : t.expense.bgIcon,
          marginTop: 2,
        }}
      >
        {isIncome ? (
          <ArrowUpCircle size={16} style={{ color: t.income.text }} />
        ) : (
          <ArrowDownCircle size={16} style={{ color: t.expense.text }} />
        )}
      </div>

      {/* Middle: description + meta */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: t.text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {record.description}
          {record.originExpenseId && (
            <span
              title={`Saldo transferido de ${String(record.originMonth).padStart(2, '0')}/${record.originYear}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 5,
                background: 'rgba(245,158,11,0.12)',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.25)',
                marginLeft: 6,
                verticalAlign: 'middle',
              }}
            >
              <Undo2 size={9} style={{ display: 'inline', verticalAlign: -1 }} />{' '}
              {String(record.originMonth).padStart(2, '0')}/{record.originYear}
            </span>
          )}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 999,
              background: 'rgba(99,102,241,0.12)',
              color: isDark ? '#a5b4fc' : '#4338ca',
              border: '1px solid rgba(99,102,241,0.15)',
              whiteSpace: 'nowrap',
            }}
          >
            {record.category?.name || record.categoryName || 'Geral'}
          </span>
          <span style={{ fontSize: 11, color: t.text.muted, whiteSpace: 'nowrap' }}>
            {formatShortDate(record.date)}
          </span>
          {record.creditCardId && (
            <span
              title={`Pago no cartão ${getCardName(record.creditCardId)}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 999,
                background: 'rgba(99,102,241,0.12)',
                color: isDark ? '#a5b4fc' : '#4338ca',
                border: '1px solid rgba(99,102,241,0.15)',
                whiteSpace: 'nowrap',
              }}
            >
              <CreditCard size={10} />
              {getCardName(record.creditCardId)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <StatusBadge
            status={record.status || 'PENDING'}
            onChange={(s) => onStatusChange(record.id, s)}
            onPartialPayment={
              record.originalType === 'expense' && !record.creditCardId
                ? () => onPartialPayment?.(record)
                : undefined
            }
            disabled={
              updateLoading ||
              record.originalType !== 'expense' ||
              // Parcela: já nasce paga, não muda por aqui. Fatura
              // (creditCardInvoiceId): pode ser marcada como paga.
              !!record.purchaseId
            }
          />
          <span
            style={{
              fontSize: 11,
              color: t.text.muted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getPersonName(record.personId)}
          </span>
        </div>
      </div>

      {/* Right: value + menu */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: 4,
          minWidth: 90,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: valueColor,
            whiteSpace: 'nowrap',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(record.value)}
        </span>
        <ActionMenu
          record={record}
          onDelete={onDelete}
          deleteLoading={deleteLoading}
          onStatusChange={onStatusChange}
          updateLoading={updateLoading}
        />
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface Props {
  records: UnifiedRecord[];
  getPersonName: (id: string) => string;
  getCardName?: (id?: string | null) => string;
  onDelete: (r: UnifiedRecord) => void;
  deleteLoading: boolean;
  onStatusChange: (id: string, status: RecordStatus) => void;
  updateLoading: boolean;
  onPartialPayment?: (record: UnifiedRecord) => void;
}

export function MobileRecordsList({
  records,
  getPersonName,
  getCardName = () => 'Cartão',
  onDelete,
  deleteLoading,
  onStatusChange,
  updateLoading,
  onPartialPayment,
}: Props) {
  const t = useTokens();
  const groups = groupByDate(records);

  if (records.length === 0) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: t.text.muted, fontStyle: 'italic' }}>
          Nenhum lançamento encontrado para este período.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: '12px 0 80px',
        overflow: 'hidden',
      }}
    >
      {groups.map((group) => (
        <div key={group.label}>
          {/* Group header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
              padding: '0 2px',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: t.text.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {group.label}
            </span>
            <div style={{ flex: 1, height: 1, background: t.border.divider }} />
            <span style={{ fontSize: 11, color: t.text.subtle }}>
              {group.items.length} {group.items.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.items.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                getPersonName={getPersonName}
                getCardName={getCardName}
                onDelete={onDelete}
                deleteLoading={deleteLoading}
                onStatusChange={onStatusChange}
                updateLoading={updateLoading}
                onPartialPayment={onPartialPayment}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
