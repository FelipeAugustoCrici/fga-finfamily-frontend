import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Moon, Sun } from 'lucide-react';
import { useUserInfo, useUserFamily } from '@/hooks/useUserInfo';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  month: number;
  year: number;
  setMonth: React.Dispatch<React.SetStateAction<number>>;
  setYear: React.Dispatch<React.SetStateAction<number>>;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function DashboardHeader({ month, year, setMonth, setYear }: Props) {
  const { data: userInfo } = useUserInfo();
  const { data: family } = useUserFamily();
  const { isDark, toggle } = useTheme();

  const handlePrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const handleNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-900/20">
            {userInfo?.initials || '?'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary-900">
            {getGreeting()}, {userInfo?.name?.split(' ')[0] || 'Felipe'} 👋
          </h1>
          <p className="text-sm text-primary-500 capitalize">{dateStr}</p>
        </div>
      </div>

      {}
      <div className="flex items-center gap-3">
        {}
        {family && (
          <div
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl shadow-soft"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <Sparkles size={14} className="text-primary-500" />
            <span className="text-sm font-semibold text-primary-700">{family.name}</span>
          </div>
        )}

        {}
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl border transition-colors"
          style={{
            backgroundColor: isDark ? 'rgba(110,231,183,0.12)' : '#ecfdf5',
            borderColor: isDark ? 'rgba(110,231,183,0.2)' : '#d1fae5',
            color: isDark ? '#6ee7b7' : '#059669',
            boxShadow: isDark ? '0 0 12px rgba(74,222,128,0.1)' : 'none',
          }}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {}
        <div
          className="flex items-center rounded-xl shadow-soft overflow-hidden"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <button
            onClick={handlePrev}
            className="p-2.5 text-primary-500 hover:bg-primary-50 hover:text-primary-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="px-4 py-2 min-w-36 text-center">
            <span className="text-sm font-bold text-primary-800 capitalize">
              {MONTHS[month - 1]} {year}
            </span>
          </div>
          <button
            onClick={handleNext}
            className="p-2.5 text-primary-500 hover:bg-primary-50 hover:text-primary-800 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
