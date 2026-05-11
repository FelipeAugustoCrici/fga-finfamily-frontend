import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api.service';

export function useRecord(id?: string) {
  return useQuery({
    queryKey: ['record', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const { data } = await api.get(`/finance/expenses/${id}`);
        return { ...data, recordType: 'expense' };
      } catch {
        try {
          const { data } = await api.get(`/finance/incomes/${id}`);
          return { ...data, recordType: 'salary' };
        } catch {
          try {
            const { data } = await api.get(`/finance/extras/${id}`);
            return { ...data, recordType: 'income' };
          } catch {
            throw new Error('Registro não encontrado');
          }
        }
      }
    },
    enabled: !!id,
  });
}
