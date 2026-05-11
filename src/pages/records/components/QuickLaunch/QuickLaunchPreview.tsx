import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Tag,
  User,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import type { ParsedLaunch } from './quickLaunch.parser';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  parsed: ParsedLaunch;
  categoryName: string | null;
  personName: string | null;
  dateLabel: string;
  description: string;
  onDescriptionChange: (v: string) => void;
}

export function QuickLaunchPreview({
  parsed,
  categoryName,
  personName,
  dateLabel,
  description,
  onDescriptionChange,
}: Props) {
  const t = useTokens();
  const isIncome = parsed.type !== 'expense';
  const typeLabel =
    parsed.type === 'salary' ? 'Salário' : parsed.type === 'income' ? 'Receita' : 'Despesa';
  const semantic = isIncome ? t.income : t.expense;

  return (
    <div
      className="rounded-xl p-4 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200"
      style={{ background: t.bg.cardSubtle, border: `1px solid ${t.border.default}` }}
    >
      {}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: semantic.bgIcon }}
        >
          {isIncome ? (
            <ArrowUpCircle size={14} style={{ color: semantic.text }} />
          ) : (
            <ArrowDownCircle size={14} style={{ color: semantic.text }} />
          )}
        </div>
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: semantic.text }}
        >
          {typeLabel}
        </span>
        {parsed.confidence >= 0.7 && (
          <span className="ml-auto text-xs font-medium" style={{ color: t.income.text }}>
            ✓ pronto para salvar
          </span>
        )}
      </div>

      {}
      <div className="flex items-center gap-2.5 text-sm">
        <FileText size={14} style={{ color: t.text.subtle }} className="shrink-0" />
        <span className="w-24 shrink-0" style={{ color: t.text.muted }}>
          Descrição
        </span>
        <input
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descrição"
          className="flex-1 rounded-md px-2 py-0.5 text-sm font-semibold outline-none transition-colors"
          style={{
            background: t.bg.input,
            border: `1px solid ${t.border.input}`,
            color: t.text.primary,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = t.border.focus)}
          onBlur={(e) => (e.currentTarget.style.borderColor = t.border.input)}
        />
      </div>

      {}
      <div className="flex items-center gap-2.5 text-sm">
        <DollarSign size={14} style={{ color: t.text.subtle }} className="shrink-0" />
        <span className="w-24 shrink-0" style={{ color: t.text.muted }}>
          Valor
        </span>
        <span
          className="font-semibold"
          style={{ color: parsed.amount !== null ? semantic.text : t.text.disabled }}
        >
          {parsed.amount !== null ? fmt(parsed.amount) : '—'}
        </span>
      </div>

      {}
      <div className="flex items-center gap-2.5 text-sm">
        <Calendar size={14} style={{ color: t.text.subtle }} className="shrink-0" />
        <span className="w-24 shrink-0" style={{ color: t.text.muted }}>
          Data
        </span>
        <span className="font-semibold" style={{ color: t.text.primary }}>
          {dateLabel}
        </span>
      </div>

      {}
      <div className="flex items-center gap-2.5 text-sm">
        <Tag size={14} style={{ color: t.text.subtle }} className="shrink-0" />
        <span className="w-24 shrink-0" style={{ color: t.text.muted }}>
          Categoria
        </span>
        <span
          className="font-semibold"
          style={{ color: categoryName ? t.text.primary : t.text.disabled }}
        >
          {categoryName ?? '—'}
        </span>
      </div>

      {}
      <div className="flex items-center gap-2.5 text-sm">
        <User size={14} style={{ color: t.text.subtle }} className="shrink-0" />
        <span className="w-24 shrink-0" style={{ color: t.text.muted }}>
          Responsável
        </span>
        <span
          className="font-semibold"
          style={{ color: personName ? t.text.primary : t.text.disabled }}
        >
          {personName ?? '—'}
        </span>
      </div>
    </div>
  );
}
