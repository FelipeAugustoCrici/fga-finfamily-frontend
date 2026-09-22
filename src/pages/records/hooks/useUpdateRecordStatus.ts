import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { recordService } from '../services/records.service';
import { RecordStatus } from '../types/record.types';

export function useUpdateRecordStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecordStatus }) =>
      recordService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['records-resumo'] });
      queryClient.invalidateQueries({ queryKey: ['record-detail'] });
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['credit-card-invoices'] });
    },
    onError: (error: any) => {
      showToast({
        title: 'Erro',
        description: error?.response?.data?.message || 'Erro ao atualizar status',
        variant: 'error',
      });
    },
  });
}
