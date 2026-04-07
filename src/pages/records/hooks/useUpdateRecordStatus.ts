import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordService } from '../services/records.service';
import { RecordStatus } from '../types/record.types';

export function useUpdateRecordStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecordStatus }) =>
      recordService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
