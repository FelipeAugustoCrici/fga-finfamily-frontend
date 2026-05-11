import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Button } from '@/components/ui/Button';
import { useCreateGoal } from '../hooks/useCreateGoal';
import { Loader2, FileText } from 'lucide-react';
import { GOAL_TYPE_META } from './goalUtils';
import { useTokens } from '@/hooks/useTokens';
import type { GoalType } from '../types/planning.types';

const goalSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  type: z.enum(['savings', 'debt', 'purchase', 'investment']),
  targetValue: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Valor inválido'),
  deadline: z.string().optional(),
  familyId: z.string().min(1),
});

type FormData = z.infer<typeof goalSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
}

const TYPE_COLORS: Record<
  GoalType,
  { active: string; border: string; text: string; icon: string }
> = {
  savings: { active: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#10b981', icon: '#10b981' },
  debt: { active: 'rgba(244,63,94,0.12)', border: '#f43f5e', text: '#f43f5e', icon: '#f43f5e' },
  purchase: {
    active: 'rgba(139,92,246,0.12)',
    border: '#8b5cf6',
    text: '#8b5cf6',
    icon: '#8b5cf6',
  },
  investment: {
    active: 'rgba(59,130,246,0.12)',
    border: '#3b82f6',
    text: '#3b82f6',
    icon: '#3b82f6',
  },
};

export function GoalFormModal({ isOpen, onClose, familyId }: Props) {
  const t = useTokens();
  const createGoal = useCreateGoal();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: { description: '', type: 'savings', targetValue: '', deadline: '', familyId },
  });

  const selectedType = watch('type');

  const onSubmit = (data: FormData) => {
    createGoal.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Meta Financeira">
      <form onSubmit={handleSubmit(onSubmit)}>
        {}
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: t.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10,
            }}
          >
            Tipo de meta
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(
              Object.entries(GOAL_TYPE_META) as [GoalType, (typeof GOAL_TYPE_META)[GoalType]][]
            ).map(([key, meta]) => {
              const Icon = meta.icon;
              const active = selectedType === key;
              const colors = TYPE_COLORS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue('type', key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: `1.5px solid ${active ? colors.border : t.border.input}`,
                    background: active ? colors.active : t.bg.input,
                    color: active ? colors.text : t.text.secondary,
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = t.bg.muted;
                      (e.currentTarget as HTMLElement).style.borderColor = t.border.strong;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = t.bg.input;
                      (e.currentTarget as HTMLElement).style.borderColor = t.border.input;
                    }
                  }}
                >
                  <Icon
                    size={15}
                    style={{ color: active ? colors.icon : t.text.muted, flexShrink: 0 }}
                  />
                  <span style={{ lineHeight: 1.3 }}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Nome da Meta"
            placeholder="Ex: Viagem de férias, Carro novo..."
            {...register('description')}
            error={errors.description?.message}
            icon={<FileText size={15} style={{ color: t.text.muted }} />}
          />

          <Controller
            name="targetValue"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Valor Alvo (R$)"
                placeholder="0,00"
                value={field.value}
                onChange={field.onChange}
                error={errors.targetValue?.message}
              />
            )}
          />

          <Controller
            name="deadline"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Prazo (opcional)"
                value={field.value}
                onChange={field.onChange}
                error={errors.deadline?.message}
              />
            )}
          />
        </div>

        {}
        <div style={{ height: 1, background: t.border.divider, margin: '20px 0 16px' }} />

        {}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={createGoal.isPending}>
            {createGoal.isPending ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Criando...
              </span>
            ) : (
              'Criar Meta'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
