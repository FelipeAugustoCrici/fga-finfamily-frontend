import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  Settings2,
  Heart,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/services/api.service';
import { useTokens } from '@/hooks/useTokens';
import {
  useCoupleModeConfig,
  useCoupleModeResult,
  useDeleteAdjustment,
} from './hooks/useCoupleMode';
import { CoupleModeConfigModal } from './components/CoupleModeConfigModal';
import { AdjustmentModal } from './components/AdjustmentModal';
import { AdjustmentSuggestion } from './types/couple-mode.types';
import { FamilyMember } from '@/pages/families/types/family.types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const PERSON_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'];

export function CoupleModeList() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [configOpen, setConfigOpen] = useState(false);
  const [adjustmentSuggestion, setAdjustmentSuggestion] = useState<AdjustmentSuggestion | null>(
    null,
  );

  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data } = await api.get('/finance/families');
      return data;
    },
  });
  const family = families[0];
  const familyId = family?.id ?? '';
  const members: FamilyMember[] = family?.members ?? [];

  const { data: config } = useCoupleModeConfig(familyId);
  const { data: rawResult, isLoading } = useCoupleModeResult(familyId, month, year);
  const deleteAdjustment = useDeleteAdjustment();

  const result =
    rawResult?.period?.month === month && rawResult?.period?.year === year ? rawResult : undefined;

  const getMemberName = (id: string) => members.find((m) => m.id === id)?.name ?? id;
  const getInitials = (id: string) => getMemberName(id).charAt(0).toUpperCase();

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const monthLabel = new Date(year, month - 1).toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const hasData = result && result.totalShared > 0;

  const maxImbalance = hasData
    ? Math.max(...(result?.participants ?? []).map((p) => Math.abs(p.balance)))
    : 0;
  const isBalanced = maxImbalance < 0.01;

  const pendingSuggestions =
    result?.suggestions.filter(
      (s) =>
        !result.adjustments.some(
          (a) => a.fromPersonId === s.fromPersonId && a.toPersonId === s.toPersonId,
        ),
    ) ?? [];

  const splitLabel = (type: string) => {
    if (type === 'equal') return 'Divisão igualitária (50% / 50%)';
    if (type === 'proportional') return 'Divisão proporcional baseada na renda';
    return 'Divisão personalizada';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        actions={
          <Button variant="secondary" onClick={() => setConfigOpen(true)}>
            <Settings2 size={16} style={{ marginRight: 6 }} /> Configurar
          </Button>
        }
      />

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={prevMonth}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `1px solid ${t.border.default}`,
            background: t.bg.card,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.text.secondary,
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: t.text.primary,
            textTransform: 'capitalize',
            minWidth: 160,
            textAlign: 'center',
          }}
        >
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `1px solid ${t.border.default}`,
            background: t.bg.card,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.text.secondary,
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {}
      {!config?.isActive && (
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 18,
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: t.shadow.card,
          }}
        >
          <Heart
            size={44}
            color={isDark ? '#f43f5e' : '#fb7185'}
            style={{ margin: '0 auto 16px' }}
          />
          <p style={{ fontSize: 16, fontWeight: 700, color: t.text.primary, marginBottom: 6 }}>
            Modo Casal não configurado
          </p>
          <p style={{ fontSize: 13, color: t.text.muted, marginBottom: 20 }}>
            Configure os participantes e a regra de divisão para começar
          </p>
          <Button onClick={() => setConfigOpen(true)}>
            <Settings2 size={15} style={{ marginRight: 6 }} /> Configurar agora
          </Button>
        </div>
      )}

      {config?.isActive && (
        <>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <SkeletonCard lines={4} t={t} />
              <SkeletonCard lines={4} t={t} />
            </div>
          ) : !result ? (
            <div
              style={{
                background: t.bg.card,
                border: `1px solid ${t.border.default}`,
                borderRadius: 18,
                padding: '40px 24px',
                textAlign: 'center',
                boxShadow: t.shadow.card,
              }}
            >
              <p style={{ fontSize: 13, color: t.text.muted }}>
                Nenhum dado encontrado para este período.
              </p>
            </div>
          ) : (
            <>
              {}
              <div
                style={{
                  background: t.bg.card,
                  border: `1px solid ${t.border.default}`,
                  borderRadius: 18,
                  padding: '20px 22px',
                  boxShadow: t.shadow.card,
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 20,
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.text.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Total compartilhado no período
                  </p>
                  <p
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: t.text.primary,
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    {fmt(result.totalShared)}
                  </p>
                  <p style={{ fontSize: 12, color: t.text.muted, marginTop: 2 }}>
                    {splitLabel(result.splitType)}
                    {result.splitType === 'proportional' && result.totalFamilyIncome > 0 && (
                      <span style={{ color: t.text.subtle }}>
                        {' '}
                        · Renda total: {fmt(result.totalFamilyIncome)}
                      </span>
                    )}
                  </p>
                </div>

                {}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 999,
                      background: isBalanced
                        ? isDark
                          ? 'rgba(16,185,129,0.12)'
                          : '#dcfce7'
                        : isDark
                          ? 'rgba(245,158,11,0.12)'
                          : '#fef9c3',
                      border: `1px solid ${
                        isBalanced
                          ? isDark
                            ? 'rgba(16,185,129,0.25)'
                            : '#a7f3d0'
                          : isDark
                            ? 'rgba(245,158,11,0.25)'
                            : '#fde68a'
                      }`,
                    }}
                  >
                    {isBalanced ? (
                      <CheckCircle2 size={13} color={isDark ? '#6ee7b7' : '#166534'} />
                    ) : (
                      <AlertTriangle size={13} color={isDark ? '#fcd34d' : '#92400e'} />
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: isBalanced
                          ? isDark
                            ? '#6ee7b7'
                            : '#166534'
                          : isDark
                            ? '#fcd34d'
                            : '#92400e',
                      }}
                    >
                      {isBalanced ? 'Equilibrado' : `Desequilíbrio de ${fmt(maxImbalance)}`}
                    </span>
                  </div>
                  {!isBalanced && (
                    <span style={{ fontSize: 11, color: t.text.muted }}>Ajuste pendente</span>
                  )}
                </div>
              </div>

              {!hasData && (
                <div
                  style={{
                    background: t.bg.card,
                    border: `1px solid ${t.border.default}`,
                    borderRadius: 18,
                    padding: '40px 24px',
                    textAlign: 'center',
                    boxShadow: t.shadow.card,
                  }}
                >
                  <p style={{ fontSize: 13, color: t.text.muted }}>
                    Nenhuma despesa compartilhada neste período.
                  </p>
                </div>
              )}

              {hasData && result.incomeRequired && (
                <div
                  style={{
                    background: isDark ? 'rgba(245,158,11,0.08)' : '#fffbeb',
                    border: `1px solid ${isDark ? 'rgba(245,158,11,0.20)' : '#fde68a'}`,
                    borderRadius: 18,
                    padding: '24px',
                    textAlign: 'center',
                  }}
                >
                  <AlertTriangle
                    size={32}
                    color={isDark ? '#fcd34d' : '#d97706'}
                    style={{ margin: '0 auto 12px' }}
                  />
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isDark ? '#fcd34d' : '#92400e',
                      marginBottom: 6,
                    }}
                  >
                    Renda não informada
                  </p>
                  <p style={{ fontSize: 12, color: t.text.muted, marginBottom: 16 }}>
                    Para usar a divisão proporcional, informe a renda mensal de cada participante.
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => setConfigOpen(true)}>
                    <Settings2 size={14} style={{ marginRight: 6 }} /> Preencher renda
                  </Button>
                </div>
              )}

              {hasData && !result.incomeRequired && (
                <>
                  {}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {result.participants.map((p, idx) => {
                      const color = PERSON_COLORS[idx % PERSON_COLORS.length];
                      const effectivePaid = p.amountPaid + p.adjustmentAmount;
                      const pct =
                        result.totalShared > 0 ? (effectivePaid / result.totalShared) * 100 : 0;
                      const idealPct = p.proportion;
                      const isOver = p.balance > 0.01;
                      const isUnder = p.balance < -0.01;
                      const isEven = !isOver && !isUnder;

                      const statusBg = isOver
                        ? isDark
                          ? 'rgba(16,185,129,0.10)'
                          : '#ecfdf5'
                        : isUnder
                          ? isDark
                            ? 'rgba(245,158,11,0.10)'
                            : '#fffbeb'
                          : t.bg.muted;
                      const statusBorder = isOver
                        ? isDark
                          ? 'rgba(16,185,129,0.25)'
                          : '#a7f3d0'
                        : isUnder
                          ? isDark
                            ? 'rgba(245,158,11,0.25)'
                            : '#fde68a'
                          : t.border.default;
                      const statusColor = isOver
                        ? isDark
                          ? '#6ee7b7'
                          : '#166534'
                        : isUnder
                          ? isDark
                            ? '#fcd34d'
                            : '#92400e'
                          : t.text.muted;

                      return (
                        <div
                          key={p.personId}
                          style={{
                            background: t.bg.card,
                            border: `1px solid ${t.border.default}`,
                            borderRadius: 18,
                            padding: '18px 18px',
                            boxShadow: t.shadow.card,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 14,
                          }}
                        >
                          {}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                flexShrink: 0,
                                background: color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: 16,
                              }}
                            >
                              {getInitials(p.personId)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 14, fontWeight: 800, color: t.text.primary }}>
                                {getMemberName(p.personId)}
                              </p>
                              <p style={{ fontSize: 11, color: t.text.muted }}>
                                {p.proportion.toFixed(0)}% do total ideal
                              </p>
                            </div>
                            {isOver && (
                              <TrendingUp size={16} color={isDark ? '#6ee7b7' : '#10b981'} />
                            )}
                            {isUnder && (
                              <TrendingDown size={16} color={isDark ? '#fcd34d' : '#d97706'} />
                            )}
                            {isEven && <Minus size={16} color={t.text.muted} />}
                          </div>

                          {}
                          <div
                            style={{
                              background: statusBg,
                              border: `1.5px solid ${statusBorder}`,
                              borderRadius: 12,
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            {isOver && <TrendingUp size={14} color={statusColor} />}
                            {isUnder && <TrendingDown size={14} color={statusColor} />}
                            {isEven && <CheckCircle2 size={14} color={statusColor} />}
                            <p style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>
                              {isOver && `Recebe ${fmt(p.balance)}`}
                              {isUnder && `Deve ${fmt(Math.abs(p.balance))}`}
                              {isEven && 'Contribuição equilibrada'}
                            </p>
                          </div>

                          {}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div
                              style={{
                                background: t.bg.muted,
                                border: `1px solid ${t.border.default}`,
                                borderRadius: 10,
                                padding: '10px 12px',
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: t.text.muted,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  marginBottom: 4,
                                }}
                              >
                                Pagou
                              </p>
                              <p style={{ fontSize: 15, fontWeight: 800, color: t.text.primary }}>
                                {fmt(effectivePaid)}
                              </p>
                              {p.adjustmentAmount !== 0 && (
                                <p style={{ fontSize: 10, color: t.text.muted, marginTop: 2 }}>
                                  {fmt(p.amountPaid)} + {fmt(Math.abs(p.adjustmentAmount))} ajuste
                                </p>
                              )}
                            </div>
                            <div
                              style={{
                                background: t.bg.muted,
                                border: `1px solid ${t.border.default}`,
                                borderRadius: 10,
                                padding: '10px 12px',
                              }}
                            >
                              <p
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: t.text.muted,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  marginBottom: 4,
                                }}
                              >
                                Ideal
                              </p>
                              <p style={{ fontSize: 15, fontWeight: 800, color: t.text.primary }}>
                                {fmt(p.amountShouldPay)}
                              </p>
                            </div>
                          </div>

                          {}
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 6,
                              }}
                            >
                              <span style={{ fontSize: 11, color: t.text.muted }}>
                                Real:{' '}
                                <strong style={{ color: t.text.secondary }}>
                                  {pct.toFixed(0)}%
                                </strong>
                              </span>
                              <span style={{ fontSize: 11, color: t.text.muted }}>
                                Ideal:{' '}
                                <strong style={{ color: t.text.secondary }}>
                                  {idealPct.toFixed(0)}%
                                </strong>
                              </span>
                              <span style={{ fontSize: 11, color: statusColor, fontWeight: 700 }}>
                                {pct > idealPct ? '+' : ''}
                                {(pct - idealPct).toFixed(0)}%
                              </span>
                            </div>
                            <div
                              style={{
                                position: 'relative',
                                width: '100%',
                                height: 8,
                                background: t.bg.mutedStrong,
                                borderRadius: 999,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  borderRadius: 999,
                                  width: `${Math.min(pct, 100)}%`,
                                  background: color,
                                  transition: 'width 0.6s ease',
                                }}
                              />
                              {}
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  bottom: 0,
                                  width: 2,
                                  background: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)',
                                  left: `${Math.min(idealPct, 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {}
                          {result.splitType === 'proportional' && p.configuredIncome > 0 && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: t.bg.muted,
                                border: `1px solid ${t.border.default}`,
                                borderRadius: 10,
                                padding: '8px 12px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Wallet size={12} color={t.text.muted} />
                                <span style={{ fontSize: 11, color: t.text.muted }}>
                                  Renda informada
                                </span>
                              </div>
                              <span
                                style={{ fontSize: 12, fontWeight: 700, color: t.text.secondary }}
                              >
                                {fmt(p.configuredIncome)} ({p.proportion.toFixed(0)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {}
                  {pendingSuggestions.length > 0 && (
                    <div
                      style={{
                        background: isDark ? 'rgba(99,102,241,0.08)' : '#f5f3ff',
                        border: `1.5px solid ${isDark ? 'rgba(99,102,241,0.25)' : '#ddd6fe'}`,
                        borderRadius: 18,
                        padding: '20px 22px',
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isDark ? '#a5b4fc' : '#4338ca',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginBottom: 14,
                        }}
                      >
                        Para equilibrar as contas
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {pendingSuggestions.map((s, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 16,
                              flexWrap: 'wrap',
                            }}
                          >
                            <div
                              style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  background: t.bg.card,
                                  border: `1px solid ${t.border.default}`,
                                  borderRadius: 12,
                                  padding: '10px 14px',
                                  flex: 1,
                                }}
                              >
                                <span
                                  style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}
                                >
                                  {getMemberName(s.fromPersonId)}
                                </span>
                                <ArrowRight size={14} color={t.text.muted} />
                                <span
                                  style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}
                                >
                                  {getMemberName(s.toPersonId)}
                                </span>
                                <span
                                  style={{
                                    marginLeft: 'auto',
                                    fontSize: 15,
                                    fontWeight: 900,
                                    color: isDark ? '#a5b4fc' : '#4338ca',
                                  }}
                                >
                                  {fmt(s.amount)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setAdjustmentSuggestion(s)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 18px',
                                borderRadius: 12,
                                border: 'none',
                                background: '#6366f1',
                                color: '#ffffff',
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: 'opacity 0.15s ease',
                              }}
                            >
                              Registrar pagamento <ArrowRight size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {}
                  {result.adjustments.length > 0 && (
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
                          marginBottom: 12,
                        }}
                      >
                        Ajustes registrados
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {result.adjustments.map((a) => (
                          <div
                            key={a.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: 12,
                              background: isDark ? 'rgba(16,185,129,0.08)' : '#f0fdf4',
                              border: `1px solid ${isDark ? 'rgba(16,185,129,0.20)' : '#bbf7d0'}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <CheckCircle2 size={15} color={isDark ? '#6ee7b7' : '#16a34a'} />
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>
                                  {a.description}
                                </p>
                                <p style={{ fontSize: 11, color: t.text.muted }}>
                                  {getMemberName(a.fromPersonId)} → {getMemberName(a.toPersonId)}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: isDark ? '#6ee7b7' : '#16a34a',
                                }}
                              >
                                {fmt(a.amount)}
                              </span>
                              <button
                                onClick={() => deleteAdjustment.mutate(a.id)}
                                disabled={deleteAdjustment.isPending}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 8,
                                  border: 'none',
                                  background: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2',
                                  color: isDark ? '#fca5a5' : '#dc2626',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: deleteAdjustment.isPending ? 0.5 : 1,
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {configOpen && (
        <CoupleModeConfigModal
          isOpen={configOpen}
          onClose={() => setConfigOpen(false)}
          familyId={familyId}
          members={members}
          config={config}
          month={month}
          year={year}
        />
      )}

      {adjustmentSuggestion && (
        <AdjustmentModal
          isOpen={!!adjustmentSuggestion}
          onClose={() => setAdjustmentSuggestion(null)}
          familyId={familyId}
          month={month}
          year={year}
          suggestion={adjustmentSuggestion}
          members={members}
        />
      )}
    </div>
  );
}
