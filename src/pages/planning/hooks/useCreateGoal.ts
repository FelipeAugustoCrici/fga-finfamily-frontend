import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { planningService } from '../services/planning.service';
import type { GoalFormData } from '../types/planning.types';

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: GoalFormData) => {
      const payload = {
        ...data,
        targetValue: Number(data.targetValue),
      };
      return planningService.createGoal(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      showToast({
        title: 'Sucesso',
        description: 'Meta criada com sucesso!',
        variant: 'success',
      });
    },
    onError: () => {
      showToast({
        title: 'Erro',
        description: 'Erro ao criar meta',
        variant: 'error',
      });
    },
  });
}
