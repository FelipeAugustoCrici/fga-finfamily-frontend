import React from 'react';
import { Plus } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

interface ActionButtonProps {
  onClick?: () => void;
  children: React.ReactNode;

  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function ActionButton({
  onClick,
  children,
  variant = 'primary',
  icon = <Plus size={15} />,
  disabled = false,
  type = 'button',
}: ActionButtonProps) {
  const t = useTokens();

  if (variant === 'secondary') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '9px 16px',
          borderRadius: 999,
          border: `1px solid ${t.border.default}`,
          background: t.bg.card,
          color: t.text.secondary,
          fontSize: 13,
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.55 : 1,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.background = t.bg.muted;
        }}
        onMouseLeave={(e) => {
          if (!disabled) e.currentTarget.style.background = t.bg.card;
        }}
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 18px',
        borderRadius: 999,
        border: 'none',
        background: t.text.primary,
        color: t.bg.card,
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: t.shadow.card,
        opacity: disabled ? 0.55 : 1,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = '0.88';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = '1';
      }}
    >
      {icon}
      {children}
    </button>
  );
}
