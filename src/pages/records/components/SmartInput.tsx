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
import _ from 'lodash';

interface SmartInputProps {
  categories: any[];
  familyId?: string;
}

const TYPE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  expense: { label: 'Despesa', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  salary: { label: 'Salário', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  income: { label: 'Extra', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
};

export function SmartInput({ categories, familyId }: SmartInputProps) {
  const { setValue, watch } = useFormContext();
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

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

  const containerBorder = isDark
    ? focused || parsed
      ? 'rgba(99,102,241,0.40)'
      : 'rgba(99,102,241,0.18)'
    : focused || parsed
      ? '#a5b4fc'
      : '#ddd6fe';

  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const inputBorder = focused ? '#6366f1' : isDark ? 'rgba(255,255,255,0.10)' : '#e2e8f0';
  const inputShadow = focused ? '0 0 0 3px rgba(99,102,241,0.18)' : 'none';

  const hasSuggestions = showSuggestions && suggestions.length > 0;

  return (
    <div
      style={{
        background: isDark ? 'rgba(99,102,241,0.07)' : '#f5f3ff',
        border: `1.5px solid ${containerBorder}`,
        borderRadius: 16,
        padding: '14px 14px 12px',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Zap size={12} color="#6366f1" />
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: isDark ? '#a5b4fc' : '#4338ca',
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
            background: isDark ? 'rgba(99,102,241,0.20)' : '#e0e7ff',
            color: isDark ? '#a5b4fc' : '#4338ca',
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
          <Sparkles size={15} color={focused || parsed ? '#6366f1' : t.text.muted} />
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
              background: isDark ? '#1e1e2e' : '#ffffff',
              border: `1.5px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#c7d2fe'}`,
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
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
                        ? 'rgba(99,102,241,0.12)'
                        : '#eef2ff'
                      : 'transparent',
                    borderBottom:
                      i < suggestions.length - 1
                        ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`
                        : 'none',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Source icon */}
                  <div
                    style={{
                      flexShrink: 0,
                      color:
                        s.source === 'history' ? (isDark ? '#a5b4fc' : '#6366f1') : t.text.muted,
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
                          style={{ color: isDark ? '#a5b4fc' : '#6366f1', flexShrink: 0 }}
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
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`,
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
                background: isDark ? 'rgba(255,255,255,0.08)' : '#ede9fe',
                color: isDark ? '#e2e8f0' : '#5b21b6',
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
                  background: isDark ? 'rgba(16,185,129,0.12)' : '#d1fae5',
                  color: isDark ? '#6ee7b7' : '#065f46',
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
                  background: isDark ? 'rgba(245,158,11,0.14)' : '#fef9c3',
                  color: isDark ? '#fcd34d' : '#92400e',
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
              borderRadius: 10,
              border: 'none',
              background: '#6366f1',
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
            color: isDark ? '#6ee7b7' : '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ✓ Campos preenchidos automaticamente
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
            background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb',
            border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : '#fde68a'}`,
          }}
        >
          <AlertTriangle
            size={13}
            style={{ color: isDark ? '#fcd34d' : '#d97706', flexShrink: 0 }}
          />
          <span style={{ fontSize: 11, color: isDark ? '#fcd34d' : '#92400e', fontWeight: 600 }}>
            {valueAlert}
          </span>
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
            background: isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : '#c7d2fe'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} style={{ color: isDark ? '#a5b4fc' : '#4338ca', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: isDark ? '#a5b4fc' : '#4338ca', fontWeight: 600 }}>
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
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: isDark ? 'rgba(99,102,241,0.2)' : '#c7d2fe',
              color: isDark ? '#a5b4fc' : '#3730a3',
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
