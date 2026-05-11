import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreditCard as CreditCardIcon, Trash2, Calendar, Eye, Plus } from 'lucide-react';
import { useCreditCards, useDeleteCreditCard } from '@/pages/credit-cards/hooks/useCreditCards';
import { Modal } from '@/components/ui/Modal';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api.service';
import { CreditCardFormModal } from '@/pages/credit-cards/components/CreditCardFormModal';

export function CreditCardsCard({ onCreateNew: _onCreateNew }: { onCreateNew: () => void }) {
  const navigate = useNavigate();
  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data } = await api.get('/finance/families');
      return data;
    },
  });
  const familyId = families[0]?.id;

  const { data: cards = [], isLoading } = useCreditCards(familyId);
  const deleteCard = useDeleteCreditCard();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardFormOpen, setCardFormOpen] = useState(false);

  const handleDelete = (id: string) => {
    setSelectedCardId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCardId) {
      deleteCard.mutate(selectedCardId);
      setDeleteModalOpen(false);
      setSelectedCardId(null);
    }
  };

  const fmt = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (isLoading) {
    return (
      <Card title="Cartões de Crédito">
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      </Card>
    );
  }

  return (
    <>
      <Card title="Cartões de Crédito">
        <div className="space-y-4">
          <Button onClick={() => setCardFormOpen(true)} className="w-full" variant="ghost">
            <Plus size={18} className="mr-2" /> Novo Cartão
          </Button>

          {cards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCardIcon size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nenhum cartão cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => {
                const usedAmount = card.limitAmount - card.availableLimit;
                const usedPercent =
                  card.limitAmount > 0 ? (usedAmount / card.limitAmount) * 100 : 0;
                return (
                  <div
                    key={card.id}
                    className="p-4 rounded-lg border border-primary-100 bg-primary-50/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: card.color || '#334155' }}
                        />
                        <div>
                          <h4 className="font-semibold text-primary-800 text-sm">{card.name}</h4>
                          {card.bank && <p className="text-xs text-primary-400">{card.bank}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/credit-cards/${card.id}`)}
                          className="text-primary-400 hover:text-primary-700 p-1"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="text-primary-400 hover:text-danger-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between text-xs text-primary-500">
                        <span>
                          Disponível:{' '}
                          <span className="font-medium text-success-600">
                            {fmt(card.availableLimit)}
                          </span>
                        </span>
                        <span>{usedPercent.toFixed(0)}% usado</span>
                      </div>
                      <div className="w-full bg-primary-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${usedPercent > 80 ? 'bg-danger-500' : usedPercent > 60 ? 'bg-amber-400' : 'bg-success-500'}`}
                          style={{ width: `${usedPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs text-primary-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> Fecha {card.closingDay}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> Vence {card.dueDay}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <CreditCardFormModal
        isOpen={cardFormOpen}
        onClose={() => setCardFormOpen(false)}
        familyId={familyId}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <p className="text-gray-600 mb-6">Tem certeza que deseja remover este cartão?</p>
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
