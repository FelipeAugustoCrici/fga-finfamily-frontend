import { api } from '@/services/api.service';

export const telegramService = {
  async generateCode(): Promise<{ code: string; expiresInMinutes: number }> {
    const res = await api.post('/telegram/link/code');
    return res.data;
  },

  async getLinkStatus(): Promise<{ linked: boolean; username: string | null }> {
    const res = await api.get('/telegram/link/status');
    return res.data;
  },

  async unlink(): Promise<void> {
    await api.delete('/telegram/link');
  },
};
