import { api } from '@/services/api.service';
import type {
  Goal,
  Budget,
  CreditCard,
  GoalFormData,
  BudgetFormData,
  CreditCardFormData,
} from '../types/planning.types';

export const planningService = {
  getGoals: async (familyId?: string): Promise<Goal[]> => {
    const params = familyId ? `?familyId=${familyId}` : '';
    const { data } = await api.get(`/finance/goals${params}`);
    return data;
  },

  getGoal: async (id: string): Promise<Goal> => {
    const { data } = await api.get(`/finance/goals/${id}`);
    return data;
  },

  createGoal: async (goalData: Partial<GoalFormData>): Promise<Goal> => {
    const { data } = await api.post('/finance/goals', goalData);
    return data;
  },

  updateGoal: async (id: string, goalData: Partial<GoalFormData>): Promise<Goal> => {
    const { data } = await api.put(`/finance/goals/${id}`, goalData);
    return data;
  },

  addContribution: async (
    goalId: string,
    data: { value: number; date?: string; observation?: string; personId?: string },
  ) => {
    const { data: res } = await api.post(`/finance/goals/${goalId}/contributions`, data);
    return res;
  },

  deleteGoal: async (id: string): Promise<void> => {
    await api.delete(`/finance/goals/${id}`);
  },
  getBudgets: async (month?: number, year?: number): Promise<Budget[]> => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());

    const { data } = await api.get(`/finance/budgets?${params.toString()}`);
    return data;
  },

  getBudget: async (id: string): Promise<Budget> => {
    const { data } = await api.get(`/finance/budgets/${id}`);
    return data;
  },

  createBudget: async (budgetData: Partial<BudgetFormData>): Promise<Budget> => {
    const { data } = await api.post('/finance/budgets', budgetData);
    return data;
  },

  updateBudget: async (id: string, budgetData: Partial<BudgetFormData>): Promise<Budget> => {
    const { data } = await api.put(`/finance/budgets/${id}`, budgetData);
    return data;
  },

  deleteBudget: async (id: string): Promise<void> => {
    await api.delete(`/finance/budgets/${id}`);
  },

  getCreditCards: async (): Promise<CreditCard[]> => {
    const { data } = await api.get('/finance/credit-cards');
    return data;
  },

  getCreditCard: async (id: string): Promise<CreditCard> => {
    const { data } = await api.get(`/finance/credit-cards/${id}`);
    return data;
  },

  createCreditCard: async (cardData: Partial<CreditCardFormData>): Promise<CreditCard> => {
    const { data } = await api.post('/finance/credit-cards', cardData);
    return data;
  },

  updateCreditCard: async (
    id: string,
    cardData: Partial<CreditCardFormData>,
  ): Promise<CreditCard> => {
    const { data } = await api.put(`/finance/credit-cards/${id}`, cardData);
    return data;
  },

  deleteCreditCard: async (id: string): Promise<void> => {
    await api.delete(`/finance/credit-cards/${id}`);
  },
};
