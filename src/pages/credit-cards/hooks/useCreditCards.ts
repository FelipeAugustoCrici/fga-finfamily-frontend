import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { creditCardsService } from '../services/credit-cards.service';
import type { CreateCreditCardDTO, CreatePurchaseDTO } from '../types/credit-card.types';

export function useCreditCards(familyId?: string) {
  return useQuery({
    queryKey: ['credit-cards', familyId],
    queryFn: () => creditCardsService.list(familyId),
  });
}

export function useCreditCardById(id: string) {
  return useQuery({
    queryKey: ['credit-card', id],
    queryFn: () => creditCardsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCreditCard() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (dto: CreateCreditCardDTO) => creditCardsService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
      showToast({ title: 'Sucesso', description: 'Cartão criado!', variant: 'success' });
    },
    onError: () =>
      showToast({ title: 'Erro', description: 'Erro ao criar cartão', variant: 'error' }),
  });
}

export function useUpdateCreditCard() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateCreditCardDTO> }) =>
      creditCardsService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
      showToast({ title: 'Sucesso', description: 'Cartão atualizado!', variant: 'success' });
    },
    onError: () =>
      showToast({ title: 'Erro', description: 'Erro ao atualizar cartão', variant: 'error' }),
  });
}

export function useDeleteCreditCard() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: string) => creditCardsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
      showToast({ title: 'Sucesso', description: 'Cartão removido!', variant: 'success' });
    },
    onError: () =>
      showToast({ title: 'Erro', description: 'Erro ao remover cartão', variant: 'error' }),
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (dto: CreatePurchaseDTO) => creditCardsService.createPurchase(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
      qc.invalidateQueries({ queryKey: ['credit-card-invoices'] });
      showToast({ title: 'Sucesso', description: 'Compra lançada!', variant: 'success' });
    },
    onError: () =>
      showToast({ title: 'Erro', description: 'Erro ao lançar compra', variant: 'error' }),
  });
}

export function useInvoices(cardId: string) {
  return useQuery({
    queryKey: ['credit-card-invoices', cardId],
    queryFn: () => creditCardsService.getInvoices(cardId),
    enabled: !!cardId,
  });
}

export function useInvoiceById(invoiceId: string) {
  return useQuery({
    queryKey: ['credit-card-invoice', invoiceId],
    queryFn: () => creditCardsService.getInvoiceById(invoiceId),
    enabled: !!invoiceId,
  });
}

export function usePayInvoice() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ invoiceId, paidAmount }: { invoiceId: string; paidAmount: number }) =>
      creditCardsService.payInvoice(invoiceId, paidAmount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-cards'] });
      qc.invalidateQueries({ queryKey: ['credit-card-invoices'] });
      qc.invalidateQueries({ queryKey: ['credit-card-invoice'] });
      showToast({ title: 'Sucesso', description: 'Fatura paga!', variant: 'success' });
    },
    onError: () =>
      showToast({ title: 'Erro', description: 'Erro ao pagar fatura', variant: 'error' }),
  });
}

export function useAllInvoicesByFamily(familyId: string) {
  return useQuery({
    queryKey: ['family-invoices', familyId],
    queryFn: () => creditCardsService.getAllInvoicesByFamily(familyId),
    enabled: !!familyId,
  });
}
