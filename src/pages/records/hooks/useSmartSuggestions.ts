import { useMemo } from 'react';
import type { HistoryEntry } from './useRecordHistory';
import { parseSmartInput } from './useSmartParser';

export interface Suggestion {
  description: string;
  value: number;
  valueLabel: string;
  category: string;
  categoryId: string;
  type: 'expense' | 'salary' | 'income';
  source: 'history' | 'pattern';
  count: number;
  isRecurring: boolean;
  avgValue: number;
  recentValues: number[];
  lastDate: string;
}

const MONTHS_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${MONTHS_PT[d.getMonth()]}/${d.getFullYear()}`;
}

export function useSmartSuggestions(
  query: string,
  historyIndex: Record<string, HistoryEntry>,
  categories: any[],
): Suggestion[] {
  return useMemo(() => {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    const results: Suggestion[] = [];
    const seen = new Set<string>();

    // 1. History matches — fuzzy search on description
    for (const [key, entry] of Object.entries(historyIndex)) {
      if (!key.includes(q) && !q.includes(key.split(' ')[0])) continue;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        description: entry.description,
        value: entry.lastValue,
        valueLabel: `Último: R$ ${entry.lastValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        category: entry.category,
        categoryId: entry.categoryId,
        type: entry.type,
        source: 'history',
        count: entry.count,
        isRecurring: entry.isRecurring,
        avgValue: entry.avgValue,
        recentValues: entry.values.slice(-3),
        lastDate: entry.lastDate,
      });
    }

    // 2. Pattern-based fallback if no history
    if (results.length === 0) {
      const parsed = parseSmartInput(query);
      if (parsed?.suggestedCategoryName) {
        const catMatch = categories.find(
          (c) => c.name.toLowerCase() === parsed.suggestedCategoryName.toLowerCase(),
        );
        results.push({
          description: parsed.description,
          value: parsed.value ? parseFloat(parsed.value) : 0,
          valueLabel: parsed.value
            ? `R$ ${Number(parsed.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : '',
          category: parsed.suggestedCategoryName,
          categoryId: catMatch?.id || '',
          type: parsed.type,
          source: 'pattern',
          count: 0,
          isRecurring: false,
          avgValue: 0,
          recentValues: [],
          lastDate: '',
        });
      }
    }

    // Sort: history first, then by count desc
    return results
      .sort((a, b) => {
        if (a.source === 'history' && b.source !== 'history') return -1;
        if (b.source === 'history' && a.source !== 'history') return 1;
        return b.count - a.count;
      })
      .slice(0, 5);
  }, [query, historyIndex, categories]);
}

export function detectValueAlert(
  value: number,
  description: string,
  historyIndex: Record<string, HistoryEntry>,
): string | null {
  const key = description.toLowerCase().trim();
  const entry = historyIndex[key];
  if (!entry || entry.avgValue === 0 || value === 0) return null;

  const ratio = value / entry.avgValue;
  if (ratio > 1.5) {
    return `Valor ${((ratio - 1) * 100).toFixed(0)}% acima da sua média (R$ ${entry.avgValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
  }
  return null;
}

export function detectRecurrenceSuggestion(
  description: string,
  historyIndex: Record<string, HistoryEntry>,
): boolean {
  const key = description.toLowerCase().trim();
  const entry = historyIndex[key];
  if (!entry) return false;
  return entry.count >= 2 && !entry.isRecurring;
}
