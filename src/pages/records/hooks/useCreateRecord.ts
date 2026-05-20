import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { recordService } from '../services/records.service';

type RecordFormData = {
  description: string;
  value: string;
  date: string;
  categoryName?: string;
  categoryId?: string;
  type: 'expense' | 'salary' | 'income';
  personId: string;
  familyId: string;
  isRecurring: boolean;
  durationMonths?: string;
  isShared?: boolean;
};

const mapFormTypeToBackendType = (formType: string, isRecurring: boolean): string => {
  if (formType === 'expense') return isRecurring ? 'fixed' : 'variable';
  if (formType === 'salary') return 'fixed';
  if (formType === 'income') return 'temporary';
  return 'variable';
};

export function useCreateRecord() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (formData: RecordFormData) => {
      const backendType = mapFormTypeToBackendType(formData.type, formData.isRecurring);

      const data: any = {
        ...formData,
        formType: formData.type,
        type: backendType,
        value: Number(formData.value),
        durationMonths: formData.durationMonths ? Number(formData.durationMonths) : undefined,
        status: 'PENDING' as const,
      };

      if (!data.categoryName || data.categoryName.trim() === '') {
        delete data.categoryName;
      }

      return recordService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      queryClient.invalidateQueries({ queryKey: ['records-resumo'] });
      queryClient.invalidateQueries({ queryKey: ['incomes-summary'] });
      queryClient.invalidateQueries({ queryKey: ['extras-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-upcoming'] });
      showToast({
        title: 'Sucesso',
        description: 'Lançamento criado com sucesso!',
        variant: 'success',
      });
    },
    onError: () => {
      showToast({
        title: 'Erro',
        description: 'Erro ao criar lançamento',
        variant: 'error',
      });
    },
  });
}
