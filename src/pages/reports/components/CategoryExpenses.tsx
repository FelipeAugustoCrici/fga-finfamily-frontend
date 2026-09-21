import { Card } from '@/components/ui/Card';
import type { CategoryExpense } from '../types/reports.types';
import { formatCurrency } from '../utils/reports-helpers';

interface CategoryExpensesProps {
  data: CategoryExpense[];
  total: number;
}

export function CategoryExpenses({ data, total }: CategoryExpensesProps) {
  if (data.length === 0) {
    return (
      <Card title="Despesas por Categoria">
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma despesa registrada neste período</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Despesas por Categoria">
      <div className="space-y-3">
        {data.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <span className="font-medium text-primary-700">{category.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary-600 font-mono">{category.percentage}%</span>
                <span className="font-semibold text-primary-800 font-mono">
                  {formatCurrency(category.value)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${category.color}`}
                style={{ width: `${category.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-primary-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary-700">Total de Despesas</span>
          <span className="text-xl font-bold text-danger-600 font-mono">{formatCurrency(total)}</span>
        </div>
      </div>
    </Card>
  );
}
