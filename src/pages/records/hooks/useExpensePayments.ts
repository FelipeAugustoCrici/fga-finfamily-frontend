import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { recordService } from '../services/records.service';

export function useExpensePayments(expenseId?: string) {
  return useQuery({
    queryKey: ['expense-payments', expenseId],
    queryFn: () => recordService.getPayments(expenseId!),
    enabled: !!expenseId,
  });
}

export function useAddPayment(expenseId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: { amount: number; paidAt?: string; note?: string; transferToNextMonth?: boolean }) =>
      recordService.addPayment(expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-payments', expenseId] });
      queryClient.invalidateQueries({ queryKey: ['record-detail', expenseId] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['records-resumo'] });
      showToast({ title: 'Sucesso', description: 'Pagamento registrado!', variant: 'success' });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Erro ao registrar pagamento';
      showToast({ title: 'Erro', description: msg, variant: 'error' });
    },
  });
}

export function useDeletePayment(expenseId: string) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (paymentId: string) => recordService.deletePayment(expenseId, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-payments', expenseId] });
      queryClient.invalidateQueries({ queryKey: ['record-detail', expenseId] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['records-resumo'] });
      showToast({ title: 'Sucesso', description: 'Pagamento removido.', variant: 'success' });
    },
    onError: () => {
      showToast({ title: 'Erro', description: 'Erro ao remover pagamento', variant: 'error' });
    },
  });
}
