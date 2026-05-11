import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PiggyBank, Trash2, AlertCircle } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useDeleteBudget } from '../hooks/useDeleteBudget';
import { Modal } from '@/components/ui/Modal';

export function BudgetsCard({ onCreateNew }: { onCreateNew: () => void }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: budgets = [], isLoading } = useBudgets(currentMonth, currentYear);
  const deleteBudget = useDeleteBudget();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setSelectedBudgetId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBudgetId) {
      deleteBudget.mutate(selectedBudgetId);
      setDeleteModalOpen(false);
      setSelectedBudgetId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card title="Orçamentos por Categoria">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={72} borderRadius={12} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card title="Orçamentos por Categoria">
        <div className="space-y-4">
          <Button onClick={onCreateNew} className="w-full" variant="secondary">
            <PiggyBank size={18} className="mr-2" />
            Novo Orçamento
          </Button>

          {budgets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <PiggyBank size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nenhum orçamento definido</p>
              <p className="text-sm mt-1">Defina limites para suas categorias!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <div key={budget.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {budget.category?.name || budget.categoryName}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Limite: {formatCurrency(budget.limitValue)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {budget.month}/{budget.year}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Os orçamentos ajudam a controlar gastos por categoria. Configure alertas quando
                atingir o limite!
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este orçamento?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmDelete}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </>
  );
}
