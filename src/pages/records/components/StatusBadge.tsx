import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/components/ui/Button';
import { useTokens } from '@/hooks/useTokens';
import { RecordStatus } from '../types/record.types';

interface StatusBadgeProps {
  status: RecordStatus;
  onChange: (status: RecordStatus) => void;
  disabled?: boolean;
}

export function StatusBadge({ status, onChange, disabled }: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const t = useTokens();

  const statusConfig = {
    PENDING: {
      label: 'Pendente',
      icon: Clock,
      style: {
        background: t.warning.bg,
        color: t.warning.text,
        border: `1px solid ${t.warning.border}`,
      },
    },
    PAID: {
      label: 'Pago',
      icon: Check,
      style: {
        background: 'rgba(34,197,94,0.12)',
        color: '#4ade80',
        border: '1px solid rgba(34,197,94,0.2)',
      },
    },
    OVERDUE: {
      label: 'Atrasado',
      icon: AlertCircle,
      style: {
        background: t.expense.bgIcon,
        color: t.expense.text,
        border: `1px solid ${t.expense.border}`,
      },
    },
  };

  const current = statusConfig[status || 'PENDING'];
  const Icon = current.icon;

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setIsOpen((o) => !o);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
          !disabled && 'cursor-pointer hover:opacity-80',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        style={current.style}
      >
        <Icon size={12} />
        <span>{current.label}</span>
        {!disabled && (
          <ChevronDown size={11} className={cn('transition-transform', isOpen && 'rotate-180')} />
        )}
      </button>

      {isOpen &&
        !disabled &&
        createPortal(
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            />
            <div
              style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                zIndex: 9999,
                width: 144,
                borderRadius: 12,
                paddingTop: 6,
                paddingBottom: 6,
                overflow: 'hidden',
                background: t.bg.card,
                border: `1px solid ${t.border.default}`,
                boxShadow: t.shadow.drop,
              }}
            >
              {(Object.keys(statusConfig) as RecordStatus[]).map((key) => {
                const cfg = statusConfig[key];
                const StatusIcon = cfg.icon;
                const isSelected = key === status;
                return (
                  <button
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(key);
                      setIsOpen(false);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors duration-150"
                    style={{
                      color: cfg.style.color,
                      background: isSelected ? cfg.style.background : 'transparent',
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
                    <StatusIcon size={13} />
                    <span>{cfg.label}</span>
                    {isSelected && <Check size={11} className="ml-auto" />}
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
