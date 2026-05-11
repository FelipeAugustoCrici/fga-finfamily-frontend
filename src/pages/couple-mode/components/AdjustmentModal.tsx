import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCreateAdjustment } from '../hooks/useCoupleMode';
import { AdjustmentSuggestion } from '../types/couple-mode.types';
import { FamilyMember } from '@/pages/families/types/family.types';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  month: number;
  year: number;
  suggestion?: AdjustmentSuggestion;
  members: FamilyMember[];
}

export function AdjustmentModal({
  isOpen,
  onClose,
  familyId,
  month,
  year,
  suggestion,
  members,
}: Props) {
  const create = useCreateAdjustment();
  const [amount, setAmount] = useState(suggestion ? String(suggestion.amount) : '');
  const [description, setDescription] = useState('Ajuste de contas');

  const fromName = members.find((m) => m.id === suggestion?.fromPersonId)?.name ?? '';
  const toName = members.find((m) => m.id === suggestion?.toPersonId)?.name ?? '';

  const handleConfirm = () => {
    if (!suggestion) return;
    create.mutate(
      {
        familyId,
        fromPersonId: suggestion.fromPersonId,
        toPersonId: suggestion.toPersonId,
        amount: Number(amount),
        description,
        month,
        year,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar ajuste" size="sm">
      <div className="space-y-4">
        <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-sm text-sky-800">
          Para equilibrar, <strong>{fromName}</strong> pode contribuir com{' '}
          <strong>{fmt(suggestion?.amount ?? 0)}</strong> para <strong>{toName}</strong>.
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Valor</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Descrição</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={create.isPending}>
            {create.isPending ? 'Registrando...' : 'Confirmar ajuste'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
