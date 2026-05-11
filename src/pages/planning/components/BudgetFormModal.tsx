import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useCreateBudget } from '../hooks/useCreateBudget';
import { useCategories } from '@/pages/categories/hooks/useCategories';
import { useTokens } from '@/hooks/useTokens';
import { Loader2 } from 'lucide-react';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  categoryName: z.string(),
  limitValue: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Valor inválido'),

  monthYear: z.string().min(1, 'Mês/Ano é obrigatório'),
  familyId: z.string().min(1, 'Família é obrigatória'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
}

const currentDate = new Date();
const defaultMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;

export function BudgetFormModal({ isOpen, onClose, familyId }: BudgetFormModalProps) {
  const t = useTokens();
  const createBudget = useCreateBudget();
  const { data: categories = [] } = useCategories();
  const expenseCategories = categories.filter((c: any) => c.type === 'expense');

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: '',
      categoryName: '',
      limitValue: '',
      monthYear: defaultMonthYear,
      familyId,
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    const [year, month] = data.monthYear.split('-').map(Number);
    createBudget.mutate(
      {
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        limitValue: data.limitValue,
        month: String(month),
        year: String(year),
        familyId: data.familyId,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  const handleCategoryChange = (val: string | number) => {
    const category = categories.find((c: any) => c.id === val);
    setValue('categoryId', String(val));
    setValue('categoryName', category?.name || '');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Orçamento">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Select
            label="Categoria"
            placeholder="Selecione uma categoria"
            options={expenseCategories.map((c: any) => ({ value: c.id, label: c.name }))}
            value={watch('categoryId')}
            onChange={handleCategoryChange}
            error={errors.categoryId?.message}
            searchable={expenseCategories.length > 5}
          />

          <Controller
            name="limitValue"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Limite Mensal (R$)"
                placeholder="0,00"
                value={field.value}
                onChange={field.onChange}
                error={errors.limitValue?.message}
              />
            )}
          />

          <Controller
            name="monthYear"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Mês / Ano"
                mode="month"
                value={field.value}
                onChange={field.onChange}
                error={errors.monthYear?.message}
                placeholder="Selecione o mês"
              />
            )}
          />
        </div>

        <div style={{ height: 1, background: t.border.divider, margin: '20px 0 16px' }} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={createBudget.isPending}>
            {createBudget.isPending ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Criando...
              </span>
            ) : (
              'Criar Orçamento'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
