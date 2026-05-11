import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmModal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/services/api.service';
import { SkeletonTable } from '@/components/ui/Skeleton';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Edit2,
  Trash2,
  Loader2,
  Eye,
  Download,
} from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { ActionButton } from '@/components/ui/ActionButton';

import { RecordsFilters } from './components/RecordsFilters';
import { StatusBadge } from './components/StatusBadge';
import { IncomeSummaryCards } from './components/IncomeSummaryCards';
import { MobileRecordsList } from './components/MobileRecordsList';
import { QuickLaunchInput } from './components/QuickLaunch/QuickLaunchInput';
import { useRecordFilters } from './hooks/useRecordFilters';
import { useRecords } from './hooks/useRecords';
import { useDeleteRecord } from './hooks/useDeleteRecord';
import { useUpdateRecordStatus } from './hooks/useUpdateRecordStatus';
import { formatCurrency } from './utils/formatters';
import { UnifiedRecord, RecordStatus } from './types/record.types';
import { familyService } from '@/pages/families/services/families.service';
import { formatShortDate } from '@/common/utils/date';

export function RecordsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const filters = useRecordFilters();
  const deleteRecord = useDeleteRecord();
  const updateStatus = useUpdateRecordStatus();

  const [recordToDelete, setRecordToDelete] = useState<UnifiedRecord | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const itemsPerPage = 10;
  const t = useTokens();

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: () => familyService.list(),
  });

  const familyId = families[0]?.id;

  const { records, isLoading, pagination } = useRecords(
    filters.month,
    filters.year,
    familyId,
    filters.status,
    filters.page,
    itemsPerPage,
  );

  const people = families.flatMap((f) => f.members || []);

  const filteredRecords = records.filter((item) =>
    item.description?.toLowerCase().includes(filters.search.toLowerCase()),
  );

  const shouldUseFrontendPagination = filters.search.length > 0;

  let paginatedRecords = filteredRecords;
  let totalItems = pagination?.total || 0;
  let totalPages = pagination?.totalPages || 1;

  if (shouldUseFrontendPagination) {
    totalItems = filteredRecords.length;
    totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (filters.page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedRecords = filteredRecords.slice(startIndex, endIndex);
  } else {
    paginatedRecords = filteredRecords;
  }

  useEffect(() => {
    filters.setPage(1);
  }, [filters.month, filters.year, filters.status, filters.search]);

  const getPersonName = (personId: string) => {
    for (const family of families) {
      const person = _.find(family.members, { id: personId });
      if (person) return person.name;
    }
    return 'Não identificado';
  };

  const handleDeleteClick = (item: UnifiedRecord) => {
    setRecordToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      deleteRecord.mutate(recordToDelete.id, {
        onSuccess: () => {
          setRecordToDelete(null);
        },
      });
    }
  };

  const handleStatusChange = (recordId: string, newStatus: RecordStatus) => {
    updateStatus.mutate({ id: recordId, status: newStatus });
  };

  const handleDeleteIncome = async (id: string, type: 'income' | 'extra') => {
    try {
      const route = type === 'income' ? 'incomes' : 'extras';
      await api.delete(`/finance/${route}/${id}`);

      queryClient.invalidateQueries({ queryKey: ['incomes-summary'] });
      queryClient.invalidateQueries({ queryKey: ['extras-summary'] });
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <ActionButton
              variant="secondary"
              onClick={() => window.print()}
              icon={<Download size={15} />}
            >
              Exportar
            </ActionButton>
            <ActionButton onClick={() => navigate('/record/create')}>Novo Lançamento</ActionButton>
            <ActionButton
              variant="secondary"
              onClick={() => navigate('/record/chat')}
              icon={<MessageSquarePlus size={15} />}
            >
              Chat IA
            </ActionButton>
          </>
        }
      />

      <QuickLaunchInput />

      {}

      {}
      <IncomeSummaryCards
        month={filters.month}
        year={filters.year}
        familyId={familyId}
        people={people}
        onDelete={handleDeleteIncome}
      />

      <Card className="overflow-hidden">
        <RecordsFilters
          search={filters.search}
          onSearchChange={filters.setSearch}
          month={filters.month}
          year={filters.year}
          status={filters.status}
          onMonthChange={filters.setMonth}
          onYearChange={filters.setYear}
          onStatusChange={filters.setStatus}
        />

        {}
        <div className="overflow-x-auto hidden md:block">
          {isLoading ? (
            <SkeletonTable rows={8} t={t} />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border.divider}` }}>
                  <th
                    className="px-6 py-3.5"
                    style={{
                      color: t.text.muted,
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Descrição
                  </th>
                  <th
                    className="px-6 py-3.5"
                    style={{
                      color: t.text.muted,
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Categoria
                  </th>
                  <th
                    className="px-6 py-3.5"
                    style={{
                      color: t.text.muted,
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Data
                  </th>
                  <th
                    className="px-6 py-3.5"
                    style={{
                      color: t.text.muted,
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Tipo
                  </th>
                  <th
                    className="px-6 py-3.5"
                    style={{
                      color: t.text.muted,
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3.5"
                    style={{
                      color: t.text.muted,
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Valor
                  </th>
                  <th
                    className="px-6 py-3.5"
                    style={{
                      color: t.text.muted,
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Responsável
                  </th>
                  <th
                    className="px-6 py-3.5 text-right"
                    style={{
                      color: t.text.muted,
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center italic"
                      style={{ color: t.text.muted }}
                    >
                      Nenhum lançamento encontrado para este período.
                    </td>
                  </tr>
                ) : (
                  _.map(paginatedRecords, (tx, idx) => {
                    const isIncome = tx.type === 'income';
                    const rowBg = idx % 2 !== 0 ? t.bg.cardSubtle : 'transparent';
                    return (
                      <tr
                        key={idx}
                        className="group"
                        style={{
                          background: hoveredRow === idx ? t.bg.cardHover : rowBg,
                          borderBottom: `1px solid ${t.border.subtle}`,
                          transition: 'background 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={() => setHoveredRow(idx)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg shrink-0"
                              style={{
                                background: isIncome ? t.income.bgIcon : t.expense.bgIcon,
                              }}
                            >
                              {isIncome ? (
                                <ArrowUpCircle size={16} style={{ color: t.income.text }} />
                              ) : (
                                <ArrowDownCircle size={16} style={{ color: t.expense.text }} />
                              )}
                            </div>
                            <button
                              onClick={() => navigate(`/record/detail/${tx.id}`)}
                              className="text-sm text-left transition-all duration-200"
                              style={{ fontWeight: 500, color: t.text.primary }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.textDecoration = 'underline';
                                (e.currentTarget as HTMLElement).style.color = t.text.link;
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.textDecoration = 'none';
                                (e.currentTarget as HTMLElement).style.color = t.text.primary;
                              }}
                            >
                              {tx.description}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{
                              background: 'rgba(99,102,241,0.12)',
                              color: '#818cf8',
                              border: '1px solid rgba(99,102,241,0.15)',
                            }}
                          >
                            {tx.category?.name || tx.categoryName || 'Geral'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: t.text.muted }}>
                          {formatShortDate(tx.date)}
                        </td>
                        <td className="px-6 py-4">
                          {tx.type === 'expense' ? (
                            <span
                              className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{
                                background: tx.recurringId ? t.balance.bgIcon : t.investment.bgIcon,
                                color: tx.recurringId ? t.balance.textAlt : t.investment.text,
                                border: `1px solid ${tx.recurringId ? t.balance.border : t.investment.border}`,
                              }}
                            >
                              {tx.recurringId ? 'Fixo' : 'Variável'}
                            </span>
                          ) : tx.sourceId ? (
                            <span
                              className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{
                                background: t.income.bgIcon,
                                color: t.income.text,
                                border: `1px solid ${t.income.border}`,
                              }}
                            >
                              Fixo
                            </span>
                          ) : (
                            <span style={{ color: t.text.subtle, fontSize: '12px' }}>—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={tx.status || 'PENDING'}
                            onChange={(newStatus) => handleStatusChange(tx.id, newStatus)}
                            disabled={updateStatus.isPending || tx.originalType !== 'expense'}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-sm"
                            style={{
                              fontWeight: 600,
                              fontSize: '14px',
                              color: isIncome ? t.income.text : t.expense.text,
                            }}
                          >
                            {isIncome ? '+ ' : '- '}
                            {formatCurrency(tx.value)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium" style={{ color: t.text.secondary }}>
                            {getPersonName(tx.personId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className="flex items-center justify-end gap-1.5 transition-all duration-200"
                            style={{ opacity: hoveredRow === idx ? 1 : 0 }}
                          >
                            <button
                              onClick={() => navigate(`/record/detail/${tx.id}`)}
                              className="p-1.5 rounded-lg transition-all duration-200"
                              style={{ color: t.text.muted }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background =
                                  t.bg.mutedStrong;
                                (e.currentTarget as HTMLElement).style.color = t.text.primary;
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = t.text.muted;
                              }}
                              title="Ver detalhes"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => navigate(`/record/edit/${tx.id}`)}
                              className="p-1.5 rounded-lg transition-all duration-200"
                              style={{ color: t.text.muted }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background =
                                  t.bg.mutedStrong;
                                (e.currentTarget as HTMLElement).style.color = t.text.primary;
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = t.text.muted;
                              }}
                              title="Editar"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(tx)}
                              disabled={deleteRecord.isPending}
                              className="p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50"
                              style={{ color: t.text.muted }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background =
                                  t.expense.bgIcon;
                                (e.currentTarget as HTMLElement).style.color = t.expense.text;
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = t.text.muted;
                              }}
                              title="Excluir"
                            >
                              {deleteRecord.isPending ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile list */}
        <div className="md:hidden -mx-6 px-3">
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 88,
                    borderRadius: 14,
                    background: t.bg.muted,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              ))}
            </div>
          ) : (
            <MobileRecordsList
              records={paginatedRecords}
              getPersonName={getPersonName}
              onDelete={handleDeleteClick}
              deleteLoading={deleteRecord.isPending}
              onStatusChange={(id, status) => handleStatusChange(id, status)}
              updateLoading={updateStatus.isPending}
            />
          )}
        </div>

        {}
        {!isLoading && filteredRecords.length > 0 && (
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={filters.setPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        )}
      </Card>

      {}
      <ConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Lançamento"
        description={`Tem certeza que deseja excluir o lançamento "${recordToDelete?.description}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteRecord.isPending}
      />
    </div>
  );
}
