import { api } from '@/services/api.service';
import type {
  CreditCard,
  CreditCardInvoice,
  CreditCardPurchase,
  CreateCreditCardDTO,
  CreatePurchaseDTO,
} from '../types/credit-card.types';

const BASE = '/finance/credit-cards';

export const creditCardsService = {
  list: async (familyId?: string): Promise<CreditCard[]> => {
    const params = familyId ? `?familyId=${familyId}` : '';
    const { data } = await api.get(`${BASE}${params}`);
    return data;
  },

  getById: async (id: string): Promise<CreditCard> => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },

  create: async (dto: CreateCreditCardDTO): Promise<CreditCard> => {
    const { data } = await api.post(BASE, dto);
    return data;
  },

  update: async (id: string, dto: Partial<CreateCreditCardDTO>): Promise<CreditCard> => {
    const { data } = await api.put(`${BASE}/${id}`, dto);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },

  createPurchase: async (dto: CreatePurchaseDTO): Promise<CreditCardPurchase> => {
    const { data } = await api.post(`${BASE}/purchases`, dto);
    return data;
  },

  getPurchasesByCard: async (cardId: string): Promise<CreditCardPurchase[]> => {
    const { data } = await api.get(`${BASE}/${cardId}/purchases`);
    return data;
  },

  getInvoices: async (cardId: string): Promise<CreditCardInvoice[]> => {
    const { data } = await api.get(`${BASE}/${cardId}/invoices`);
    return data;
  },

  getInvoiceById: async (invoiceId: string): Promise<CreditCardInvoice> => {
    const { data } = await api.get(`${BASE}/invoices/${invoiceId}`);
    return data;
  },

  payInvoice: async (invoiceId: string, paidAmount: number): Promise<void> => {
    await api.post(`${BASE}/invoices/${invoiceId}/pay`, { paidAmount });
  },

  getAllInvoicesByFamily: async (familyId: string): Promise<CreditCardInvoice[]> => {
    const { data } = await api.get(`${BASE}/family/${familyId}/invoices`);
    return data;
  },

  getSummaryByFamily: async (
    familyId: string,
    month: number,
    year: number,
  ): Promise<CreditCard[]> => {
    const { data } = await api.get(
      `${BASE}/family/${familyId}/summary?month=${month}&year=${year}`,
    );
    return data;
  },
};
