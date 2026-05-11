import { ChevronLeft, ChevronRight, Moon, Sun, Sparkles } from 'lucide-react';
import { useUserInfo, useUserFamily } from '@/hooks/useUserInfo';
import { useTheme } from '@/hooks/useTheme';
import { useTokens } from '@/hooks/useTokens';

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export interface PageHeaderProps {
  actions?: React.ReactNode;

  showPeriod?: boolean;
  month?: number;
  year?: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export function PageHeader({
  actions,
  showPeriod = false,
  month,
  year,
  onPrevMonth,
  onNextMonth,
}: PageHeaderProps) {
  const { data: userInfo } = useUserInfo();
  const { data: family } = useUserFamily();
  const { isDark, toggle } = useTheme();
  const t = useTokens();

  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-2"
      style={{ borderBottom: `1px solid ${t.border.divider}` }}
    >
      {}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-primary-900/20">
            {userInfo?.initials || '?'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: t.text.primary }}>
            {getGreeting()}, {userInfo?.name?.split(' ')[0] || 'Usuário'} 👋
          </h1>
          <p className="text-xs capitalize" style={{ color: t.text.muted }}>
            {dateStr}
          </p>
        </div>
      </div>

      {}
      <div className="flex items-center gap-2 flex-wrap">
        {family && (
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: t.bg.card,
              border: `1px solid ${t.border.default}`,
            }}
          >
            <Sparkles size={13} style={{ color: t.text.muted }} />
            <span className="text-xs font-semibold" style={{ color: t.text.secondary }}>
              {family.name}
            </span>
          </div>
        )}

        <button
          onClick={toggle}
          className="p-2.5 rounded-xl border transition-colors"
          style={{
            backgroundColor: isDark ? 'rgba(110,231,183,0.12)' : '#ecfdf5',
            borderColor: isDark ? 'rgba(110,231,183,0.2)' : '#d1fae5',
            color: isDark ? '#6ee7b7' : '#059669',
          }}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {showPeriod && month !== undefined && year !== undefined && (
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{
              background: t.bg.card,
              border: `1px solid ${t.border.default}`,
            }}
          >
            <button
              onClick={onPrevMonth}
              className="p-2 transition-colors"
              style={{ color: t.text.muted }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.muted)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="px-3 py-2 text-xs font-bold min-w-32 text-center capitalize"
              style={{ color: t.text.primary }}
            >
              {MONTHS[month - 1]} {year}
            </span>
            <button
              onClick={onNextMonth}
              className="p-2 transition-colors"
              style={{ color: t.text.muted }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.muted)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
