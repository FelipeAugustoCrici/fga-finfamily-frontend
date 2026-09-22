import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { recordService } from '../services/records.service';
import type { RecordFormData } from '../components/RecordForm';

const mapFormTypeToBackendType = (formType: string, isRecurring: boolean): string => {
  if (formType === 'expense') {
    return isRecurring ? 'fixed' : 'variable';
  }
  if (formType === 'salary') {
    return 'fixed';
  }
  if (formType === 'income') {
    return 'temporary';
  }
  return 'variable';
};

export function useUpdateRecord() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data: formData }: { id: string; data: RecordFormData }) => {
      const backendType = mapFormTypeToBackendType(formData.type, formData.isRecurring);

      // paymentMethod/creditCardId/installments só valem na criação — o
      // backend não suporta trocar a forma de pagamento de um lançamento
      // existente, então não fazem parte do payload de update.
      const {
        paymentMethod: _paymentMethod,
        creditCardId: _creditCardId,
        installments: _installments,
        ...rest
      } = formData as any;

      const data: any = {
        ...rest,
        formType: formData.type,
        type: backendType,
        value: Number(formData.value),
        durationMonths: formData.durationMonths ? Number(formData.durationMonths) : undefined,
      };

      return recordService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      queryClient.invalidateQueries({ queryKey: ['records-resumo'] });
      queryClient.invalidateQueries({ queryKey: ['incomes-summary'] });
      queryClient.invalidateQueries({ queryKey: ['extras-summary'] });
      showToast({
        title: 'Sucesso',
        description: 'Lançamento atualizado com sucesso!',
        variant: 'success',
      });
    },
    onError: (error: any) => {
      showToast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao atualizar lançamento',
        variant: 'error',
      });
    },
  });
}
