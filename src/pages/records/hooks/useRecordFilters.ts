import { useSearchParams } from 'react-router-dom';
import { RecordStatus } from '../types/record.types';

export type Ordenacao = 'recente' | 'antigo' | 'maior_valor' | 'menor_valor' | 'az' | 'za';

export function useRecordFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const now = new Date();

  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();

  const month    = parseInt(searchParams.get('month')    || String(defaultMonth));
  const year     = parseInt(searchParams.get('year')     || String(defaultYear));
  const search   = searchParams.get('search')   || '';
  const status   = (searchParams.get('status')  || 'ALL') as RecordStatus | 'ALL';
  const page     = parseInt(searchParams.get('page')     || '1');
  const categoryId  = searchParams.get('categoryId')  || '';
  const personId    = searchParams.get('personId')    || '';
  const tipo        = searchParams.get('tipo')        || '';
  const valorMin    = searchParams.get('valorMin')    || '';
  const valorMax    = searchParams.get('valorMax')    || '';
  const dataInicio  = searchParams.get('dataInicio')  || '';
  const dataFim     = searchParams.get('dataFim')     || '';
  const ordenacao   = (searchParams.get('ordenacao')  || 'recente') as Ordenacao;

  const update = (updates: Record<string, string | number>) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      const v = String(value);
      if (!v || v === 'ALL' || v === 'recente' || (key === 'page' && v === '1')) {
        p.delete(key);
      } else {
        p.set(key, v);
      }
    });
    setSearchParams(p);
  };

  const activeCount = [categoryId, personId, tipo, valorMin, valorMax, dataInicio, dataFim]
    .filter(Boolean).length + (status !== 'ALL' ? 1 : 0);

  const resetFilters = () => setSearchParams(new URLSearchParams());

  const setMultiple = (updates: Record<string, string>) => {
    update(updates);
  };

  return {
    // período
    month, year,
    setMonth: (v: number) => update({ month: v, page: 1 }),
    setYear:  (v: number) => update({ year: v,  page: 1 }),
    // busca
    search,
    setSearch: (v: string) => update({ search: v, page: 1 }),
    // status
    status,
    setStatus: (v: RecordStatus | 'ALL') => update({ status: v, page: 1 }),
    // avançados
    categoryId,  setCategoryId:  (v: string) => update({ categoryId: v,  page: 1 }),
    personId,    setPersonId:    (v: string) => update({ personId: v,    page: 1 }),
    tipo,        setTipo:        (v: string) => update({ tipo: v,        page: 1 }),
    valorMin,    setValorMin:    (v: string) => update({ valorMin: v,    page: 1 }),
    valorMax,    setValorMax:    (v: string) => update({ valorMax: v,    page: 1 }),
    dataInicio,  setDataInicio:  (v: string) => update({ dataInicio: v,  page: 1 }),
    dataFim,     setDataFim:     (v: string) => update({ dataFim: v,     page: 1 }),
    ordenacao,   setOrdenacao:   (v: Ordenacao) => update({ ordenacao: v }),
    // paginação
    page,
    setPage: (v: number) => update({ page: v }),
    // utilitários
    activeCount,
    resetFilters,
    setMultiple,
  };
}
