import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2, Trash2, Tag, TrendingDown, TrendingUp, Layers, Pencil, Check, X } from 'lucide-react';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ActionButton } from '@/components/ui/ActionButton';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTokens } from '@/hooks/useTokens';

import { categorySchema, type CategoryFormData } from './schemas/category.schema';
import { useCategoriesPaginated } from './hooks/useCategories';
import { useCreateCategory } from './hooks/useCreateCategory';
import { useDeleteCategory } from './hooks/useDeleteCategory';
import { useUpdateCategory } from './hooks/useUpdateCategory';
import { Category } from './types/category.types';
import { useUserFamily } from '@/hooks/useUserInfo';

const EXPENSE_SUGGESTIONS = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Moradia'];
const INCOME_SUGGESTIONS = ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Bônus'];

export function CategoriesList() {
  const { data: family } = useUserFamily();
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', type: 'expense' },
  });

  const { register, handleSubmit, formState, reset, setValue, watch } = methods;
  const selectedType = watch('type');

  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expensePage, setExpensePage] = useState(1);
  const [incomePage, setIncomePage] = useState(1);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const confirmEdit = (cat: Category) => {
    const trimmed = editingName.trim();
    if (!trimmed || trimmed === cat.name) { cancelEdit(); return; }
    updateCategory.mutate(
      { id: cat.id, data: { name: trimmed, type: cat.type } },
      { onSuccess: cancelEdit, onError: cancelEdit },
    );
  };

  const { data: expenseData, isLoading: loadingExpenses } = useCategoriesPaginated(
    'expense',
    expensePage,
  );
  const { data: incomeData, isLoading: loadingIncomes } = useCategoriesPaginated(
    'income',
    incomePage,
  );

  const totalExpenses = expenseData?.total ?? 0;
  const totalIncomes = incomeData?.total ?? 0;

  function onSubmit(data: CategoryFormData) {
    createCategory.mutate(
      { ...data, familyId: family?.id },
      {
        onSuccess: () => {
          reset();
          setCreateSuccess(true);
          setActiveTab(data.type as 'expense' | 'income');
          setTimeout(() => setCreateSuccess(false), 2500);
        },
      },
    );
  }

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate(categoryToDelete.id, {
        onSuccess: () => setCategoryToDelete(null),
      });
    }
  };

  const isExpense = activeTab === 'expense';
  const activeData = isExpense ? expenseData : incomeData;
  const activeLoading = isExpense ? loadingExpenses : loadingIncomes;
  const activePage = isExpense ? expensePage : incomePage;
  const setActivePage = isExpense ? setExpensePage : setIncomePage;

  const tabActiveStyle = (tab: 'expense' | 'income') => {
    const active = activeTab === tab;
    if (tab === 'expense') {
      return {
        padding: '8px 18px',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.15s ease',
        background: active ? (isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2') : 'transparent',
        color: active ? (isDark ? '#fca5a5' : '#dc2626') : t.text.muted,
      };
    }
    return {
      padding: '8px 18px',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.15s ease',
      background: active ? (isDark ? 'rgba(16,185,129,0.15)' : '#dcfce7') : 'transparent',
      color: active ? (isDark ? '#6ee7b7' : '#166534') : t.text.muted,
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        actions={
          <ActionButton onClick={() => document.getElementById('category-form-name')?.focus()}>
            Nova Categoria
          </ActionButton>
        }
      />

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          {
            label: 'Total de Categorias',
            value: totalExpenses + totalIncomes,
            icon: Layers,
            color: '#6366f1',
            bg: isDark ? 'rgba(99,102,241,0.10)' : '#eef2ff',
            border: isDark ? 'rgba(99,102,241,0.20)' : '#c7d2fe',
          },
          {
            label: 'Despesas',
            value: totalExpenses,
            icon: TrendingDown,
            color: '#ef4444',
            bg: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2',
            border: isDark ? 'rgba(239,68,68,0.20)' : '#fecaca',
          },
          {
            label: 'Receitas',
            value: totalIncomes,
            icon: TrendingUp,
            color: '#10b981',
            bg: isDark ? 'rgba(16,185,129,0.10)' : '#ecfdf5',
            border: isDark ? 'rgba(16,185,129,0.20)' : '#a7f3d0',
          },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            style={{
              background: t.bg.card,
              border: `1px solid ${t.border.default}`,
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: t.shadow.card,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: bg,
                border: `1px solid ${border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: t.text.primary, lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: 11, color: t.text.muted, marginTop: 2 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {}
      <div
        style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}
      >
        {}
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 18,
            padding: '20px 18px',
            boxShadow: t.shadow.card,
            position: 'sticky',
            top: 96,
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
            Criar nova categoria
          </p>

          {}
          {createSuccess && (
            <div
              style={{
                background: isDark ? 'rgba(16,185,129,0.12)' : '#dcfce7',
                border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : '#a7f3d0'}`,
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 14,
                fontSize: 12,
                fontWeight: 600,
                color: isDark ? '#6ee7b7' : '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ✓ Categoria criada com sucesso
            </div>
          )}

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <Input
                id="category-form-name"
                label="Nome da Categoria"
                placeholder="Ex: Alimentação, Salário..."
                {...register('name')}
                error={formState.errors.name?.message as string}
              />
              <Select
                label="Tipo"
                options={[
                  { value: 'expense', label: '💸 Despesa' },
                  { value: 'income', label: '💰 Receita' },
                ]}
                value={selectedType}
                onChange={(val) => setValue('type', val as 'expense' | 'income')}
              />

              {}
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: t.text.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    marginBottom: 8,
                  }}
                >
                  Sugestões
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(selectedType === 'expense' ? EXPENSE_SUGGESTIONS : INCOME_SUGGESTIONS).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setValue('name', s)}
                        style={{
                          fontSize: 11,
                          padding: '4px 10px',
                          borderRadius: 999,
                          border: `1px solid ${t.border.input}`,
                          background: t.bg.muted,
                          color: t.text.secondary,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {s}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={createCategory.isPending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#6366f1',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: createCategory.isPending ? 'not-allowed' : 'pointer',
                  opacity: createCategory.isPending ? 0.7 : 1,
                  transition: 'all 0.15s ease',
                  marginTop: 4,
                }}
              >
                {createCategory.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Plus size={15} />
                )}
                Criar Categoria
              </button>
            </form>
          </FormProvider>
        </div>

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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '14px 18px',
              borderBottom: `1px solid ${t.border.divider}`,
            }}
          >
            <button style={tabActiveStyle('expense')} onClick={() => setActiveTab('expense')}>
              <span style={{ marginRight: 6 }}>💸</span>
              Despesas
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  padding: '1px 7px',
                  borderRadius: 999,
                  background: isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2',
                  color: isDark ? '#fca5a5' : '#dc2626',
                }}
              >
                {totalExpenses}
              </span>
            </button>
            <button style={tabActiveStyle('income')} onClick={() => setActiveTab('income')}>
              <span style={{ marginRight: 6 }}>💰</span>
              Receitas
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  padding: '1px 7px',
                  borderRadius: 999,
                  background: isDark ? 'rgba(16,185,129,0.15)' : '#dcfce7',
                  color: isDark ? '#6ee7b7' : '#166534',
                }}
              >
                {totalIncomes}
              </span>
            </button>
          </div>

          {}
          {activeLoading ? (
            <SkeletonList rows={5} t={t} />
          ) : activeData && activeData.data.length > 0 ? (
            <>
              <div>
                {activeData.data.map((cat, idx) => {
                  const isHovered = hoveredId === cat.id;
                  const isLast = idx === activeData.data.length - 1;
                  const isEditing = editingId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredId(cat.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 18px',
                        borderBottom: isLast ? 'none' : `1px solid ${t.border.divider}`,
                        background: isEditing
                          ? isDark ? 'rgba(99,102,241,0.06)' : '#f5f3ff'
                          : isHovered ? t.bg.cardHover : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: isExpense
                              ? isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2'
                              : isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Tag
                            size={16}
                            color={isExpense ? (isDark ? '#fca5a5' : '#dc2626') : (isDark ? '#6ee7b7' : '#166534')}
                          />
                        </div>

                        {isEditing ? (
                          /* Inline edit input */
                          <input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') confirmEdit(cat);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            style={{
                              flex: 1,
                              height: 34,
                              padding: '0 10px',
                              borderRadius: 8,
                              border: `1.5px solid ${t.border.focus}`,
                              background: t.bg.input,
                              color: t.text.primary,
                              fontSize: 13,
                              fontWeight: 600,
                              outline: 'none',
                              boxShadow: t.shadow.focus,
                            }}
                          />
                        ) : (
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>
                              {cat.name}
                            </p>
                            <p style={{ fontSize: 11, color: t.text.muted }}>
                              {isExpense ? 'Categoria de despesa' : 'Categoria de receita'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexShrink: 0,
                          opacity: isHovered || isEditing ? 1 : 0,
                          transition: 'opacity 0.15s ease',
                        }}
                      >
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => confirmEdit(cat)}
                              disabled={updateCategory.isPending}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 8, border: 'none',
                                background: '#6366f1', color: '#fff',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              }}
                            >
                              {updateCategory.isPending
                                ? <Loader2 size={12} className="animate-spin" />
                                : <Check size={12} />}
                              Salvar
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 10px', borderRadius: 8,
                                border: `1px solid ${t.border.default}`,
                                background: 'transparent', color: t.text.muted,
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              }}
                            >
                              <X size={12} />
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(cat)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 8,
                                border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : '#c7d2fe'}`,
                                background: isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
                                color: isDark ? '#a5b4fc' : '#4338ca',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              }}
                            >
                              <Pencil size={12} />
                              Renomear
                            </button>
                            <button
                              onClick={() => setCategoryToDelete(cat)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 8,
                                border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : '#fecaca'}`,
                                background: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
                                color: isDark ? '#fca5a5' : '#dc2626',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={12} />
                              Excluir
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: '8px 18px', borderTop: `1px solid ${t.border.divider}` }}>
                <Pagination
                  currentPage={activePage}
                  totalPages={activeData.totalPages}
                  onPageChange={setActivePage}
                  totalItems={activeData.total}
                  itemsPerPage={10}
                />
              </div>
            </>
          ) : (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: isExpense
                    ? isDark
                      ? 'rgba(239,68,68,0.10)'
                      : '#fef2f2'
                    : isDark
                      ? 'rgba(16,185,129,0.10)'
                      : '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Tag
                  size={24}
                  color={
                    isExpense ? (isDark ? '#fca5a5' : '#dc2626') : isDark ? '#6ee7b7' : '#166534'
                  }
                />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: t.text.primary, marginBottom: 6 }}>
                Nenhuma categoria de {isExpense ? 'despesa' : 'receita'} criada
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: t.text.muted,
                  marginBottom: 20,
                  maxWidth: 320,
                  margin: '0 auto 20px',
                }}
              >
                {isExpense
                  ? 'Crie categorias como Alimentação, Transporte ou Saúde para organizar suas despesas.'
                  : 'Crie categorias como Salário, Freelance ou Investimentos para organizar suas receitas.'}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                {(isExpense ? EXPENSE_SUGGESTIONS : INCOME_SUGGESTIONS).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setValue('name', s);
                      setValue('type', activeTab);
                      document.getElementById('category-form-name')?.focus();
                    }}
                    style={{
                      fontSize: 12,
                      padding: '5px 12px',
                      borderRadius: 999,
                      border: `1px solid ${t.border.input}`,
                      background: t.bg.muted,
                      color: t.text.secondary,
                      cursor: 'pointer',
                    }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Categoria"
        description={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
