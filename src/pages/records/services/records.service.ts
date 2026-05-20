import { api } from '@/services/api.service';
import { Record, CreateRecordDTO, UpdateRecordDTO } from '../types/record.types';

const getRouteByFormType = (formType: string): string => {
  switch (formType) {
    case 'expense':
      return 'expenses';
    case 'salary':
      return 'incomes';
    case 'income':
      return 'extras';
    default:
      return 'expenses';
  }
};

export const recordService = {
  async list(month?: number, year?: number, familyId?: string, status?: string): Promise<Record[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (familyId) params.append('familyId', familyId);
    if (status && status !== 'ALL') params.append('status', status);

    const { data } = await api.get(`/finance/expenses?${params.toString()}`);
    return data;
  },

  async getById(id: string, recordType?: 'expense' | 'income' | 'extra'): Promise<Record> {
    if (recordType === 'income') {
      const { data } = await api.get(`/finance/incomes/${id}`);
      return data;
    }
    if (recordType === 'extra') {
      const { data } = await api.get(`/finance/extras/${id}`);
      return data;
    }

    const { data } = await api.get(`/finance/expenses/${id}`);
    return data;
  },

  async create(data: CreateRecordDTO & { type: string }): Promise<Record> {
    const formType = (data as any).formType || 'expense';
    const route = getRouteByFormType(formType);

    const { formType: _formType, ...payload } = data as any;

    const response = await api.post(`/finance/${route}`, payload);
    return response.data;
  },

  async update(id: string, data: UpdateRecordDTO & { type: string }): Promise<Record> {
    const formType = (data as any).formType || 'expense';
    const route = getRouteByFormType(formType);

    const { formType: _formType, ...payload } = data as any;

    const response = await api.put(`/finance/${route}/${id}`, payload);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Record> {
    const response = await api.patch(`/finance/expenses/${id}/status`, { status });
    return response.data;
  },

  async addPayment(expenseId: string, data: { amount: number; paidAt?: string; note?: string; transferToNextMonth?: boolean }) {
    const response = await api.post(`/finance/expenses/${expenseId}/payments`, data);
    return response.data;
  },

  async getPayments(expenseId: string) {
    const response = await api.get(`/finance/expenses/${expenseId}/payments`);
    return response.data;
  },

  async deletePayment(expenseId: string, paymentId: string) {
    const response = await api.delete(`/finance/expenses/${expenseId}/payments/${paymentId}`);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/finance/expenses/${id}`);
  },
};
