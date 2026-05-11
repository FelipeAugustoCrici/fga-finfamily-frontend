import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coupleModeService } from '../services/couple-mode.service';
import { CoupleModeConfig } from '../types/couple-mode.types';

export function useCoupleModeConfig(familyId?: string) {
  return useQuery({
    queryKey: ['couple-mode-config', familyId],
    queryFn: () => coupleModeService.getConfig(familyId!),
    enabled: !!familyId,
  });
}

export function useCoupleModeResult(familyId?: string, month?: number, year?: number) {
  return useQuery({
    queryKey: ['couple-mode-result', familyId, month, year],
    queryFn: () => coupleModeService.getResult(familyId!, month!, year!),
    enabled: !!familyId && !!month && !!year,
    placeholderData: undefined,
  });
}

export function useSaveCoupleModeConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CoupleModeConfig, 'id'>) => coupleModeService.saveConfig(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['couple-mode-config', vars.familyId] });
      qc.invalidateQueries({ queryKey: ['couple-mode-result'] });
    },
  });
}

export function useCreateAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coupleModeService.createAdjustment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['couple-mode-result'] });
    },
  });
}

export function useDeleteAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coupleModeService.deleteAdjustment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['couple-mode-result'] });
    },
  });
}
