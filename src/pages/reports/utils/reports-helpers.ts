import type {
  SummaryData,
  MonthlyData,
  CategoryExpense,
  PersonExpense,
  RecurringExpense,
} from '../types/reports.types';

const MONTH_NAMES = [
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

const CATEGORY_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-gray-500',
];

export function transformToMonthlyData(summaries: SummaryData[]): MonthlyData[] {
  return summaries
    .filter((summary) => !!summary)
    .map((summary) => ({
      month: MONTH_NAMES[summary.month - 1],
      income: summary.totals.incomes,
      expense: summary.totals.expenses,
      balance: summary.totals.balance,
    }));
}

export function transformToCategoryExpenses(summary: SummaryData): CategoryExpense[] {
  if (!summary || !summary.details || !summary.details.expenses) {
    return [];
  }

  const categoryMap = new Map<string, number>();

  summary.details.expenses.forEach((expense: any) => {
    const categoryName = expense.category?.name || expense.categoryName || 'Outros';
    const currentValue = categoryMap.get(categoryName) || 0;
    categoryMap.set(categoryName, currentValue + expense.value);
  });

  const totalExpenses = summary.totals.expenses;
  const categories: CategoryExpense[] = [];

  categoryMap.forEach((value, name) => {
    categories.push({
      name,
      value,
      percentage: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0,
      color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
    });
  });

  return categories.sort((a, b) => b.value - a.value);
}

export function transformToPersonExpenses(summary: SummaryData): PersonExpense[] {
  if (!summary || !summary.perPerson || summary.perPerson.length === 0) {
    return [];
  }

  const totalExpenses = summary.totals.expenses;

  return summary.perPerson.map((person) => ({
    id: person.id,
    name: person.name,
    total: person.expenses,
    percentage: totalExpenses > 0 ? Math.round((person.expenses / totalExpenses) * 100) : 0,
  }));
}

export function transformToRecurringExpenses(summary: SummaryData): RecurringExpense[] {
  if (!summary || !summary.details || !summary.details.expenses) {
    return [];
  }

  const recurringExpenses = summary.details.expenses.filter(
    (expense: any) => expense.type === 'fixed' || expense.recurringId,
  );

  return recurringExpenses.map((expense: any) => ({
    id: expense.id,
    description: expense.description,
    value: expense.value,
    dueDay: expense.date ? new Date(expense.date).getDate() : undefined,
    status: expense.status === 'PAID' ? 'paid' : 'pending',
  }));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-success-600';
  if (score >= 60) return 'text-warning-600';
  return 'text-danger-600';
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Regular';
  return 'Atenção';
}
