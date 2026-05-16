import { Calendar, Search, ChevronDown, Check, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTokens } from '@/hooks/useTokens';
import { RecordStatus } from '../types/record.types';
import { Ordenacao } from '../hooks/useRecordFilters';
import _ from 'lodash';

const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MONTHS_FULL  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const STATUS_OPTIONS = [
  { value: 'ALL',     label: 'Todos',    dot: null },
  { value: 'PENDING', label: 'Pendente', dot: '#f59e0b' },
  { value: 'PAID',    label: 'Pago',     dot: '#4ade80' },
  { value: 'OVERDUE', label: 'Atrasado', dot: '#f87171' },
] as const;

const TIPO_OPTIONS = [
  { value: '',          label: 'Todos' },
  { value: 'fixed',     label: 'Fixo' },
  { value: 'variable',  label: 'Variável' },
  { value: 'recurring', label: 'Recorrente' },
];

const ORDENACAO_OPTIONS: { value: Ordenacao; label: string }[] = [
  { value: 'recente',     label: 'Mais recente' },
  { value: 'antigo',      label: 'Mais antigo' },
  { value: 'maior_valor', label: 'Maior valor' },
  { value: 'menor_valor', label: 'Menor valor' },
  { value: 'az',          label: 'A → Z' },
  { value: 'za',          label: 'Z → A' },
];

type Props = {
  month: number; year: number;
  search: string; status: RecordStatus | 'ALL';
  categoryId: string; personId: string; tipo: string;
  valorMin: string; valorMax: string;
  dataInicio: string; dataFim: string;
  ordenacao: Ordenacao; activeCount: number;
  categories: Array<{ id: string; name: string }>;
  people: Array<{ id: string; name: string }>;
  onMonthChange: (v: number) => void; onYearChange: (v: number) => void;
  onSearchChange: (v: string) => void; onStatusChange: (v: RecordStatus | 'ALL') => void;
  onCategoryChange: (v: string) => void; onPersonChange: (v: string) => void;
  onTipoChange: (v: string) => void;
  onValorMinChange: (v: string) => void; onValorMaxChange: (v: string) => void;
  onDataInicioChange: (v: string) => void; onDataFimChange: (v: string) => void;
  onOrdenacaoChange: (v: Ordenacao) => void;
  onReset: () => void;
  onApplyMultiple: (updates: Record<string, string>) => void;
};

/* ─── tiny portal dropdown ─── */
function usePortalDropdown() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen(v => !v);
  };
  return { btnRef, open, setOpen, pos, toggle };
}

function PortalDropdown({ open, pos, onClose, children }: {
  open: boolean; pos: { top: number; right: number };
  onClose: () => void; children: React.ReactNode;
}) {
  const t = useTokens();
  if (!open) return null;
  return createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999,
        background: t.bg.card, border: `1px solid ${t.border.default}`,
        borderRadius: 12, boxShadow: t.shadow.drop, minWidth: 180, overflow: 'hidden',
      }}>
        {children}
      </div>
    </>,
    document.body,
  );
}

function DropOpt({ label, selected, dot, onClick }: {
  label: string; selected: boolean; dot?: string | null; onClick: () => void;
}) {
  const t = useTokens();
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8,
      background: selected ? t.bg.muted : 'transparent', border: 'none',
      color: selected ? t.text.primary : t.text.secondary,
      fontSize: 13, fontWeight: selected ? 600 : 400, cursor: 'pointer', textAlign: 'left',
    }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = t.bg.cardHover; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {dot !== undefined && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot ?? t.border.strong, flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{label}</span>
      {selected && <Check size={13} style={{ color: t.text.link }} />}
    </button>
  );
}

