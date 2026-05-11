import { Users } from 'lucide-react';
import { cn } from '@/components/ui/Button';
import { useTokens } from '@/hooks/useTokens';
import { useTheme } from '@/hooks/useTheme';

type Person = {
  id: string;
  name: string;
  income: number;
  expenses: number;
  contributionPercent: number;
  proportionalExpense: number;
};

type Props = { perPerson: Person[] };

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const COLORS = [
  { bar: 'from-primary-500 to-primary-700', glow: 'rgba(99,102,241,0.3)' },
  { bar: 'from-blue-500 to-blue-700', glow: 'rgba(59,130,246,0.3)' },
  { bar: 'from-violet-500 to-violet-700', glow: 'rgba(139,92,246,0.3)' },
  { bar: 'from-amber-500 to-amber-700', glow: 'rgba(245,158,11,0.3)' },
];

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

export function MembersContribution({ perPerson }: Props) {
  const t = useTokens();
  const { isDark } = useTheme();
  if (!perPerson?.length) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: t.bg.card,
        border: `1px solid ${t.border.default}`,
        boxShadow: t.shadow.card,
      }}
    >
      {}
      <div className="px-6 py-5" style={{ borderBottom: `1px solid ${t.border.divider}` }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold" style={{ color: t.text.primary }}>
              Contribuição por Membro
            </h3>
            <p className="text-xs mt-0.5" style={{ color: t.text.subtle }}>
              Percentual de renda por pessoa
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: t.bg.icon }}
          >
            <Users size={15} style={{ color: t.text.muted }} />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {perPerson.map((p, idx) => {
          const color = COLORS[idx % COLORS.length];
          return (
            <div key={p.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-br',
                    color.bar,
                  )}
                >
                  {getInitials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold truncate" style={{ color: t.text.secondary }}>
                      {p.name}
                    </p>
                    <span className="text-sm font-bold ml-2" style={{ color: t.text.secondary }}>
                      {p.contributionPercent.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: t.text.subtle }}>
                    {fmt(p.income)}
                  </p>
                </div>
              </div>
              <div
                className="w-full rounded-full overflow-hidden ml-12"
                style={{ height: '8px', background: t.bg.mutedStrong }}
              >
                <div
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                    color.bar,
                  )}
                  style={{
                    width: `${p.contributionPercent}%`,
                    boxShadow: isDark ? `0 0 8px ${color.glow}` : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}

        {}
        <div className="pt-4 mt-2 space-y-3" style={{ borderTop: `1px solid ${t.border.divider}` }}>
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: t.text.subtle }}
          >
            Sugestão proporcional
          </p>
          {perPerson.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
              style={{ background: t.bg.cardSubtle, border: `1px solid ${t.border.subtle}` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.cardHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = t.bg.cardSubtle)}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br',
                    COLORS[idx % COLORS.length].bar,
                  )}
                >
                  {getInitials(p.name)[0]}
                </div>
                <p className="text-sm font-semibold" style={{ color: t.text.secondary }}>
                  {p.name}
                </p>
              </div>
              <p className="text-sm font-bold" style={{ color: t.text.primary }}>
                {fmt(p.proportionalExpense)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
