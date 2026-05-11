import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Clock, TrendingUp } from 'lucide-react';
import {
  fmt,
  getBadge,
  getMotivation,
  getProgressBarColor,
  estimateMonths,
  GOAL_TYPE_META,
} from './goalUtils';
import type { Goal } from '../types/planning.types';
import moment from 'moment';

interface Props {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onContribute: () => void;
}

export function GoalDetailModal({ goal, isOpen, onClose, onContribute }: Props) {
  const pct = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const badge = getBadge(pct);
  const motivation = getMotivation(pct);
  const barColor = getProgressBarColor(pct);
  const meta = GOAL_TYPE_META[goal.type ?? 'savings'];
  const Icon = meta.icon;
  const remaining = Math.max(goal.targetValue - goal.currentValue, 0);

  const deadlineDays = goal.deadline ? moment(goal.deadline).diff(moment(), 'days') : null;

  const monthsEst = estimateMonths(remaining, goal.contributions ?? []);
  const monthlyNeeded = deadlineDays && deadlineDays > 0 ? remaining / (deadlineDays / 30) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhe da Meta">
      <div className="space-y-5">
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${meta.bg} ${meta.border}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg}`}>
            <Icon size={20} className={meta.color} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">{goal.description}</p>
            <p className={`text-xs font-medium ${meta.color}`}>{meta.label}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-3xl font-bold text-slate-800">{pct.toFixed(0)}%</span>
            <span className="text-sm text-slate-500">
              {fmt(goal.currentValue)} / {fmt(goal.targetValue)}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className={`bg-gradient-to-r ${barColor} h-full rounded-full transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 italic">{motivation}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500">Falta</p>
            <p className="font-semibold text-slate-800">{fmt(remaining)}</p>
          </div>
          {deadlineDays !== null && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={11} /> Prazo
              </p>
              <p className="font-semibold text-slate-800">
                {deadlineDays > 0 ? `${deadlineDays} dias` : 'Vencido'}
              </p>
            </div>
          )}
          {monthlyNeeded !== null && monthlyNeeded > 0 && (
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 col-span-2">
              <p className="text-xs text-sky-600 flex items-center gap-1">
                <TrendingUp size={11} /> Sugestão mensal
              </p>
              <p className="font-semibold text-sky-700">
                {fmt(monthlyNeeded)}/mês para bater o prazo
              </p>
            </div>
          )}
          {monthsEst !== null && monthsEst > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 col-span-2">
              <p className="text-xs text-amber-600">No ritmo atual</p>
              <p className="font-semibold text-amber-700">
                Atinge em ~{monthsEst} {monthsEst === 1 ? 'mês' : 'meses'}
              </p>
            </div>
          )}
        </div>

        {(goal.contributions?.length ?? 0) > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Histórico de contribuições</p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {goal.contributions.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <span className="text-slate-700 font-medium">{fmt(c.value)}</span>
                    {c.observation && (
                      <span className="text-slate-400 ml-2 text-xs">— {c.observation}</span>
                    )}
                  </div>
                  <span className="text-slate-400 text-xs">
                    {moment(c.date).format('DD/MM/YYYY')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {goal.status !== 'completed' && (
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              onClose();
              onContribute();
            }}
          >
            <PlusCircle size={16} className="mr-2" />
            Adicionar Contribuição
          </Button>
        )}
      </div>
    </Modal>
  );
}
