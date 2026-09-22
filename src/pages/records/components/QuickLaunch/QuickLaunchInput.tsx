import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Loader2,
  X,
  ArrowRight,
  Pencil,
  Check,
  ShoppingCart,
  Fuel,
  Wallet,
  UtensilsCrossed,
  Car,
} from 'lucide-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/pages/categories/hooks/useCategories';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useQuery } from '@tanstack/react-query';
import { familyService } from '@/pages/families/services/families.service';
import { useCreateRecord } from '../../hooks/useCreateRecord';
import { parseQuickLaunch, resolveCategoryName } from './quickLaunch.parser';
import { QuickLaunchPreview } from './QuickLaunchPreview';
import { useTokens } from '@/hooks/useTokens';
import { useTheme } from '@/hooks/useTheme';

const PLACEHOLDERS = [
  'gastei 120 no mercado',
  'recebi 3000 de salário',
  'paguei 50 de gasolina e 30 no ifood',
  'netflix 45',
  'uber 18 ontem',
];

const QUICK_HINTS = [
  { icon: ShoppingCart, label: 'Mercado', text: 'mercado 120' },
  { icon: Fuel, label: 'Gasolina', text: 'gasolina 80' },
  { icon: Wallet, label: 'Salário', text: 'recebi salário 3000' },
  { icon: UtensilsCrossed, label: 'iFood', text: 'ifood 45' },
  { icon: Car, label: 'Uber', text: 'uber 18' },
];

