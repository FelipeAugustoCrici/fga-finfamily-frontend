import { api } from '@/services/api.service';
import { CoupleModeConfig, CoupleModeResult, ExpenseAdjustment } from '../types/couple-mode.types';

export const coupleModeService = {
  async getConfig(familyId: string): Promise<CoupleModeConfig | null> {
    const { data } = await api.get(`/finance/couple-mode/config/${familyId}`);
    return data;
  },

  async saveConfig(payload: Omit<CoupleModeConfig, 'id'>): Promise<CoupleModeConfig> {
    const { data } = await api.post('/finance/couple-mode/config', payload);
    return data;
  },

  async getResult(familyId: string, month: number, year: number): Promise<CoupleModeResult | null> {
    const { data } = await api.get('/finance/couple-mode/result', {
      params: { familyId, month, year },
    });
    return data;
  },

  async createAdjustment(payload: {
    familyId: string;
    fromPersonId: string;
    toPersonId: string;
    amount: number;
    description?: string;
    month: number;
    year: number;
  }): Promise<ExpenseAdjustment> {
    const { data } = await api.post('/finance/couple-mode/adjustment', payload);
    return data;
  },

  async listAdjustments(
    familyId: string,
    month: number,
    year: number,
  ): Promise<ExpenseAdjustment[]> {
    const { data } = await api.get('/finance/couple-mode/adjustments', {
      params: { familyId, month, year },
    });
    return data;
  },

  async deleteAdjustment(id: string): Promise<void> {
    await api.delete(`/finance/couple-mode/adjustment/${id}`);
  },
};
