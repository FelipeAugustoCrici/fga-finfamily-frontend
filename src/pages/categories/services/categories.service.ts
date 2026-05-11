import { api } from '@/services/api.service';
import type { Category, PaginatedCategories } from '../types/category.types';
import type { CategoryFormData } from '../schemas/category.schema';

export const categoryService = {
  async list(
    familyId?: string,
    type?: 'expense' | 'income',
    page = 1,
    limit = 10,
  ): Promise<PaginatedCategories> {
    const params = new URLSearchParams();
    if (familyId) params.set('familyId', familyId);
    if (type) params.set('type', type);
    params.set('page', String(page));
    params.set('limit', String(limit));
    const { data } = await api.get(`/finance/categories?${params.toString()}`);
    return data;
  },

  async getById(id: string): Promise<Category> {
    const { data } = await api.get(`/finance/categories/${id}`);
    return data;
  },

  async create(payload: CategoryFormData): Promise<Category> {
    const { data } = await api.post('/finance/categories', payload);
    return data;
  },

  async update(id: string, payload: CategoryFormData): Promise<Category> {
    const { data } = await api.put(`/finance/categories/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/finance/categories/${id}`);
  },
};

export const getCategories = (familyId?: string) => categoryService.list(familyId);
export const createCategory = categoryService.create;
