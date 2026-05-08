import { api } from '@/services/api.service';
import { Family, CreateFamilyDTO, UpdateFamilyDTO } from '../types/family.types';

export const familyService = {
  async list(): Promise<Family[]> {
    const { data } = await api.get('/finance/families');
    return data;
  },

  async getById(id: string): Promise<Family> {
    const { data } = await api.get(`/finance/families/${id}`);
    return data;
  },

  async create(data: CreateFamilyDTO): Promise<Family> {
    const response = await api.post('/finance/families', data);
    return response.data;
  },

  async update(id: string, data: UpdateFamilyDTO): Promise<Family> {
    const response = await api.put(`/finance/families/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/finance/families/${id}`);
  },

  async createMember(familyId: string, data: {
    name: string;
    email?: string;
    phone?: string;
    hasAccess?: boolean;
    temporaryPassword?: string;
  }): Promise<void> {
    await api.post('/finance/persons', { ...data, familyId });
  },

  async deleteMember(memberId: string): Promise<void> {
    await api.delete(`/finance/persons/${memberId}`);
  },

  async resendInvite(memberId: string): Promise<void> {
    await api.post(`/finance/persons/${memberId}/resend-invite`);
  },
};
