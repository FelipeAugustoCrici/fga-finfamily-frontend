import { Calendar, Search, ChevronDown, Check } from 'lucide-react';
import _ from 'lodash';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTokens } from '@/hooks/useTokens';
import { RecordStatus } from '../types/record.types';

type RecordsFiltersProps = {
  month: number;
  year: number;
  search: string;
  status: RecordStatus | 'ALL';
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: RecordStatus | 'ALL') => void;
};

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

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos os status', dot: null },
  { value: 'PENDING', label: 'Pendente', dot: '#f59e0b' },
  { value: 'PAID', label: 'Pago', dot: '#4ade80' },
  { value: 'OVERDUE', label: 'Atrasado', dot: '#f87171' },
] as const;

function useDropdownPos() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, right: 0, width: 0 });

  const calcPos = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({
      top: r.bottom + 4,
      left: r.left,
      right: window.innerWidth - r.right,
      width: r.width,
    });
  };

  return { btnRef, pos, calcPos };
}

export function RecordsFilters({
  month,
  year,
  search,
  status,
  onMonthChange,
  onYearChange,
  onSearchChange,
  onStatusChange,
}: RecordsFiltersProps) {
  const now = new Date();
  const t = useTokens();
  const [searchFocused, setSearchFocused] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const period = useDropdownPos();
  const statusDrop = useDropdownPos();

  const years = _.range(now.getFullYear() - 1, now.getFullYear() + 3);
  const currentStatus = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0];

  // Close on outside click or scroll
  useEffect(() => {
    if (!periodOpen && !statusOpen) return;
    const close = (e: MouseEvent | Event) => {
      if (e instanceof MouseEvent) {
        const t = e.target as Node;
        if (period.btnRef.current?.contains(t) || statusDrop.btnRef.current?.contains(t)) return;
      }
      setPeriodOpen(false);
      setStatusOpen(false);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [periodOpen, statusOpen]);

  return (
    <div
      className="flex flex-col md:flex-row gap-3 items-stretch md:items-center p-4"
      style={{ background: t.bg.cardSubtle, borderBottom: `1px solid ${t.border.subtle}` }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: searchFocused ? t.text.link : t.text.muted }}
        />
        <input
          type="text"
          placeholder="Buscar por descrição..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-10 pr-4 text-sm outline-none"
          style={{
            height: '42px',
            borderRadius: '12px',
            background: t.bg.input,
            border: `1.5px solid ${searchFocused ? t.border.focus : t.border.input}`,
            boxShadow: searchFocused ? t.shadow.focus : 'none',
            color: t.text.primary,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Period button */}
        <button
          ref={period.btnRef}
          onClick={() => {
            period.calcPos();
            setPeriodOpen((v) => !v);
            setStatusOpen(false);
          }}
          className="flex items-center gap-2 text-sm font-medium transition-all duration-200"
          style={{
            height: '42px',
            padding: '0 14px',
            borderRadius: '999px',
            background: periodOpen ? t.bg.mutedStrong : t.bg.input,
            border: `1px solid ${periodOpen ? t.border.strong : t.border.input}`,
            color: t.text.primary,
            cursor: 'pointer',
          }}
        >
          <Calendar size={14} style={{ color: t.text.muted }} />
          <span className="capitalize">
            {MONTHS[month - 1]} {year}
          </span>
          <ChevronDown
            size={13}
            style={{
              color: t.text.subtle,
              transform: periodOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </button>

        {/* Status button */}
        <button
          ref={statusDrop.btnRef}
          onClick={() => {
            statusDrop.calcPos();
            setStatusOpen((v) => !v);
            setPeriodOpen(false);
          }}
          className="flex items-center gap-2 text-sm font-medium transition-all duration-200"
          style={{
            height: '42px',
            padding: '0 14px',
            borderRadius: '999px',
            background: statusOpen ? t.bg.mutedStrong : t.bg.input,
            border: `1px solid ${statusOpen ? t.border.strong : t.border.input}`,
            color: t.text.primary,
            cursor: 'pointer',
          }}
        >
          {currentStatus.dot ? (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: currentStatus.dot }}
            />
          ) : (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: t.border.strong }}
            />
          )}
          <span>{currentStatus.label}</span>
          <ChevronDown
            size={13}
            style={{
              color: t.text.subtle,
              transform: statusOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </button>
      </div>

      {/* Period portal */}
      {periodOpen &&
        createPortal(
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
              onClick={() => setPeriodOpen(false)}
            />
            <div
              style={{
                position: 'fixed',
                // eslint-disable-next-line react-hooks/refs
                top: period.pos.top,
                // eslint-disable-next-line react-hooks/refs
                right: period.pos.right,
                zIndex: 9999,
                padding: 12,
                width: 224,
                background: t.bg.card,
                border: `1px solid ${t.border.default}`,
                borderRadius: 14,
                boxShadow: t.shadow.drop,
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
                style={{ color: t.text.subtle }}
              >
                Mês
              </p>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {MONTHS.map((m, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => onMonthChange(i + 1)}
                    className="text-xs px-2 py-1.5 rounded-lg text-left transition-all duration-150"
                    style={{
                      background: month === i + 1 ? t.income.bgIcon : 'transparent',
                      color: month === i + 1 ? t.income.text : t.text.secondary,
                      fontWeight: month === i + 1 ? 600 : 400,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (month !== i + 1)
                        (e.currentTarget as HTMLElement).style.background = t.bg.muted;
                    }}
                    onMouseLeave={(e) => {
                      if (month !== i + 1)
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
                style={{ color: t.text.subtle }}
              >
                Ano
              </p>
              <div className="flex gap-1">
                {years.map((y) => (
                  <button
                    key={y}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => onYearChange(y)}
                    className="flex-1 text-xs py-1.5 rounded-lg transition-all duration-150"
                    style={{
                      background: year === y ? t.income.bgIcon : 'transparent',
                      color: year === y ? t.income.text : t.text.secondary,
                      fontWeight: year === y ? 600 : 400,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (year !== y)
                        (e.currentTarget as HTMLElement).style.background = t.bg.muted;
                    }}
                    onMouseLeave={(e) => {
                      if (year !== y)
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body,
        )}

      {/* Status portal */}
      {statusOpen &&
        createPortal(
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
              onClick={() => setStatusOpen(false)}
            />
            <div
              style={{
                position: 'fixed',
                // eslint-disable-next-line react-hooks/refs
                top: statusDrop.pos.top,
                // eslint-disable-next-line react-hooks/refs
                right: statusDrop.pos.right,
                zIndex: 9999,
                paddingTop: 6,
                paddingBottom: 6,
                minWidth: 176,
                background: t.bg.card,
                border: `1px solid ${t.border.default}`,
                borderRadius: 12,
                boxShadow: t.shadow.drop,
              }}
            >
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = opt.value === status;
                return (
                  <button
                    key={opt.value}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      onStatusChange(opt.value as RecordStatus | 'ALL');
                      setStatusOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-150"
                    style={{
                      color: isSelected ? t.text.primary : t.text.secondary,
                      background: isSelected ? t.bg.muted : 'transparent',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = t.bg.cardHover;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {opt.dot ? (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: opt.dot }}
                      />
                    ) : (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: t.border.strong }}
                      />
                    )}
                    <span className="flex-1 text-left">{opt.label}</span>
                    {isSelected && <Check size={13} style={{ color: t.text.link }} />}
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
