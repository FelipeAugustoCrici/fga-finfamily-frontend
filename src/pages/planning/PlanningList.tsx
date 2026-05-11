import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoalsCard, BudgetsCard, CreditCardsCard } from './components';
import { GoalFormModal, BudgetFormModal, CreditCardFormModal } from './components';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/services/api.service';

export function PlanningList() {
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data } = await api.get('/finance/families');
      return data;
    },
  });

  const familyId = families[0]?.id || '';

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GoalsCard onCreateNew={() => setGoalModalOpen(true)} />
        <BudgetsCard onCreateNew={() => setBudgetModalOpen(true)} />
        <CreditCardsCard onCreateNew={() => setCardModalOpen(true)} />
      </div>

      <GoalFormModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        familyId={familyId}
      />

      <BudgetFormModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        familyId={familyId}
      />

      <CreditCardFormModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        familyId={familyId}
      />
    </div>
  );
}
