import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { categoryService } from '../services/categories.service';
import { CategoryFormData } from '../schemas/category.schema';

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-paginated'] });
      showToast({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso!',
        variant: 'success',
      });
    },
    onError: () => {
      showToast({
        title: 'Erro',
        description: 'Erro ao atualizar categoria',
        variant: 'error',
      });
    },
  });
}
