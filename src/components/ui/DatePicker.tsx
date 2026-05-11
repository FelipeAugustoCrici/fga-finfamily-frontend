import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = [
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
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const POPOVER_HEIGHT = 420;

function parseDate(value?: string) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m, day: d };
}
function formatISO(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function formatDisplay(value?: string) {
  const p = parseDate(value);
  if (!p) return '';
  return `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${p.year}`;
}
function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function firstWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  error?: string | { message?: string };
  helperText?: string;
  min?: string;
  max?: string;
  mode?: 'date' | 'month';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { height: 36, fontSize: 12, padding: '0 12px', borderRadius: 10 },
  md: { height: 42, fontSize: 13, padding: '0 14px', borderRadius: 12 },
  lg: { height: 48, fontSize: 14, padding: '0 16px', borderRadius: 14 },
};

const getErrorMessage = (error?: string | { message?: string }) => {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  return error.message;
};

const btnBase = (bg: string, color: string): React.CSSProperties => ({
  border: 'none',
  cursor: 'pointer',
  background: bg,
  color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.12s',
});

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Selecione uma data',
  disabled = false,
  required = false,
  optional = false,
  error,
  helperText,
  min,
  max,
  mode = 'date',
  size = 'md',
  fullWidth = true,
  className,
}: DatePickerProps) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const id = useId();
  const sz = SIZE_MAP[size];
  const errorMessage = getErrorMessage(error);

  const parsed = parseDate(value);
  const now = new Date();

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? now.getMonth() + 1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const calcDropDirection = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropUp(spaceBelow < POPOVER_HEIGHT + 16);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    calcDropDirection();
    setOpen((v) => !v);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
    if (e.key === 'Escape') setOpen(false);
  };

  const selectDay = (day: number) => {
    onChange?.(formatISO(viewYear, viewMonth, day));
    setOpen(false);
  };

  const isDisabledDay = (day: number) => {
    const iso = formatISO(viewYear, viewMonth, day);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const borderColor = errorMessage
    ? t.expense.text
    : focused || open
      ? t.border.focus
      : t.border.input;
  const boxShadow = errorMessage
    ? `0 0 0 3px ${isDark ? 'rgba(252,165,165,0.15)' : 'rgba(239,68,68,0.12)'}`
    : focused || open
      ? t.shadow.focus
      : 'none';

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startOffset = firstWeekday(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const yearRange = Array.from({ length: 100 }, (_, i) => now.getFullYear() - i).reverse();

  const popoverPos: React.CSSProperties = dropUp
    ? { bottom: sz.height + 8, top: 'auto' }
    : { top: sz.height + 8, bottom: 'auto' };

  return (
    <div
      ref={containerRef}
      style={{
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        position: 'relative',
      }}
      className={className}
    >
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: t.text.secondary,
            marginLeft: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
          {optional && <span style={{ color: t.text.muted, fontWeight: 400 }}>(opcional)</span>}
        </label>
      )}

      {}
      <div
        ref={triggerRef}
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        onClick={handleOpen}
        style={{
          height: sz.height,
          padding: sz.padding,
          borderRadius: sz.borderRadius,
          fontSize: sz.fontSize,
          background: disabled ? (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc') : t.bg.input,
          border: `1.5px solid ${borderColor}`,
          boxShadow,
          color: value ? t.text.primary : t.text.muted,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          userSelect: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <CalendarDays
          size={15}
          style={{
            color: open ? t.border.focus : t.text.muted,
            flexShrink: 0,
            transition: 'color 0.2s',
          }}
        />
        <span style={{ flex: 1 }}>{value ? formatDisplay(value) : placeholder}</span>
        {value && !disabled && (
          <span
            role="button"
            aria-label="Limpar data"
            onClick={(e) => {
              e.stopPropagation();
              onChange?.('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              borderRadius: 4,
              color: t.text.subtle,
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = t.text.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.text.subtle)}
          >
            <X size={12} />
          </span>
        )}
      </div>

      {}
      {open && (
        <div
          data-ui-dropdown=""
          style={{
            position: 'absolute',
            ...popoverPos,
            left: 0,
            zIndex: 9999,
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 16,
            boxShadow: t.shadow.drop,
            padding: '14px 12px 12px',
            width: 'min(300px, calc(100vw - 32px))',
          }}
        >
          {}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <button
              type="button"
              onClick={prevMonth}
              style={{
                ...btnBase('transparent', t.text.muted),
                width: 28,
                height: 28,
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.muted)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronLeft size={15} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>
              {MONTHS_FULL[viewMonth - 1]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              style={{
                ...btnBase('transparent', t.text.muted),
                width: 28,
                height: 28,
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.muted)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {mode === 'date' ? (
            <>
              {}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 2,
                  marginBottom: 4,
                }}
              >
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    style={{
                      textAlign: 'center',
                      fontSize: 9,
                      fontWeight: 700,
                      color: t.text.subtle,
                      padding: '2px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const iso = formatISO(viewYear, viewMonth, day);
                  const isSelected = value === iso;
                  const isToday =
                    iso === formatISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
                  const isDisabled = isDisabledDay(day);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !isDisabled && selectDay(day)}
                      style={{
                        height: 30,
                        borderRadius: 7,
                        border: 'none',
                        fontSize: 11,
                        fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.35 : 1,
                        background: isSelected
                          ? t.border.focus
                          : isToday
                            ? isDark
                              ? 'rgba(99,102,241,0.15)'
                              : 'rgba(99,102,241,0.08)'
                            : 'transparent',
                        color: isSelected ? '#ffffff' : isToday ? t.text.link : t.text.secondary,
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected && !isDisabled)
                          (e.currentTarget as HTMLElement).style.background = t.bg.muted;
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          (e.currentTarget as HTMLElement).style.background = isToday
                            ? isDark
                              ? 'rgba(99,102,241,0.15)'
                              : 'rgba(99,102,241,0.08)'
                            : 'transparent';
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div style={{ height: 1, background: t.border.divider, margin: '10px 0 8px' }} />

              {}
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: t.text.subtle,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 6,
                }}
              >
                Mês
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 3,
                  marginBottom: 10,
                }}
              >
                {MONTHS.map((m, i) => {
                  const isActive = viewMonth === i + 1;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setViewMonth(i + 1)}
                      style={{
                        ...btnBase(
                          isActive
                            ? isDark
                              ? 'rgba(99,102,241,0.20)'
                              : 'rgba(99,102,241,0.10)'
                            : 'transparent',
                          isActive ? t.text.link : t.text.secondary,
                        ),
                        padding: '4px 0',
                        borderRadius: 7,
                        fontSize: 10,
                        fontWeight: isActive ? 700 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.background = t.bg.muted;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>

              {}
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: t.text.subtle,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 6,
                }}
              >
                Ano
              </p>
              <div style={{ maxHeight: 80, overflowY: 'auto', borderRadius: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
                  {yearRange.map((y) => {
                    const isActive = viewYear === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setViewYear(y)}
                        style={{
                          ...btnBase(
                            isActive
                              ? isDark
                                ? 'rgba(99,102,241,0.20)'
                                : 'rgba(99,102,241,0.10)'
                              : 'transparent',
                            isActive ? t.text.link : t.text.secondary,
                          ),
                          padding: '4px 0',
                          borderRadius: 7,
                          fontSize: 10,
                          fontWeight: isActive ? 700 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLElement).style.background = t.bg.muted;
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: t.text.subtle,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 6,
                }}
              >
                Mês
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 3,
                  marginBottom: 10,
                }}
              >
                {MONTHS.map((m, i) => {
                  const isActive = viewMonth === i + 1;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setViewMonth(i + 1);
                        onChange?.(formatISO(viewYear, i + 1, 1));
                        setOpen(false);
                      }}
                      style={{
                        ...btnBase(
                          isActive
                            ? isDark
                              ? 'rgba(99,102,241,0.20)'
                              : 'rgba(99,102,241,0.10)'
                            : 'transparent',
                          isActive ? t.text.link : t.text.secondary,
                        ),
                        padding: '6px 0',
                        borderRadius: 7,
                        fontSize: 11,
                        fontWeight: isActive ? 700 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.background = t.bg.muted;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
              <p
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: t.text.subtle,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 6,
                }}
              >
                Ano
              </p>
              <div style={{ maxHeight: 80, overflowY: 'auto', borderRadius: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
                  {yearRange.map((y) => {
                    const isActive = viewYear === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setViewYear(y);
                          onChange?.(formatISO(y, viewMonth, 1));
                          setOpen(false);
                        }}
                        style={{
                          ...btnBase(
                            isActive
                              ? isDark
                                ? 'rgba(99,102,241,0.20)'
                                : 'rgba(99,102,241,0.10)'
                              : 'transparent',
                            isActive ? t.text.link : t.text.secondary,
                          ),
                          padding: '4px 0',
                          borderRadius: 7,
                          fontSize: 10,
                          fontWeight: isActive ? 700 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLElement).style.background = t.bg.muted;
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {(errorMessage || helperText) && (
        <p
          style={{
            fontSize: 11,
            marginLeft: 2,
            color: errorMessage ? t.expense.text : t.text.muted,
          }}
        >
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
}
