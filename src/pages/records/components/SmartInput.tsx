import { useState, useRef, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Sparkles,
  Zap,
  X,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { parseSmartInput, saveUserPattern } from '../hooks/useSmartParser';
import { useRecordHistory } from '../hooks/useRecordHistory';
import {
  useSmartSuggestions,
  detectValueAlert,
  detectRecurrenceSuggestion,
  formatRelativeDate,
} from '../hooks/useSmartSuggestions';
import { Tokens } from '@/theme/tokens';
import _ from 'lodash';

interface SmartInputProps {
  categories: any[];
  familyId?: string;
}

function getTypeLabel(t: Tokens): Record<string, { label: string; color: string; bg: string }> {
  return {
    expense: { label: 'Despesa', color: t.expense.textAlt, bg: t.expense.bg },
    salary: { label: 'Salário', color: t.income.textAlt, bg: t.income.bg },
    income: { label: 'Extra', color: t.extra.textAlt, bg: t.extra.bg },
  };
}

export function SmartInput({ categories, familyId }: SmartInputProps) {
  const { setValue, watch } = useFormContext();
  const t = useTokens();
  const isDark = t.bg.page === '#12161a';
  const TYPE_LABEL = getTypeLabel(t);

  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseSmartInput>>(null);
  const [applied, setApplied] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const currentFamilyId = familyId || watch('familyId');
  const { index: historyIndex } = useRecordHistory(currentFamilyId);
  const suggestions = useSmartSuggestions(text, historyIndex, categories);

  const currentValue = watch('value');
  const currentDescription = watch('description');
  const valueAlert = detectValueAlert(
    parseFloat(currentValue) || 0,
    currentDescription || '',
    historyIndex,
  );
  const recurrenceSuggestion = detectRecurrenceSuggestion(currentDescription || '', historyIndex);

  const debouncedParse = useRef(
    _.debounce((val: string) => {
      setParsed(parseSmartInput(val));
      setApplied(false);
    }, 180),
  ).current;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setText(val);
      setActiveSuggestion(-1);
      if (!val.trim()) {
        setParsed(null);
        setShowSuggestions(false);
        return;
      }
      debouncedParse(val);
      setShowSuggestions(true);
    },
    [debouncedParse],
  );

  const applySuggestion = useCallback(
    (
      desc: string,
      value: number,
      category: string,
      categoryId: string,
      type: 'expense' | 'salary' | 'income',
      isRecurring: boolean,
    ) => {
      setValue('description', desc);
      if (value > 0) setValue('value', value.toString());
      setValue('type', type);
      if (categoryId) {
        setValue('categoryId', categoryId);
        setValue('categoryName', category);
      } else if (category) {
        const match = categories.find((c) => c.name.toLowerCase() === category.toLowerCase());
        if (match) {
          setValue('categoryId', match.id);
          setValue('categoryName', match.name);
        }
      }
      if (isRecurring) setValue('isRecurring', true);
      saveUserPattern(desc.toLowerCase(), category, type);
      setApplied(true);
      setText('');
      setParsed(null);
      setShowSuggestions(false);
    },
    [setValue, categories],
  );

  const applyParsed = useCallback(() => {
    if (!parsed) return;
    setValue('description', parsed.description);
    if (parsed.value) setValue('value', parsed.value);
    setValue('type', parsed.type);
    if (parsed.suggestedCategoryName) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === parsed.suggestedCategoryName.toLowerCase(),
      );
      if (match) {
        setValue('categoryId', match.id);
        setValue('categoryName', match.name);
        saveUserPattern(parsed.description.toLowerCase(), match.name, parsed.type);
      }
    }
    setApplied(true);
    setText('');
    setParsed(null);
    setShowSuggestions(false);
  }, [parsed, setValue, categories]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyParsed();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        const s = suggestions[activeSuggestion];
        applySuggestion(s.description, s.value, s.category, s.categoryId, s.type, s.isRecurring);
      } else {
        applyParsed();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clear = () => {
    setText('');
    setParsed(null);
    setApplied(false);
    setShowSuggestions(false);
  };

  const containerBorder = focused || parsed ? t.quickInput.borderFocus : t.quickInput.border;
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const inputBorder = focused ? t.quickInput.borderFocus : t.border.default;
  const inputShadow = focused ? t.quickInput.shadow : 'none';

  const hasSuggestions = showSuggestions && suggestions.length > 0;

  return (
    <div
      style={{
        background: isDark ? 'rgba(92,185,138,0.08)' : '#e7f0e9',
        border: `1.5px solid ${containerBorder}`,
        borderRadius: 16,
        padding: '14px 14px 12px',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Zap size={12} color={t.quickInput.borderFocus} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: isDark ? t.income.textAlt : t.income.text,
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
          }}
        >
          Preenchimento Inteligente
        </span>
        <span
          style={{
            fontSize: 9,
            padding: '2px 7px',
            borderRadius: 999,
            fontWeight: 700,
            background: isDark ? 'rgba(92,185,138,0.20)' : t.income.bg,
            color: isDark ? t.income.textAlt : t.income.text,
          }}
        >
          Beta
        </span>
      </div>

      {/* Input */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <Sparkles size={15} color={focused || parsed ? t.quickInput.borderFocus : t.text.muted} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          onFocus={() => {
            setFocused(true);
            if (text.trim()) setShowSuggestions(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: iFood 45, Salário 3500, Gasolina 150..."
          style={{
            width: '100%',
            padding: '10px 36px 10px 36px',
            borderRadius: hasSuggestions ? '10px 10px 0 0' : 10,
            border: `1.5px solid ${inputBorder}`,
            background: inputBg,
            color: t.text.primary,
            fontSize: 13,
            outline: 'none',
            boxShadow: inputShadow,
            transition: 'border-color 0.18s, box-shadow 0.18s',
            boxSizing: 'border-box',
          }}
        />

        {text && (
          <button
            type="button"
            onClick={clear}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: t.text.muted,
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
          >
            <X size={13} />
          </button>
        )}

        {/* Suggestions dropdown */}
        {hasSuggestions && (
          <div
            ref={suggestionsRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              background: t.quickInput.dropBg,
              border: `1.5px solid ${t.quickInput.dropBorder}`,
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              overflow: 'hidden',
              boxShadow: t.quickInput.dropShadow,
            }}
          >
            {suggestions.map((s, i) => {
              const isActive = i === activeSuggestion;
              const typeStyle = TYPE_LABEL[s.type] || TYPE_LABEL.expense;
              return (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applySuggestion(
                      s.description,
                      s.value,
                      s.category,
                      s.categoryId,
                      s.type,
                      s.isRecurring,
                    );
                  }}
                  onMouseEnter={() => setActiveSuggestion(i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: isActive
                      ? isDark
                        ? 'rgba(92,185,138,0.12)'
                        : t.income.bg
                      : 'transparent',
                    borderBottom:
                      i < suggestions.length - 1 ? `1px solid ${t.border.divider}` : 'none',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Source icon */}
                  <div
                    style={{
                      flexShrink: 0,
                      color: s.source === 'history' ? t.quickInput.borderFocus : t.text.muted,
                    }}
                  >
                    {s.source === 'history' ? <Clock size={13} /> : <Sparkles size={13} />}
                  </div>

                  {/* Description + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: t.text.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.description}
                      </span>
                      {s.isRecurring && (
                        <RefreshCw
                          size={10}
                          style={{ color: t.quickInput.borderFocus, flexShrink: 0 }}
                        />
                      )}
                    </div>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
                    >
                      {s.category && (
                        <span style={{ fontSize: 10, color: t.text.muted }}>{s.category}</span>
                      )}
                      {s.count > 0 && (
                        <span style={{ fontSize: 10, color: t.text.subtle }}>
                          · {s.count}x usado
                        </span>
                      )}
                      {s.lastDate && (
                        <span style={{ fontSize: 10, color: t.text.subtle }}>
                          · {formatRelativeDate(s.lastDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side: value + type */}
                  <div
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 3,
                    }}
                  >
                    {s.value > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text.primary }}>
                        R$ {s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 999,
                        background: typeStyle.bg,
                        color: typeStyle.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {typeStyle.label}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Avg value row if history has multiple values */}
            {suggestions[0]?.source === 'history' &&
              suggestions[0]?.avgValue > 0 &&
              suggestions[0]?.recentValues.length > 1 && (
                <div
                  style={{
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: isDark ? 'rgba(255,255,255,0.02)' : t.bg.cardHover,
                    borderTop: `1px solid ${t.border.divider}`,
                  }}
                >
                  <TrendingUp size={11} style={{ color: t.text.muted, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: t.text.muted }}>
                    Média:{' '}
                    <span style={{ fontWeight: 700, color: t.text.secondary }}>
                      R${' '}
                      {suggestions[0].avgValue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    {' · '}Recentes:{' '}
                    {suggestions[0].recentValues
                      .map((v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
                      .join(', ')}
                  </span>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Parsed preview (when no history suggestions) */}
      {parsed && !applied && !hasSuggestions && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
                background: t.bg.mutedStrong,
                color: t.text.secondary,
              }}
            >
              {TYPE_LABEL[parsed.type]?.label || 'Despesa'}
            </span>
            {parsed.suggestedCategoryName && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: t.income.bg,
                  color: t.income.text,
                }}
              >
                {parsed.suggestedCategoryName}
              </span>
            )}
            {parsed.value && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: t.warning.bg,
                  color: t.warning.text,
                }}
              >
                R$ {Number(parsed.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={applyParsed}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '7px 16px',
              borderRadius: 999,
              border: 'none',
              background: t.quickInput.borderFocus,
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Aplicar <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* Applied confirmation */}
      {applied && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: 600,
            color: isDark ? t.income.textAlt : t.income.text,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Check size={13} strokeWidth={3} />
          Campos preenchidos automaticamente
        </div>
      )}

      {/* Value alert */}
      {valueAlert && !text && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 10,
            background: t.warning.bg,
            border: `1px solid ${t.warning.border}`,
          }}
        >
          <AlertTriangle size={13} style={{ color: t.warning.text, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: t.warning.text, fontWeight: 600 }}>{valueAlert}</span>
        </div>
      )}

      {/* Recurrence suggestion */}
      {recurrenceSuggestion && !text && (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 10,
            background: isDark ? 'rgba(92,185,138,0.08)' : t.income.bg,
            border: `1px solid ${isDark ? 'rgba(92,185,138,0.2)' : t.income.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} style={{ color: t.income.text, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: t.income.text, fontWeight: 600 }}>
              Você lança isso com frequência. Marcar como recorrente?
            </span>
          </div>
          <button
            type="button"
            onClick={() => setValue('isRecurring', true)}
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: t.income.bgIcon,
              color: t.income.text,
              flexShrink: 0,
            }}
          >
            Sim
          </button>
        </div>
      )}
    </div>
  );
}
