import { useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTokens } from '@/hooks/useTokens';
import { SmartInput } from './SmartInput';
import { RecordFormHeader } from './RecordFormHeader';
import { RecordTypeSelector } from './RecordTypeSelector';
import { RecordDetailsForm } from './RecordDetailsForm';
import { ToggleCards } from './ToggleCards';
import { SummarySection } from './SummarySection';
import { Select } from '@/components/ui/Select';
import { FormActionBar } from '@/components/ui/FormActionBar';
import { Record } from '../types/record.types';

const recordSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  value: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Valor inválido'),
  date: z.string().min(1, 'Data é obrigatória'),
  categoryName: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(['expense', 'salary', 'income']),
  personId: z.string().min(1, 'Responsável é obrigatório'),
  familyId: z.string().min(1, 'Família é obrigatória'),
  isRecurring: z.boolean(),
  durationMonths: z.string().optional(),
  isShared: z.boolean().default(true),
});

export type RecordFormData = z.infer<typeof recordSchema>;

interface RecordFormProps {
  initialData?: Partial<Record>;
  onSubmit: (data: RecordFormData) => void;
  isLoading?: boolean;
  families?: any[];
  categories?: any[];
  people?: any[];
}

export function RecordForm({
  initialData,
  onSubmit,
  isLoading,
  families = [],
  categories = [],
  people = [],
}: RecordFormProps) {
  const t = useTokens();

  const mapType = (data?: any): 'expense' | 'salary' | 'income' => {
    if (data?.recordType) return data.recordType;
    if (data?.sourceId) return 'salary';
    return 'expense';
  };

  const getFamilyId = () => {
    const d = initialData as any;
    return d?.person?.familyId || d?.person?.family?.id || d?.familyId || families[0]?.id || '';
  };

  const methods = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      description: initialData?.description || '',
      value: initialData?.value?.toString() || '',
      date: initialData?.date
        ? initialData.date.split('T')[0]
        : new Date().toISOString().split('T')[0],
      categoryName: '',
      categoryId: initialData?.categoryId || '',
      type: mapType(initialData),
      personId: initialData?.personId || '',
      familyId: getFamilyId(),
      isRecurring: !!(initialData as any)?.recurringId,
      durationMonths: '',
      isShared: (initialData as any)?.isShared !== false,
    },
  });

  const { handleSubmit, reset, register, watch, formState } = methods;
  const familyId = watch('familyId');

  useEffect(() => {
    if (initialData) {
      const d = initialData as any;
      reset({
        description: d.description || '',
        value: d.value?.toString() || '',
        date: d.date ? d.date.split('T')[0] : new Date().toISOString().split('T')[0],
        categoryName: d.categoryName,
        categoryId: d.categoryId || '',
        type: mapType(d),
        personId: d.personId || '',
        familyId: d.person?.familyId || d.person?.family?.id || d.familyId || families[0]?.id || '',
        isRecurring: !!d.recurringId,
        durationMonths: '',
        isShared: d.isShared !== false,
      });
    }
  }, [initialData, families, reset]);

  // Auto-set familyId when only one family
  useEffect(() => {
    if (families.length === 1 && !familyId) {
      methods.setValue('familyId', families[0].id);
    }
  }, [families, familyId, methods]);

  const family = families[0];
  const memberOptions = (family?.members || []).map((p: any) => ({ value: p.id, label: p.name }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 960, margin: '0 auto' }}>
        <input type="hidden" {...register('familyId')} />

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <RecordFormHeader isEdit={!!initialData?.id} isLoading={!!isLoading} />
        </div>

        {/* 2-column layout */}
        <div
          className="record-form-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 320px',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* Left column — main form */}
          <div
            style={{
              background: t.bg.card,
              border: `1px solid ${t.border.default}`,
              borderRadius: 16,
              padding: 20,
              boxShadow: t.shadow.card,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Smart input */}
            <SmartInput categories={categories} familyId={familyId} />

            {/* Tipo */}
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: t.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                }}
              >
                Tipo
              </p>
              <RecordTypeSelector />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: t.border.divider }} />

            {/* Detalhes */}
            <RecordDetailsForm categories={categories} />

            {/* Divider */}
            <div style={{ height: 1, background: t.border.divider }} />

            {/* Responsável */}
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
              className="grid-cols-1 sm:grid-cols-2"
            >
              <Controller
                name="personId"
                control={methods.control}
                render={({ field }) => (
                  <Select
                    label="Responsável"
                    placeholder={memberOptions.length > 0 ? 'Selecione' : 'Sem membros'}
                    options={memberOptions}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={memberOptions.length === 0}
                    error={formState.errors.personId?.message as string}
                  />
                )}
              />
              {family && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    paddingBottom: 2,
                  }}
                >
                  <p style={{ fontSize: 11, color: t.text.muted, marginBottom: 4 }}>Família</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: t.text.primary }}>
                    {family.name}
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: t.border.divider }} />

            {/* Toggle cards: Compartilhada + Recorrente */}
            <ToggleCards showShared={watch('type') === 'expense'} />
          </div>

          {/* Right column — sticky preview */}
          <div className="record-form-preview">
            <SummarySection people={people} categories={categories} />
          </div>
        </div>

        {/* Sticky action bar */}
        <FormActionBar isLoading={!!isLoading} isEdit={!!initialData?.id} />
      </form>
    </FormProvider>
  );
}
