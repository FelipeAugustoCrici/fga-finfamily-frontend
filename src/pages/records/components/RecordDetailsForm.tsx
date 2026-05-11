import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Tag } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import _ from 'lodash';

export function RecordDetailsForm({ categories }: { categories: any[] }) {
  const { register, setValue, formState, control } = useFormContext();
  const type = useWatch({ name: 'type' });
  const categoryId = useWatch({ name: 'categoryId' });
  const t = useTokens();

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleCategoryChange = (val: string | number) => {
    setValue('categoryId', val);
    const selected = _.find(categories, { id: val });
    setValue('categoryName', selected?.name || '');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Linha 1: Descrição */}
      <Input
        label="Descrição"
        placeholder="Ex: Conta de luz, Supermercado, Salário mensal..."
        {...register('description')}
        error={formState.errors.description?.message as string}
      />

      {/* Linha 2: Valor | Categoria | Data */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}
        className="grid-cols-1 sm:grid-cols-3"
      >
        <Controller
          name="value"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Valor (R$)"
              placeholder="0,00"
              value={field.value}
              onChange={field.onChange}
              error={formState.errors.value?.message as string}
            />
          )}
        />

        {type === 'expense' ? (
          <div>
            <Select
              label="Categoria"
              placeholder={expenseCategories.length > 0 ? 'Categoria' : 'Sem categorias'}
              options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))}
              value={categoryId}
              onChange={handleCategoryChange}
              error={formState.errors.categoryId?.message as string}
              disabled={expenseCategories.length === 0}
              searchable={expenseCategories.length > 5}
            />
            {expenseCategories.length === 0 && (
              <p
                style={{
                  fontSize: 11,
                  color: '#d97706',
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Tag size={11} />
                Cadastre categorias primeiro
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 12, color: t.text.muted, textAlign: 'center' }}>
              {type === 'salary' ? '💰 Sem categoria' : '✨ Sem categoria'}
            </p>
          </div>
        )}

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Data"
              value={field.value}
              onChange={field.onChange}
              error={formState.errors.date?.message as string}
            />
          )}
        />
      </div>
    </div>
  );
}
