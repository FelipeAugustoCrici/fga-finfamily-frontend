import { Card } from '@/components/ui/Card';
import type { RecurringExpense } from '../types/reports.types';
import { formatCurrency } from '../utils/reports-helpers';

interface RecurringExpensesListProps {
  data: RecurringExpense[];
}

export function RecurringExpensesList({ data }: RecurringExpensesListProps) {
  const totalRecurring = data.reduce((acc, expense) => acc + expense.value, 0);
  const totalPending = data
    .filter((e) => e.status === 'pending')
    .reduce((acc, expense) => acc + expense.value, 0);

  if (data.length === 0) {
    return (
      <Card title="Despesas Recorrentes">
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma despesa recorrente registrada</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Despesas Recorrentes">
      <div className="space-y-3">
        {data.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  expense.status === 'paid' ? 'bg-success-500' : 'bg-warning-500'
                }`}
              />
              <div>
                <p className="font-semibold text-primary-800">{expense.description}</p>
                {expense.dueDay && (
                  <p className="text-xs text-primary-500">Vencimento dia {expense.dueDay}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary-800 font-mono">{formatCurrency(expense.value)}</p>
              <p
                className={`text-xs ${
                  expense.status === 'paid' ? 'text-success-600' : 'text-warning-600'
                }`}
              >
                {expense.status === 'paid' ? 'Pago' : 'Pendente'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-primary-100 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-primary-500 mb-1">Total Recorrente</p>
          <p className="text-xl font-bold text-primary-800 font-mono">{formatCurrency(totalRecurring)}</p>
        </div>
        <div>
          <p className="text-xs text-primary-500 mb-1">Pendentes</p>
          <p className="text-xl font-bold text-warning-600 font-mono">{formatCurrency(totalPending)}</p>
        </div>
      </div>
    </Card>
  );
}
