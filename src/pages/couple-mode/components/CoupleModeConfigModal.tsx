import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Settings2, Users } from 'lucide-react';
import { useSaveCoupleModeConfig } from '../hooks/useCoupleMode';
import { CoupleModeConfig, SplitType } from '../types/couple-mode.types';
import { FamilyMember } from '@/pages/families/types/family.types';
import { financeService } from '@/services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  members: FamilyMember[];
  config: CoupleModeConfig | null | undefined;
  month: number;
  year: number;
}

const SPLIT_LABELS: Record<SplitType, string> = {
  equal: 'Divisão igual (50/50)',
  proportional: 'Proporcional à renda',
  custom: 'Personalizada',
};

export function CoupleModeConfigModal({
  isOpen,
  onClose,
  familyId,
  members,
  config,
  month,
  year,
}: Props) {
  const save = useSaveCoupleModeConfig();

  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selected, setSelected] = useState<string[]>([]);
  const [incomes, setIncomes] = useState<Record<string, string>>({});
  const [proportions, setProportions] = useState<Record<string, string>>({});

  const { data: currentIncomes = [] } = useQuery({
    queryKey: ['incomes-for-couple-config', month, year, familyId],
    queryFn: () => financeService.getIncomes(month, year, familyId),
    enabled: !!familyId && isOpen,
  });

  const incomeByPerson = useMemo(() => {
    const map: Record<string, number> = {};
    for (const inc of currentIncomes as any[]) {
      map[inc.personId] = (map[inc.personId] ?? 0) + inc.value;
    }
    return map;
  }, [currentIncomes]);

  useEffect(() => {
    if (!isOpen) {
      setSplitType('equal');
      setSelected([]);
      setIncomes({});
      setProportions({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!config) return;
    setSplitType(config.splitType);
    setSelected(config.participants.map((p) => p.personId));
    const prop: Record<string, string> = {};
    config.participants.forEach((p) => {
      if (p.proportion) prop[p.personId] = String(p.proportion);
    });
    setProportions(prop);
  }, [config]);

  useEffect(() => {
    if (!config) return;
    setIncomes(() => {
      const next: Record<string, string> = {};
      config.participants.forEach((p) => {
        const id = p.personId;
        if (incomeByPerson[id]) {
          next[id] = String(incomeByPerson[id]);
        } else if (p.income && p.income > 0) {
          next[id] = String(p.income);
        }
      });
      return next;
    });
  }, [config, incomeByPerson]);

  useEffect(() => {
    if (splitType !== 'proportional') return;
    setIncomes((prev) => {
      const next = { ...prev };
      for (const id of selected) {
        if (incomeByPerson[id]) {
          next[id] = String(incomeByPerson[id]);
        }
      }
      return next;
    });
  }, [splitType, selected, incomeByPerson]);

  const toggleMember = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = () => {
    const participants = selected.map((personId) => ({
      personId,
      income: incomes[personId] ? Number(incomes[personId]) : undefined,
      proportion: proportions[personId] ? Number(proportions[personId]) : undefined,
    }));
    save.mutate({ familyId, splitType, participants, isActive: true }, { onSuccess: onClose });
  };

  const incomesMissing =
    splitType === 'proportional' && selected.some((id) => !incomes[id] || Number(incomes[id]) <= 0);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Modo Casal" size="md">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Users size={15} /> Participantes
          </p>
          <div className="space-y-2">
            {members.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm font-medium text-slate-800">{m.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Settings2 size={15} /> Regra de divisão
          </p>
          <div className="space-y-2">
            {(Object.keys(SPLIT_LABELS) as SplitType[]).map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="radio"
                  name="splitType"
                  value={type}
                  checked={splitType === type}
                  onChange={() => setSplitType(type)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm font-medium text-slate-800">{SPLIT_LABELS[type]}</span>
              </label>
            ))}
          </div>
        </div>

        {splitType === 'proportional' && selected.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Renda mensal por pessoa</p>
            <p className="text-xs text-slate-400 mb-3">
              Valores pré-preenchidos com os rendimentos cadastrados no mês atual. Você pode ajustar
              manualmente.
            </p>
            <div className="space-y-2">
              {selected.map((id) => {
                const member = members.find((m) => m.id === id);
                const missing = !incomes[id] || Number(incomes[id]) <= 0;
                const systemIncome = incomeByPerson[id];

                return (
                  <div key={id} className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 w-32 truncate">{member?.name}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        value={
                          incomes[id]
                            ? Number(incomes[id]).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : ''
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          const num = raw ? (parseFloat(raw) / 100).toFixed(2) : '';
                          setIncomes((prev) => ({ ...prev, [id]: num }));
                        }}
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          missing ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {systemIncome && Number(incomes[id]) !== systemIncome && (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-slate-400">
                          Renda cadastrada: {fmt(systemIncome)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setIncomes((prev) => ({ ...prev, [id]: String(systemIncome) }))
                          }
                          className="text-xs text-primary-500 hover:text-primary-700 underline"
                        >
                          usar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {incomesMissing && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ Preencha a renda de todos os participantes para usar a divisão proporcional.
              </p>
            )}
          </div>
        )}

        {splitType === 'custom' && selected.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Porcentagem por pessoa</p>
            <div className="space-y-2">
              {selected.map((id) => {
                const member = members.find((m) => m.id === id);
                return (
                  <div key={id} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 w-32 truncate">{member?.name}</span>
                    <input
                      type="number"
                      placeholder="50"
                      min={0}
                      max={100}
                      value={proportions[id] ?? ''}
                      onChange={(e) =>
                        setProportions((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <span className="text-sm text-slate-400">%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={selected.length < 2 || save.isPending || incomesMissing}
          >
            {save.isPending ? 'Salvando...' : 'Salvar configuração'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
