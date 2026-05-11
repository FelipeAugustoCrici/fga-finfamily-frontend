import { useSearchParams } from 'react-router-dom';

interface UseUrlFiltersOptions {
  defaultMonth?: number;
  defaultYear?: number;
  defaultSearch?: string;
  defaultStatus?: string;
  defaultPage?: number;
}

export function useUrlFilters(options: UseUrlFiltersOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const now = new Date();

  const defaults = {
    month: options.defaultMonth ?? now.getMonth() + 1,
    year: options.defaultYear ?? now.getFullYear(),
    search: options.defaultSearch ?? '',
    status: options.defaultStatus ?? 'ALL',
    page: options.defaultPage ?? 1,
  };

  const month = parseInt(searchParams.get('month') || String(defaults.month));
  const year = parseInt(searchParams.get('year') || String(defaults.year));
  const search = searchParams.get('search') || defaults.search;
  const status = searchParams.get('status') || defaults.status;
  const page = parseInt(searchParams.get('page') || String(defaults.page));

  const updateParams = (updates: Record<string, string | number>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      const stringValue = String(value);

      if (
        stringValue === '' ||
        stringValue === 'ALL' ||
        (key === 'page' && stringValue === '1') ||
        (key === 'month' &&
          parseInt(stringValue) === defaults.month &&
          !searchParams.has('year')) ||
        (key === 'year' && parseInt(stringValue) === defaults.year && !searchParams.has('month'))
      ) {
        newParams.delete(key);
      } else {
        newParams.set(key, stringValue);
      }
    });

    setSearchParams(newParams);
  };

  const setMonth = (value: number) => updateParams({ month: value, page: 1 });
  const setYear = (value: number) => updateParams({ year: value, page: 1 });
  const setSearch = (value: string) => updateParams({ search: value, page: 1 });
  const setStatus = (value: string) => updateParams({ status: value, page: 1 });
  const setPage = (value: number) => updateParams({ page: value });

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return {
    month,
    year,
    search,
    status,
    page,
    setMonth,
    setYear,
    setSearch,
    setStatus,
    setPage,
    resetFilters,
  };
}
