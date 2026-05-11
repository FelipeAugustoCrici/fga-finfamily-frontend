import { Card } from '@/components/ui/Card';
import { Users } from 'lucide-react';
import type { PersonExpense } from '../types/reports.types';
import { formatCurrency } from '../utils/reports-helpers';

interface PersonExpensesProps {
  data: PersonExpense[];
}

export function PersonExpenses({ data }: PersonExpensesProps) {
  if (data.length === 0) {
    return (
      <Card title="Despesas por Pessoa">
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum dado disponível</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Despesas por Pessoa">
      <div className="space-y-4">
        {data.map((person, _index) => (
          <div key={person.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Users size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-primary-800">{person.name}</p>
                  <p className="text-xs text-primary-500">{person.percentage}% do total</p>
                </div>
              </div>
              <span className="text-lg font-bold text-primary-800">
                {formatCurrency(person.total)}
              </span>
            </div>
            <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500" style={{ width: `${person.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-primary-100">
        <div className="bg-primary-50 p-4 rounded-lg">
          <p className="text-xs text-primary-600 mb-2">Distribuição de Gastos</p>
          <div className="flex h-4 rounded-full overflow-hidden">
            {data.map((person, index) => (
              <div
                key={person.id}
                className={`${index === 0 ? 'bg-primary-600' : 'bg-primary-400'}`}
                style={{ width: `${person.percentage}%` }}
                title={`${person.name}: ${person.percentage}%`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