export function QuickLaunchInput() {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [editedDescription, setEditedDescription] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const t = useTokens();
  const navigate = useNavigate();

  const { data: userInfo } = useUserInfo();
  const { data: categories = [] } = useCategories();
  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: () => familyService.list(),
  });

  const members: { id: string; name: string; email?: string }[] = families.flatMap(
    (f: any) => f.members ?? [],
  );
  const loggedMemberId =
    members.find((m: any) => m.email && userInfo?.email && m.email === userInfo.email)?.id ??
    members[0]?.id ??
    '';

  const createRecord = useCreateRecord();

  // Rotate placeholder
  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const parsed = parseQuickLaunch(text, members, categories);
  const activeDescription = editedDescription ?? parsed.description;
  const categoryName = resolveCategoryName(parsed.categoryHint, categories);
  const personName = members.find((m) => m.id === parsed.personHint)?.name ?? null;

  const todayStr = moment().format('YYYY-MM-DD');
  const yesterdayStr = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const tomorrowStr = moment().add(1, 'days').format('YYYY-MM-DD');
  const dateLabel =
    parsed.date === todayStr
      ? 'Hoje'
      : parsed.date === yesterdayStr
        ? 'Ontem'
        : parsed.date === tomorrowStr
          ? 'Amanhã'
          : parsed.date.split('-').reverse().join('/');

  const canSave = activeDescription.length > 0 && parsed.amount !== null;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    const familyId = families[0]?.id ?? '';
    const resolvedCategoryId =
      parsed.categoryHint && categories.find((c) => c.id === parsed.categoryHint)
        ? parsed.categoryHint
        : undefined;
    const resolvedCategoryName = categoryName ?? 'Outro';

    createRecord.mutate(
      {
        description: activeDescription,
        value: String(parsed.amount),
        date: parsed.date,
        type: parsed.type,
        categoryId: resolvedCategoryId,
        categoryName: resolvedCategoryName,
        personId: parsed.personHint ?? loggedMemberId,
        familyId,
        isRecurring: false,
      } as any,
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => {
            setText('');
            setEditedDescription(null);
            setOpen(false);
            setSaved(false);
            inputRef.current?.focus();
          }, 1200);
        },
      },
    );
  }, [
    canSave,
    parsed,
    families,
    categories,
    categoryName,
    createRecord,
    activeDescription,
    loggedMemberId,
  ]);

  const handleEditFirst = () => {
    if (!parsed.description && !text.trim()) return;
    const params = new URLSearchParams({
      description: activeDescription,
      value: parsed.amount?.toString() ?? '',
      type: parsed.type,
      categoryId: parsed.categoryHint ?? '',
      categoryName: categoryName ?? '',
      personId: parsed.personHint ?? loggedMemberId,
      date: parsed.date,
    });
    navigate(`/record/create?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSave) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setText('');
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const reset = () => {
    setText('');
    setEditedDescription(null);
    setOpen(false);
    setSaved(false);
  };

  const isActive = focused || open;
  const borderColor = isActive ? t.quickInput.borderFocus : t.quickInput.border;
  const boxShadow = isActive ? t.quickInput.shadow : 'none';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} data-quick-launch>
      {/* Main input card */}
      <div
        style={{
          background: isDark ? 'rgba(92,185,138,0.07)' : '#e7f0e9',
          border: `2px solid ${borderColor}`,
          borderRadius: open ? '20px 20px 0 0' : 20,
          boxShadow,
          transition: 'all 0.2s ease',
          padding: '0 16px',
          minHeight: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            flexShrink: 0,
            background: isActive
              ? t.quickInput.borderFocus
              : isDark
                ? 'rgba(92,185,138,0.2)'
                : t.income.bgIcon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            transform: isActive ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <Sparkles
            size={16}
            color={isActive ? '#fff' : isDark ? t.income.textAlt : t.income.text}
          />
        </div>

        {/* Label + input stacked */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '10px 0',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: isDark ? t.income.textAlt : t.income.text,
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            Registrar com IA · digite o gasto ou ganho
          </span>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setEditedDescription(null);
              setSaved(false);
              setOpen(e.target.value.length > 0);
            }}
            onFocus={() => {
              setFocused(true);
              if (text.length > 0) setOpen(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={`Ex: "${PLACEHOLDERS[placeholderIdx]}"`}
            autoComplete="off"
            style={
              {
                background: 'transparent',
                WebkitBoxShadow: '0 0 0px 1000px transparent inset',
                WebkitTextFillColor: t.text.primary,
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: t.text.primary,
                width: '100%',
                fontWeight: text ? 500 : 400,
                caretColor: t.text.primary,
              } as React.CSSProperties
            }
          />
        </div>

        {/* Right side */}
        {saved ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 700,
              color: isDark ? '#6ee7b7' : '#059669',
              flexShrink: 0,
            }}
          >
            <Check size={13} strokeWidth={3} />
            Salvo!
          </span>
        ) : text.length > 0 ? (
          <button
            type="button"
            onClick={reset}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: t.text.muted,
              padding: 4,
              borderRadius: 8,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        ) : (
          <span
            style={{ fontSize: 11, color: t.text.subtle, flexShrink: 0, display: 'none' }}
            className="sm:block"
          >
            Enter para salvar
          </span>
        )}
      </div>

      {/* Dropdown panel */}
      {open && text.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            background: t.quickInput.dropBg,
            border: `2px solid ${borderColor}`,
            borderTop: `1px solid ${isDark ? 'rgba(92,185,138,0.15)' : t.income.border}`,
            borderRadius: '0 0 20px 20px',
            boxShadow: t.quickInput.dropShadow,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Preview */}
          <QuickLaunchPreview
            parsed={parsed}
            categoryName={categoryName}
            personName={personName}
            dateLabel={dateLabel}
            description={activeDescription}
            onDescriptionChange={setEditedDescription}
          />

          {/* Missing fields warning */}
          {parsed.missingFields.length > 0 && (
            <p
              style={{
                fontSize: 11,
                borderRadius: 10,
                padding: '7px 12px',
                color: t.warning.text,
                background: t.warning.bg,
                border: `1px solid ${t.warning.border}`,
              }}
            >
              Faltando:{' '}
              {parsed.missingFields
                .map((f) => ({ description: 'descrição', amount: 'valor' })[f] ?? f)
                .join(', ')}
            </p>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={!canSave || createRecord.isPending}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '11px 16px',
                borderRadius: 12,
                border: 'none',
                background: canSave ? t.quickInput.borderFocus : t.bg.mutedStrong,
                color: canSave ? '#fff' : t.text.disabled,
                fontSize: 13,
                fontWeight: 700,
                cursor: canSave ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (canSave) (e.currentTarget as HTMLElement).style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              {createRecord.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ArrowRight size={14} />
              )}
              {createRecord.isPending ? 'Salvando...' : 'Confirmar lançamento'}
            </button>

            <button
              onClick={handleEditFirst}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '11px 14px',
                borderRadius: 999,
                border: `1px solid ${isDark ? 'rgba(92,185,138,0.3)' : t.income.border}`,
                background: isDark ? 'rgba(92,185,138,0.08)' : t.income.bg,
                color: t.income.text,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              <Pencil size={13} /> Editar
            </button>

            <button
              onClick={reset}
              style={{
                padding: '11px 12px',
                borderRadius: 999,
                border: 'none',
                background: 'none',
                color: t.text.muted,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Tip */}
          <p style={{ fontSize: 11, textAlign: 'center', color: t.text.subtle }}>
            Dica: "recebi 2500 de salário" · "mercado 80 ontem" · "uber 18 e ifood 45"
          </p>
        </div>
      )}

      {/* Quick hints — shown when not typing */}
      {!open && !text && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {QUICK_HINTS.map((hint) => (
            <button
              key={hint.text}
              type="button"
              onClick={() => {
                setText(hint.text);
                setOpen(true);
                inputRef.current?.focus();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 999,
                border: `1px solid ${isDark ? 'rgba(92,185,138,0.2)' : t.income.border}`,
                background: isDark ? 'rgba(92,185,138,0.06)' : t.income.bg,
                color: t.income.text,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = isDark
                  ? 'rgba(92,185,138,0.15)'
                  : t.income.bgIcon;
                (e.currentTarget as HTMLElement).style.borderColor = t.income.textAlt;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = isDark
                  ? 'rgba(92,185,138,0.06)'
                  : t.income.bg;
                (e.currentTarget as HTMLElement).style.borderColor = isDark
                  ? 'rgba(92,185,138,0.2)'
                  : t.income.border;
              }}
            >
              <hint.icon size={11} />
              {hint.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
