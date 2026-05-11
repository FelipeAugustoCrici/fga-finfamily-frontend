import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useCreateCreditCard } from '../hooks/useCreditCards';
import { CARD_BRANDS } from '../types/credit-card.types';
import { CreditCard, Calendar, Building2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  bank: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  limitAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Valor inválido'),
  closingDay: z.string().refine((v) => {
    const n = Number(v);
    return n >= 1 && n <= 31;
  }, 'Dia inválido'),
  dueDay: z.string().refine((v) => {
    const n = Number(v);
    return n >= 1 && n <= 31;
  }, 'Dia inválido'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  familyId?: string;
  ownerId?: string;
}

const COLORS = ['#334155', '#7c3aed', '#0891b2', '#059669', '#dc2626', '#d97706', '#db2777'];

export function CreditCardFormModal({ isOpen, onClose, familyId, ownerId }: Props) {
  const create = useCreateCreditCard();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      bank: '',
      brand: 'other',
      color: '#334155',
      limitAmount: '',
      closingDay: '10',
      dueDay: '15',
    },
  });

  const selectedColor = watch('color');

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        name: data.name,
        bank: data.bank,
        brand: data.brand,
        color: data.color,
        limitAmount: Number(data.limitAmount),
        closingDay: Number(data.closingDay),
        dueDay: Number(data.dueDay),
        familyId,
        ownerId,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Cartão de Crédito">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome do Cartão"
          placeholder="Ex: Nubank Roxinho"
          {...register('name')}
          error={errors.name?.message}
          icon={<CreditCard size={18} className="text-primary-400" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Banco/Emissor"
            placeholder="Ex: Nubank"
            {...register('bank')}
            icon={<Building2 size={18} className="text-primary-400" />}
          />
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <Select
                label="Bandeira"
                options={CARD_BRANDS.map((b) => ({ value: b.value, label: b.label }))}
                value={field.value}
                onChange={(val) => field.onChange(val)}
              />
            )}
          />
        </div>

        <Controller
          name="limitAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Limite Total"
              placeholder="0,00"
              value={field.value}
              onChange={field.onChange}
              error={errors.limitAmount?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Dia de Fechamento"
            type="number"
            min="1"
            max="31"
            {...register('closingDay')}
            error={errors.closingDay?.message}
            icon={<Calendar size={18} className="text-primary-400" />}
          />
          <Input
            label="Dia de Vencimento"
            type="number"
            min="1"
            max="31"
            {...register('dueDay')}
            error={errors.dueDay?.message}
            icon={<Calendar size={18} className="text-primary-400" />}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Cor do Cartão</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c ? 'border-primary-800 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={create.isPending}>
            Criar Cartão
          </Button>
        </div>
      </form>
    </Modal>
  );
}
