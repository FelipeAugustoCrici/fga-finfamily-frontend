import axios from 'axios';
import { ExtraIncome, Income, Expense, Goal, Budget, CreditCard, Family, Category } from '@/types';
import { fetchAuthSession } from 'aws-amplify/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

api.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const prefix = '/finance';

export const financeService = {
  async getCategories() {
    const response = await api.get<Category[]>(`${prefix}/categories`);
    return response.data;
  },

  async getFamilies() {
    const response = await api.get<Family[]>(`${prefix}/families`);
    return response.data;
  },

  async getExtras(month: number, year: number, status?: string) {
    let url = `${prefix}/extras?month=${month}&year=${year}`;
    if (status && status !== 'ALL') url += `&status=${status}`;
    const response = await api.get<{ data: ExtraIncome[] }>(url);
    return response.data;
  },

  async addIncome(data: Income & { isRecurring?: boolean; durationMonths?: number }) {
    const response = await api.post(`${prefix}/incomes`, data);
    return response.data;
  },
  async getIncomes(month: number, year: number, familyId?: string, status?: string) {
    let url = `${prefix}/incomes?month=${month}&year=${year}`;
    if (familyId) url += `&familyId=${familyId}`;
    if (status && status !== 'ALL') url += `&status=${status}`;
    const response = await api.get<Income[]>(url);
    return response.data;
  },

  async addExpense(data: Expense) {
    const response = await api.post(`${prefix}/expenses`, data);
    return response.data;
  },
  async getExpenses(
    month: number,
    year: number,
    familyId?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    let url = `${prefix}/expenses?month=${month}&year=${year}&page=${page}&limit=${limit}`;
    if (familyId) url += `&familyId=${familyId}`;
    if (status && status !== 'ALL') url += `&status=${status}`;
    const response = await api.get<{
      data: Expense[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(url);
    return response.data;
  },

  async addGoal(data: Partial<Goal>) {
    const response = await api.post(`${prefix}/goals`, data);
    return response.data;
  },
  async getGoals() {
    const response = await api.get<Goal[]>(`${prefix}/goals`);
    return response.data;
  },

  async saveBudget(data: Budget) {
    const response = await api.post(`${prefix}/budgets`, data);
    return response.data;
  },

  async addCreditCard(data: CreditCard) {
    const response = await api.post(`${prefix}/credit-cards`, data);
    return response.data;
  },
  async getCreditCards() {
    const response = await api.get<CreditCard[]>(`${prefix}/credit-cards`);
    return response.data;
  },

  async deleteRecord(
    type:
      | 'salaries'
      | 'extras'
      | 'incomes'
      | 'expenses'
      | 'budgets'
      | 'categories'
      | 'credit-cards'
      | 'goals',
    id: string,
  ) {
    await api.delete(`${prefix}/${type}/${id}`);
  },
  async updateRecord(
    type:
      | 'salaries'
      | 'extras'
      | 'incomes'
      | 'expenses'
      | 'budgets'
      | 'categories'
      | 'credit-cards'
      | 'goals',
    id: string,
    data: any,
  ) {
    const response = await api.patch(`${prefix}/${type}/${id}`, data);
    return response.data;
  },
};
