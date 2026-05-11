import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

export interface SelectOption {
  value: string | number;
  label: string;

  dot?: string;

  icon?: React.ReactNode;

  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];

  value?: string | number | null;

  onChange?: (value: string | number) => void;

  label?: string;

  placeholder?: string;

  searchable?: boolean;

  searchPlaceholder?: string;

  emptyMessage?: string;

  disabled?: boolean;

  error?: string | { message?: string };

  helperText?: string;

  fullWidth?: boolean;

  size?: 'sm' | 'md' | 'lg';

  dropUp?: boolean;
  className?: string;
}

const getErrorMessage = (error?: string | { message?: string }) => {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  return error.message;
};

const SIZE_MAP = {
  sm: { height: 36, fontSize: 12, padding: '0 12px', borderRadius: 10 },
  md: { height: 42, fontSize: 13, padding: '0 14px', borderRadius: 12 },
  lg: { height: 48, fontSize: 14, padding: '0 16px', borderRadius: 14 },
};

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = 'Selecione...',
  searchable = false,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado',
  disabled = false,
  error,
  helperText,
  fullWidth = true,
  size = 'md',
  dropUp = false,
  className,
}: SelectProps) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const id = useId();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number>(200);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const errorMessage = getErrorMessage(error);
  const sz = SIZE_MAP[size];

  const selected = options.find((o) => o.value === value);

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    if (!open) setSearch('');
    if (open && containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [open, searchable]);

  const handleSelect = (opt: SelectOption) => {
    if (opt.disabled) return;
    onChange?.(opt.value);
    setOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) setOpen((v) => !v);
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
    }
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
      {}
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary, marginLeft: 2 }}
        >
          {label}
        </label>
      )}

      {}
      <div
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        style={{
          height: sz.height,
          padding: sz.padding,
          borderRadius: sz.borderRadius,
          fontSize: sz.fontSize,
          background: disabled ? (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc') : t.bg.input,
          border: `1.5px solid ${borderColor}`,
          boxShadow,
          color: selected ? t.text.primary : t.text.muted,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          userSelect: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          opacity: disabled ? 0.55 : 1,
          position: 'relative',
        }}
      >
        {}
        {selected?.dot && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: selected.dot,
              flexShrink: 0,
            }}
          />
        )}
        {selected?.icon && (
          <span
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: t.text.muted }}
          >
            {selected.icon}
          </span>
        )}

        {}
        <span
          style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {selected ? selected.label : placeholder}
        </span>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {selected && !disabled && (
            <span
              role="button"
              aria-label="Limpar seleção"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.('' as any);
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
          <ChevronDown
            size={14}
            style={{
              color: t.text.subtle,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      </div>

      {}
      {open && (
        <div
          role="listbox"
          data-ui-dropdown=""
          style={{
            position: 'absolute',
            zIndex: 9999,
            top: dropUp ? undefined : '100%',
            bottom: dropUp ? '100%' : undefined,
            left: 0,
            marginTop: dropUp ? undefined : 6,
            marginBottom: dropUp ? 6 : undefined,
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 14,
            boxShadow: t.shadow.drop,
            minWidth: containerWidth,
            width: containerWidth,
            overflow: 'hidden',
          }}
        >
          {}
          {searchable && (
            <div
              style={{
                padding: '10px 12px 10px',
                borderBottom: `1px solid ${t.border.divider}`,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isDark ? 'rgba(255,255,255,0.07)' : '#ffffff',
                  border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                  borderRadius: 10,
                  padding: '7px 11px',
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'border-color 0.15s',
                }}
              >
                <Search size={13} style={{ color: t.text.subtle, flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 12,
                    color: t.text.primary,
                    caretColor: t.border.focus,
                  }}
                  onFocus={(e) => {
                    const wrap = e.currentTarget.parentElement!;
                    wrap.style.borderColor = t.border.focus;
                    wrap.style.boxShadow = t.shadow.focus;
                  }}
                  onBlur={(e) => {
                    const wrap = e.currentTarget.parentElement!;
                    wrap.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0';
                    wrap.style.boxShadow = isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)';
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                {search && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    <X size={12} style={{ color: t.text.muted }} />
                  </button>
                )}
              </div>
            </div>
          )}

          {}
          <div style={{ maxHeight: 240, overflowY: 'auto', padding: '6px 0' }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  fontSize: 12,
                  color: t.text.muted,
                }}
              >
                {emptyMessage}
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 14px',
                      fontSize: sz.fontSize,
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      opacity: opt.disabled ? 0.45 : 1,
                      background: isSelected
                        ? isDark
                          ? 'rgba(99,102,241,0.15)'
                          : 'rgba(99,102,241,0.07)'
                        : 'transparent',
                      color: isSelected ? t.text.link : t.text.secondary,
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !opt.disabled)
                        (e.currentTarget as HTMLElement).style.background = t.bg.muted;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {opt.dot && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: opt.dot,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    {opt.icon && (
                      <span
                        style={{
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          color: t.text.muted,
                        }}
                      >
                        {opt.icon}
                      </span>
                    )}
                    <span
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check size={13} style={{ color: t.text.link, flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {}
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
