import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api.service';
import { RecordsResumoParams, RecordsResumoResponse } from '../types/records-resumo.types';

async function fetchResumo(params: RecordsResumoParams): Promise<RecordsResumoResponse> {
  const { mes, ano, familiaId, responsavelId, categoriaId, status } = params;

  const query = new URLSearchParams({
    mes: String(mes),
    ano: String(ano),
    familiaId: familiaId!,
    ...(responsavelId ? { responsavelId } : {}),
    ...(categoriaId ? { categoriaId } : {}),
    ...(status && status !== 'ALL' ? { status } : {}),
  });

  const { data } = await api.get<RecordsResumoResponse>(`/finance/resumo?${query}`);
  return data;
}

export function useRecordsResumo(params: RecordsResumoParams) {
  const { mes, ano, familiaId, responsavelId, categoriaId, status } = params;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['records-resumo', mes, ano, familiaId, responsavelId, categoriaId, status],
    queryFn: () => fetchResumo(params),
    enabled: !!familiaId,
    staleTime: 1000 * 60,
  });

  return { data, isLoading, isError };
}
