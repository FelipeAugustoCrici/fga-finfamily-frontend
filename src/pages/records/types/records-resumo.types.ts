export interface ResumoMetrica {
  valor: number;
  quantidade: number;
}

export interface ResumoMetricaComVariacao extends ResumoMetrica {
  percentual?: number;
  variacao?: number;
}

export interface ResumoResponsavel {
  id: string;
  nome: string;
  entradas: number;
  saidas: number;
}

export interface RecordsResumoResponse {
  totalPago: ResumoMetricaComVariacao;
  totalPendente: ResumoMetrica;
  totalAtrasado: ResumoMetrica;
  entradas: number;
  saidas: number;
  saldoLiquido: number;
  recorrentes: { valor: number };
  responsaveis: ResumoResponsavel[];
}

export interface RecordsResumoParams {
  mes: number;
  ano: number;
  familiaId?: string;
  responsavelId?: string;
  categoriaId?: string;
  status?: string;
}