/* ─── drawer section label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: t.text.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
      {children}
    </p>
  );
}

/* ─── chip selector (for status, tipo, category, person) ─── */
function ChipGroup({ options, value, onChange }: {
  options: Array<{ value: string; label: string; dot?: string | null }>;
  value: string; onChange: (v: string) => void;
}) {
  const t = useTokens();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: active ? 600 : 400,
            border: `1px solid ${active ? t.border.strong : t.border.input}`,
            background: active ? t.bg.mutedStrong : t.bg.input,
            color: active ? t.text.primary : t.text.secondary,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.12s',
          }}>
            {o.dot !== undefined && <span style={{ width: 6, height: 6, borderRadius: '50%', background: o.dot ?? t.border.strong }} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── main component ─── */
export function RecordsFilters({
  month, year, search, status, categoryId, personId, tipo,
  valorMin, valorMax, dataInicio, dataFim, ordenacao, activeCount,
  categories, people,
  onMonthChange, onYearChange, onSearchChange, onStatusChange,
  onCategoryChange, onPersonChange, onTipoChange,
  onValorMinChange, onValorMaxChange, onDataInicioChange, onDataFimChange,
  onOrdenacaoChange, onReset, onApplyMultiple,
}: Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const [searchFocused, setSearchFocused] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // local draft state inside drawer — applied on "Aplicar"
  const [draft, setDraft] = useState({
    status, categoryId, personId, tipo,
    valorMin, valorMax,
  });

  // sync draft when drawer opens
  useEffect(() => {
    if (drawerOpen) setDraft({ status, categoryId, personId, tipo, valorMin, valorMax });
  }, [drawerOpen]);

  const period = usePortalDropdown();
  const ordenD = usePortalDropdown();

  const debouncedSearch = useCallback(_.debounce((v: string) => onSearchChange(v), 300), [onSearchChange]);

  const now = new Date();
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const currentOrden = ORDENACAO_OPTIONS.find(o => o.value === ordenacao) ?? ORDENACAO_OPTIONS[0];

  const applyDraft = () => {
    onApplyMultiple({
      status: draft.status,
      categoryId: draft.categoryId,
      personId: draft.personId,
      tipo: draft.tipo,
      valorMin: draft.valorMin,
      valorMax: draft.valorMax,
      page: '1',
    });
    setDrawerOpen(false);
  };

  const clearDraft = () => {
    setDraft({ status: 'ALL', categoryId: '', personId: '', tipo: '', valorMin: '', valorMax: '' });
  };

  // active chips for display
  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
  if (status !== 'ALL') chips.push({ key: 'status', label: STATUS_OPTIONS.find(o => o.value === status)?.label ?? status, onRemove: () => onStatusChange('ALL') });
  if (categoryId) chips.push({ key: 'cat', label: categories.find(c => c.id === categoryId)?.name ?? 'Categoria', onRemove: () => onCategoryChange('') });
  if (personId) chips.push({ key: 'person', label: people.find(p => p.id === personId)?.name ?? 'Responsável', onRemove: () => onPersonChange('') });
  if (tipo) chips.push({ key: 'tipo', label: TIPO_OPTIONS.find(o => o.value === tipo)?.label ?? tipo, onRemove: () => onTipoChange('') });
  if (valorMin || valorMax) chips.push({ key: 'valor', label: `R$ ${valorMin || '0'} – ${valorMax || '∞'}`, onRemove: () => { onValorMinChange(''); onValorMaxChange(''); } });

  const inputSt = (focused?: boolean): React.CSSProperties => ({
    height: 34, padding: '0 10px', borderRadius: 8, fontSize: 13, outline: 'none', width: '100%',
    background: t.bg.input, border: `1.5px solid ${focused ? t.border.focus : t.border.input}`,
    color: t.text.primary, transition: 'border-color 0.15s',
    colorScheme: isDark ? 'dark' : 'light',
  } as React.CSSProperties);

  const pillBtn = (active: boolean): React.CSSProperties => ({
    height: 36, padding: '0 13px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6,
    background: active ? t.bg.mutedStrong : t.bg.input,
    border: `1px solid ${active ? t.border.strong : t.border.input}`,
    color: active ? t.text.primary : t.text.secondary,
    fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' as const, transition: 'all 0.15s',
  });

  return (
    <div style={{ background: t.bg.cardSubtle, borderBottom: `1px solid ${t.border.subtle}` }}>

      {/* ── top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', flexWrap: 'wrap' }}>

        {/* search */}
        <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 140 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: searchFocused ? t.text.link : t.text.muted, pointerEvents: 'none' }} />
          <input
            type="text" placeholder="Buscar descrição..."
            defaultValue={search}
            onChange={e => debouncedSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{ ...inputSt(searchFocused), height: 36, paddingLeft: 34, borderRadius: 999 }}
          />
        </div>

        {/* period */}
        <button ref={period.btnRef} onClick={period.toggle} style={pillBtn(period.open)}>
          <Calendar size={13} style={{ color: t.text.muted }} />
          <span>{MONTHS_FULL[month - 1]} {year}</span>
          <ChevronDown size={12} style={{ color: t.text.subtle, transform: period.open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* filtros */}
        <button onClick={() => setDrawerOpen(true)} style={{ ...pillBtn(activeCount > 0), color: activeCount > 0 ? t.text.link : t.text.secondary, fontWeight: activeCount > 0 ? 600 : 400 }}>
          <SlidersHorizontal size={13} />
          <span>Filtros</span>
          {activeCount > 0 && (
            <span style={{ minWidth: 18, height: 18, borderRadius: 999, padding: '0 5px', background: t.text.link, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeCount}
            </span>
          )}
        </button>

        {/* ordenar */}
        <button ref={ordenD.btnRef} onClick={ordenD.toggle} style={pillBtn(ordenacao !== 'recente' || ordenD.open)}>
          <ArrowUpDown size={13} />
          <span>{currentOrden.label}</span>
          <ChevronDown size={12} style={{ color: t.text.subtle, transform: ordenD.open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {/* ── active chips ── */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px 10px', flexWrap: 'wrap' }}>
          {chips.map(chip => (
            <span key={chip.key} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.25)', color: t.text.link,
            }}>
              {chip.label}
              <button onClick={chip.onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.text.muted, display: 'flex', padding: 0, lineHeight: 1 }}>
                <X size={11} />
              </button>
            </span>
          ))}
          <button onClick={onReset} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: t.expense.text, padding: '3px 6px' }}>
            Limpar tudo
          </button>
        </div>
      )}

      {/* ── period portal ── */}
      <PortalDropdown open={period.open} pos={period.pos} onClose={() => period.setOpen(false)}>
        <div style={{ padding: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: t.text.subtle, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Mês</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 12 }}>
            {MONTHS_SHORT.map((m, i) => (
              <button key={i} onClick={() => { onMonthChange(i + 1); period.setOpen(false); }} style={{
                padding: '6px 4px', borderRadius: 8, border: 'none', fontSize: 12, cursor: 'pointer',
                background: month === i + 1 ? t.income.bgIcon : 'transparent',
                color: month === i + 1 ? t.income.text : t.text.secondary,
                fontWeight: month === i + 1 ? 700 : 400,
              }}>{m}</button>
            ))}
          </div>
          <p style={{ fontSize: 11, fontWeight: 700, color: t.text.subtle, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Ano</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {years.map(y => (
              <button key={y} onClick={() => { onYearChange(y); period.setOpen(false); }} style={{
                flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none', fontSize: 12, cursor: 'pointer',
                background: year === y ? t.income.bgIcon : 'transparent',
                color: year === y ? t.income.text : t.text.secondary,
                fontWeight: year === y ? 700 : 400,
              }}>{y}</button>
            ))}
          </div>
        </div>
      </PortalDropdown>

      {/* ── ordenar portal ── */}
      <PortalDropdown open={ordenD.open} pos={ordenD.pos} onClose={() => ordenD.setOpen(false)}>
        {ORDENACAO_OPTIONS.map(o => (
          <DropOpt key={o.value} label={o.label} selected={ordenacao === o.value}
            onClick={() => { onOrdenacaoChange(o.value); ordenD.setOpen(false); }} />
        ))}
      </PortalDropdown>

      {/* ── drawer ── */}
      {createPortal(
        <>
          {/* backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
              opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'auto' : 'none',
              transition: 'opacity 0.25s',
            }}
          />
          {/* panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 10001,
            width: 'min(380px, 100vw)',
            background: t.bg.card,
            borderLeft: `1px solid ${t.border.default}`,
            boxShadow: '-8px 0 32px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${t.border.divider}` }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: t.text.primary }}>Filtros</p>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.text.muted, display: 'flex', padding: 4, borderRadius: 8 }}>
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* status */}
              <div>
                <SectionLabel>Status</SectionLabel>
                <ChipGroup
                  options={STATUS_OPTIONS.map(o => ({ value: o.value, label: o.label, dot: o.dot }))}
                  value={draft.status}
                  onChange={v => setDraft(d => ({ ...d, status: v as RecordStatus | 'ALL' }))}
                />
              </div>

              {/* tipo */}
              <div>
                <SectionLabel>Tipo</SectionLabel>
                <ChipGroup
                  options={TIPO_OPTIONS}
                  value={draft.tipo}
                  onChange={v => setDraft(d => ({ ...d, tipo: v }))}
                />
              </div>

              {/* categoria */}
              {categories.length > 0 && (
                <div>
                  <SectionLabel>Categoria</SectionLabel>
                  <ChipGroup
                    options={[{ value: '', label: 'Todas' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
                    value={draft.categoryId}
                    onChange={v => setDraft(d => ({ ...d, categoryId: v }))}
                  />
                </div>
              )}

              {/* responsável */}
              {people.length > 0 && (
                <div>
                  <SectionLabel>Responsável</SectionLabel>
                  <ChipGroup
                    options={[{ value: '', label: 'Todos' }, ...people.map(p => ({ value: p.id, label: p.name }))]}
                    value={draft.personId}
                    onChange={v => setDraft(d => ({ ...d, personId: v }))}
                  />
                </div>
              )}

              {/* faixa de valor */}
              <div>
                <SectionLabel>Faixa de valor</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="number" placeholder="Mín" min={0} value={draft.valorMin}
                    onChange={e => setDraft(d => ({ ...d, valorMin: e.target.value }))}
                    style={{ ...inputSt(), flex: 1 }} />
                  <span style={{ color: t.text.subtle, fontSize: 13 }}>—</span>
                  <input type="number" placeholder="Máx" min={0} value={draft.valorMax}
                    onChange={e => setDraft(d => ({ ...d, valorMax: e.target.value }))}
                    style={{ ...inputSt(), flex: 1 }} />
                </div>
              </div>
            </div>

            {/* footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${t.border.divider}`, display: 'flex', gap: 10 }}>
              <button onClick={clearDraft} style={{
                flex: 1, height: 40, borderRadius: 10, border: `1px solid ${t.border.input}`,
                background: 'transparent', color: t.text.secondary, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>
                Limpar
              </button>
              <button onClick={applyDraft} style={{
                flex: 2, height: 40, borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
              }}>
                Aplicar filtros
              </button>
            </div>
          </div>
        </>,
        document.body,
      )}
    </div>
  );
}
