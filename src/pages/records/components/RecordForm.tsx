import { useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useCreditCards } from '@/pages/credit-cards/hooks/useCreditCards';
import { SmartInput } from './SmartInput';
import { RecordFormHeader } from './RecordFormHeader';
import { RecordTypeSelector } from './RecordTypeSelector';
import { RecordDetailsForm } from './RecordDetailsForm';
import { ToggleCards } from './ToggleCards';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { RecordReceiptPreview } from './RecordReceiptPreview';
import { Select } from '@/components/ui/Select';
import { FormActionBar } from '@/components/ui/FormActionBar';
import { Record } from '../types/record.types';

const recordSchema = z
  .object({
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
    paymentMethod: z.enum(['account', 'credit_card']).default('account'),
    creditCardId: z.string().optional(),
    installments: z.string().default('1'),
  })
  .refine((data) => data.paymentMethod !== 'credit_card' || !!data.creditCardId, {
    message: 'Selecione um cartão',
    path: ['creditCardId'],
  })
  .refine(
    (data) => data.type !== 'expense' || data.paymentMethod !== 'credit_card' || !data.isRecurring,
    {
      message: 'Lançamentos no cartão não podem ser recorrentes',
      path: ['isRecurring'],
    },
  );

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

  // Lançamento já vinculado a uma compra no cartão (parcela) ou é a fatura
  // agregada de um cartão: só descrição e categoria podem ser editadas
  // (mesma regra do backend).
  const isCardLocked = !!(
    (initialData as any)?.purchaseId || (initialData as any)?.creditCardInvoiceId
  );
  const isInvoiceRecord = !!(initialData as any)?.creditCardInvoiceId;
  // A forma de pagamento só pode ser escolhida na criação — o backend não
  // suporta trocar conta↔cartão num lançamento já existente.
  const isEdit = !!initialData?.id;

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
      paymentMethod:
        (initialData as any)?.paymentMethod === 'credit_card' ? 'credit_card' : 'account',
      creditCardId: (initialData as any)?.creditCardId || '',
      installments: '1',
    },
  });

  const { handleSubmit, reset, register, watch, formState } = methods;
  const familyId = watch('familyId');
  const { data: creditCards = [] } = useCreditCards(familyId);

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
        paymentMethod: d.paymentMethod === 'credit_card' ? 'credit_card' : 'account',
        creditCardId: d.creditCardId || '',
        installments: '1',
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
              borderRadius: 14,
              padding: 24,
              boxShadow: t.shadow.card,
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
            }}
          >
            {isCardLocked && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: t.bg.muted,
                  border: `1px solid ${t.border.default}`,
                }}
              >
                <CreditCardIcon
                  size={14}
                  style={{ color: t.text.muted, marginTop: 1, flexShrink: 0 }}
                />
                <p style={{ fontSize: 12, color: t.text.muted, lineHeight: 1.5 }}>
                  {isInvoiceRecord
                    ? 'Esta é a fatura do cartão, gerada automaticamente. Só descrição e categoria podem ser alteradas aqui — marque como paga na listagem quando quitar o cartão.'
                    : 'Este lançamento é uma parcela de uma compra no cartão, já paga. Só descrição e categoria podem ser alteradas aqui — para mudar valor, data, parcelas ou cartão, exclua e lance de novo.'}
                </p>
              </div>
            )}

            {/* Smart input */}
            {!isCardLocked && <SmartInput categories={categories} familyId={familyId} />}

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
            <RecordDetailsForm categories={categories} financialsDisabled={isCardLocked} />

            {watch('type') === 'expense' && (
              <>
                <div style={{ height: 1, background: t.border.divider }} />
                <PaymentMethodSelector
                  creditCards={creditCards}
                  disabled={isCardLocked || isEdit}
                />
              </>
            )}

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
                    disabled={memberOptions.length === 0 || isCardLocked}
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
            <ToggleCards showShared={watch('type') === 'expense'} disabled={isCardLocked} />
          </div>

          {/* Right column — sticky preview */}
          <div className="record-form-preview">
            <RecordReceiptPreview
              people={people}
              categories={categories}
              creditCards={creditCards}
            />
          </div>
        </div>

        {/* Sticky action bar */}
        <FormActionBar isLoading={!!isLoading} isEdit={!!initialData?.id} />
      </form>
    </FormProvider>
  );
}
