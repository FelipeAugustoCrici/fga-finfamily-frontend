import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { api } from '@/services/api.service';
import { useTokens } from '@/hooks/useTokens';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  User,
  Tag,
  RefreshCw,
  Users,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatMediumDate, formatShortDate } from '@/common/utils/date';

const TYPE_CONFIG = {
  expense: {
    label: 'Despesa',
    icon: TrendingDown,
    color: '#ef4444',
    bg: (isDark: boolean) => (isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2'),
    border: (isDark: boolean) => (isDark ? 'rgba(239,68,68,0.30)' : '#fecaca'),
    text: (isDark: boolean) => (isDark ? '#fca5a5' : '#991b1b'),
    accentBar: '#ef4444',
  },
  salary: {
    label: 'Salário',
    icon: TrendingUp,
    color: '#10b981',
    bg: (isDark: boolean) => (isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5'),
    border: (isDark: boolean) => (isDark ? 'rgba(16,185,129,0.30)' : '#a7f3d0'),
    text: (isDark: boolean) => (isDark ? '#6ee7b7' : '#166534'),
    accentBar: '#10b981',
  },
  income: {
    label: 'Extra / Bônus',
    icon: Sparkles,
    color: '#6366f1',
    bg: (isDark: boolean) => (isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff'),
    border: (isDark: boolean) => (isDark ? 'rgba(99,102,241,0.30)' : '#c7d2fe'),
    text: (isDark: boolean) => (isDark ? '#a5b4fc' : '#3730a3'),
    accentBar: '#6366f1',
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: (d: boolean) => string; icon: React.ElementType }
> = {
  PAID: {
    label: 'Pago',
    color: '#10b981',
    bg: (d) => (d ? 'rgba(16,185,129,0.15)' : '#dcfce7'),
    icon: CheckCircle2,
  },
  PENDING: {
    label: 'Pendente',
    color: '#f59e0b',
    bg: (d) => (d ? 'rgba(245,158,11,0.15)' : '#fef9c3'),
    icon: Clock,
  },
  OVERDUE: {
    label: 'Atrasado',
    color: '#ef4444',
    bg: (d) => (d ? 'rgba(239,68,68,0.15)' : '#fee2e2'),
    icon: AlertCircle,
  },
};

function InfoRow({
  label,
  value,
  icon: Icon,
  t,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  t: any;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon size={12} color={t.text.muted} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: t.text.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          {label}
        </span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: t.text.primary }}>{value}</span>
    </div>
  );
}

export function RecordsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const { data: record, isLoading } = useQuery({
    queryKey: ['record-detail', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const { data } = await api.get(`/finance/expenses/${id}`);
        return { ...data, recordType: 'expense' };
      } catch {
        try {
          const { data } = await api.get(`/finance/incomes/${id}`);
          return { ...data, recordType: 'salary' };
        } catch {
          const { data } = await api.get(`/finance/extras/${id}`);
          return { ...data, recordType: 'income' };
        }
      }
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!record) return;
      const route =
        record.recordType === 'expense'
          ? 'expenses'
          : record.recordType === 'salary'
            ? 'incomes'
            : 'extras';
      await api.delete(`/finance/${route}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      navigate('/record');
    },
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (isLoading) {
    return <SkeletonDetail t={t} />;
  }

  if (!record) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 240,
          gap: 16,
        }}
      >
        <p style={{ color: t.text.muted }}>Nenhum detalhe disponível para este lançamento.</p>
        <Button onClick={() => navigate('/record')}>Voltar para Listagem</Button>
      </div>
    );
  }

  const typeKey = (record.recordType as keyof typeof TYPE_CONFIG) || 'expense';
  const type = TYPE_CONFIG[typeKey];
  const TypeIcon = type.icon;
  const statusCfg = record.status ? STATUS_CONFIG[record.status] : null;
  const StatusIcon = statusCfg?.icon;

  const hasHistory = record.updatedAt && record.updatedAt !== record.createdAt;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/record')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: t.bg.muted,
              border: `1px solid ${t.border.default}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: t.text.secondary,
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: t.text.primary, lineHeight: 1.2 }}>
              Detalhes do Lançamento
            </h2>
            <p style={{ fontSize: 12, color: t.text.muted }}>Registro gerado pelo sistema</p>
          </div>
        </div>
      </div>

      {}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}
      >
        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {}
          <div
            style={{
              background: t.bg.card,
              border: `1px solid ${t.border.default}`,
              borderRadius: 18,
              boxShadow: t.shadow.card,
              overflow: 'hidden',
            }}
          >
            {}
            <div style={{ height: 4, background: type.accentBar }} />

            <div style={{ padding: '20px 22px' }}>
              {}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      flexShrink: 0,
                      background: type.bg(isDark),
                      border: `1.5px solid ${type.border(isDark)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TypeIcon size={22} color={type.color} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: t.text.primary,
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}
                    >
                      {record.description}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: type.bg(isDark),
                          color: type.text(isDark),
                          border: `1px solid ${type.border(isDark)}`,
                        }}
                      >
                        {type.label}
                      </span>
                      {}
                      {statusCfg && StatusIcon && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: statusCfg.bg(isDark),
                            color: statusCfg.color,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <StatusIcon size={11} />
                          {statusCfg.label}
                        </span>
                      )}
                      {}
                      {record.category && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: t.bg.muted,
                            color: t.text.secondary,
                            border: `1px solid ${t.border.default}`,
                          }}
                        >
                          {record.category.name}
                        </span>
                      )}
                      {}
                      {record.recurringId && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff',
                            color: isDark ? '#a5b4fc' : '#4338ca',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <RefreshCw size={10} />
                          Recorrente
                        </span>
                      )}
                      {}
                      {record.isShared && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: 999,
                            background: t.bg.muted,
                            color: t.text.muted,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Users size={10} />
                          Compartilhado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: t.text.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 4,
                    }}
                  >
                    Valor
                  </p>
                  <p
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      color: type.color,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {formatCurrency(record.value)}
                  </p>
                </div>
              </div>

              {}
              <div style={{ height: 1, background: t.border.divider, marginBottom: 16 }} />

              {}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <InfoRow label="Data" value={formatMediumDate(record.date)} icon={Calendar} t={t} />
                {record.person && (
                  <InfoRow label="Responsável" value={record.person.name} icon={User} t={t} />
                )}
                {record.category ? (
                  <InfoRow label="Categoria" value={record.category.name} icon={Tag} t={t} />
                ) : (
                  <InfoRow label="Tipo" value={type.label} icon={TypeIcon} t={t} />
                )}
              </div>
            </div>
          </div>

          {}
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
              Informações do Lançamento
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <InfoRow label="Data" value={formatMediumDate(record.date)} icon={Calendar} t={t} />
              {record.person && (
                <InfoRow label="Responsável" value={record.person.name} icon={User} t={t} />
              )}
              {record.category && (
                <InfoRow label="Categoria" value={record.category.name} icon={Tag} t={t} />
              )}
              <InfoRow label="Tipo" value={type.label} icon={TypeIcon} t={t} />
              {record.status && statusCfg && (
                <InfoRow label="Status" value={statusCfg.label} icon={statusCfg.icon} t={t} />
              )}
              {record.createdAt && (
                <InfoRow
                  label="Criado em"
                  value={formatShortDate(record.createdAt)}
                  icon={Clock}
                  t={t}
                />
              )}
            </div>
          </div>

          {}
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
                marginBottom: 14,
              }}
            >
              Histórico
            </p>
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              {}
              <div
                style={{
                  position: 'absolute',
                  left: 6,
                  top: 8,
                  width: 2,
                  background: t.border.default,
                  bottom: hasHistory ? 8 : 'auto',
                  height: hasHistory ? undefined : 0,
                }}
              />

              {}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: hasHistory ? 16 : 0,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: '#10b981',
                    border: `2px solid ${t.bg.card}`,
                    boxShadow: `0 0 0 2px #10b981`,
                    position: 'absolute',
                    left: 0,
                  }}
                />
                <div style={{ paddingLeft: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>
                    Lançamento Efetivado
                  </p>
                  <p style={{ fontSize: 11, color: t.text.muted }}>
                    Criado em {formatShortDate(record.createdAt || record.date)}
                  </p>
                </div>
              </div>

              {}
              {hasHistory && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 16 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: isDark ? '#6366f1' : '#818cf8',
                      border: `2px solid ${t.bg.card}`,
                      boxShadow: `0 0 0 2px ${isDark ? '#6366f1' : '#818cf8'}`,
                      position: 'absolute',
                      left: 0,
                    }}
                  />
                  <div style={{ paddingLeft: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>
                      Última Atualização
                    </p>
                    <p style={{ fontSize: 11, color: t.text.muted }}>
                      {formatShortDate(record.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {}
          <div
            style={{
              background: t.bg.card,
              border: `1px solid ${t.border.default}`,
              borderRadius: 18,
              padding: '18px 18px',
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
              Ações
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => navigate(`/record/edit/${id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: t.bg.muted,
                  border: `1px solid ${t.border.default}`,
                  color: t.text.secondary,
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                <Edit2 size={15} /> Editar lançamento
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2',
                  border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : '#fecaca'}`,
                  color: isDark ? '#fca5a5' : '#dc2626',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                <Trash2 size={15} /> Excluir lançamento
              </button>
            </div>
          </div>

          {}
          <div
            style={{
              background: isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.20)' : '#c7d2fe'}`,
              borderRadius: 18,
              padding: '16px 18px',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: isDark ? '#a5b4fc' : '#4338ca',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 10,
              }}
            >
              Contexto
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {record.recurringId && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <RefreshCw
                    size={13}
                    color={isDark ? '#a5b4fc' : '#6366f1'}
                    style={{ marginTop: 1, flexShrink: 0 }}
                  />
                  <p
                    style={{ fontSize: 12, color: isDark ? '#c7d2fe' : '#4338ca', lineHeight: 1.5 }}
                  >
                    Faz parte de uma série recorrente
                  </p>
                </div>
              )}
              {record.isShared && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Users
                    size={13}
                    color={isDark ? '#a5b4fc' : '#6366f1'}
                    style={{ marginTop: 1, flexShrink: 0 }}
                  />
                  <p
                    style={{ fontSize: 12, color: isDark ? '#c7d2fe' : '#4338ca', lineHeight: 1.5 }}
                  >
                    Despesa compartilhada entre membros
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <TypeIcon
                  size={13}
                  color={isDark ? '#a5b4fc' : '#6366f1'}
                  style={{ marginTop: 1, flexShrink: 0 }}
                />
                <p style={{ fontSize: 12, color: isDark ? '#c7d2fe' : '#4338ca', lineHeight: 1.5 }}>
                  {typeKey === 'expense' && 'Registrado como despesa no período'}
                  {typeKey === 'salary' && 'Salário fixo mensal registrado'}
                  {typeKey === 'income' && 'Rendimento extra ou bônus registrado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deleteMutation.mutate();
          setShowDeleteModal(false);
        }}
        title="Excluir Lançamento"
        description={`Tem certeza que deseja excluir "${record.description}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
