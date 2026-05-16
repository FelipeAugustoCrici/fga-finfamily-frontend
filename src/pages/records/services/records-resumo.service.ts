import { api } from '@/services/api.service';
import { RecordsResumoParams, RecordsResumoResponse } from '../types/records-resumo.types';

export const recordsResumoService = {
  async getResumo(params: RecordsResumoParams): Promise<RecordsResumoResponse> {
    const p = new URLSearchParams();
    p.append('mes', params.mes.toString());
    p.append('ano', params.ano.toString());
    if (params.familiaId) p.append('familiaId', params.familiaId);
    if (params.responsavelId) p.append('responsavelId', params.responsavelId);
    if (params.categoriaId) p.append('categoriaId', params.categoriaId);
    if (params.status && params.status !== 'ALL') p.append('status', params.status);

    const { data } = await api.get<RecordsResumoResponse>(
      `/finance/expenses/resumo?${p.toString()}`,
    );
    return data;
  },
};
