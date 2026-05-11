import { ArrowUpCircle, ArrowDownCircle, ArrowRight, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatShortDate } from '@/common/utils/date';
import { useTokens } from '@/hooks/useTokens';

type Transaction = {
  description: string;
  value: number;
  type: 'income' | 'expense';
  date: string;
  categoryName?: string;
  category?: { name: string };
};

type Props = { transactions: Transaction[] };

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function TransactionsList({ transactions }: Props) {
  const navigate = useNavigate();
  const t = useTokens();

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
              Transações Recentes
            </h3>
            <p className="text-xs mt-0.5" style={{ color: t.text.subtle }}>
              Seus últimos lançamentos
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: t.bg.icon }}
          >
            <Receipt size={15} style={{ color: t.text.muted }} />
          </div>
        </div>
      </div>

      {}
      <div>
        {transactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: t.text.subtle }}>
              Nenhuma transação encontrada
            </p>
          </div>
        ) : (
          transactions.map((tx, idx) => {
            const catName =
              tx.categoryName ??
              tx.category?.name ??
              (tx.type === 'income' ? 'Receita' : 'Despesa');
            const isIncome = tx.type === 'income';
            return (
              <div
                key={idx}
                className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-all duration-200 group"
                style={{ borderBottom: `1px solid ${t.border.divider}` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.cardHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{ background: isIncome ? t.income.bgIcon : t.expense.bgIcon }}
                >
                  {isIncome ? (
                    <ArrowUpCircle size={18} style={{ color: t.income.text }} />
                  ) : (
                    <ArrowDownCircle size={18} style={{ color: t.expense.text }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: t.text.secondary }}>
                    {tx.description}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: t.text.subtle }}>
                    {catName} · {formatShortDate(tx.date)}
                  </p>
                </div>
                <p
                  className="text-sm font-bold shrink-0"
                  style={{ color: isIncome ? t.income.text : t.expense.text }}
                >
                  {isIncome ? '+ ' : '- '}
                  {fmt(tx.value)}
                </p>
              </div>
            );
          })
        )}
      </div>

      {}
      <div className="px-6 py-4" style={{ borderTop: `1px solid ${t.border.divider}` }}>
        <button
          onClick={() => navigate('/record')}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 py-1 rounded-xl group"
          style={{ color: t.text.muted }}
          onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.cardHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Ver extrato completo
          <ArrowRight
            size={15}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
}
