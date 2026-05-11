import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { MessageSquare } from 'lucide-react';
import { useAddContribution } from '../hooks/useAddContribution';
import { useUserFamily } from '@/hooks/useUserInfo';
import { useQuery } from '@tanstack/react-query';
import { familyService } from '@/pages/families/services/families.service';
import { fmt } from './goalUtils';
import type { Goal } from '../types/planning.types';
import moment from 'moment';

interface Props {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalContributionModal({ goal, isOpen, onClose }: Props) {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [observation, setObservation] = useState('');
  const addContribution = useAddContribution();

  const { data: family } = useUserFamily();
  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: () => familyService.list(),
  });
  const members: { id: string; name: string }[] = families.flatMap((f: any) => f.members ?? []);
  const personId = goal.personId ?? members[0]?.id ?? family?.id;

  const remaining = goal.targetValue - goal.currentValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value.replace(',', '.'));
    if (!num || num <= 0) return;
    addContribution.mutate(
      { goalId: goal.id, value: num, date, observation: observation || undefined, personId },
      {
        onSuccess: () => {
          setValue('');
          setObservation('');
          onClose();
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contribuir — ${goal.description}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
          Faltam <span className="font-semibold text-slate-800">{fmt(Math.max(remaining, 0))}</span>{' '}
          para atingir a meta
          <span className="block text-xs text-slate-400 mt-1">
            O valor será descontado do seu saldo automaticamente.
          </span>
        </div>

        <CurrencyInput
          label="Valor (R$)"
          placeholder="0,00"
          value={value}
          onChange={(v) => setValue(v)}
        />

        <DatePicker label="Data" value={date} onChange={(v) => setDate(v)} />

        <Input
          label="Observação (opcional)"
          placeholder="Ex: Economizado no mês"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          icon={<MessageSquare size={16} className="text-primary-400" />}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={addContribution.isPending}>
            {addContribution.isPending ? 'Salvando...' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
