import React, { useState, useId } from 'react';
import { useTokens } from '@/hooks/useTokens';

type FormError = string | { message?: string } | undefined;

function getErrorMessage(error?: FormError) {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  return error.message;
}

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: FormError;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightElement,
      required,
      optional,
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const t = useTokens();
    const id = useId();
    const [focused, setFocused] = useState(false);
    const errorMessage = getErrorMessage(error);

    const pl = icon ? 42 : 14;
    const pr = rightElement ? 42 : 14;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: t.text.secondary,
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

        <div style={{ position: 'relative' }}>
          {icon && (
            <span
              style={{
                position: 'absolute',
                left: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                color: focused ? t.border.focus : t.text.muted,
                pointerEvents: 'none',
                transition: 'color 0.18s',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={{
              width: '100%',
              height: 46,
              padding: `0 ${pr}px 0 ${pl}px`,
              borderRadius: 12,
              border: `1.5px solid ${errorMessage ? '#ef4444' : focused ? t.border.focus : t.border.input}`,
              background: t.bg.input,
              color: t.text.primary,
              fontSize: 14,
              outline: 'none',
              boxShadow: errorMessage
                ? '0 0 0 3px rgba(239,68,68,0.12)'
                : focused
                  ? t.shadow.focus
                  : 'none',
              transition: 'border-color 0.18s, box-shadow 0.18s',
              boxSizing: 'border-box',
              ...style,
            }}
            {...props}
          />

          {rightElement && (
            <span
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightElement}
            </span>
          )}
        </div>

        {(errorMessage || helperText) && (
          <span
            style={{ fontSize: 12, color: errorMessage ? '#ef4444' : t.text.muted, marginTop: 2 }}
          >
            {errorMessage || helperText}
          </span>
        )}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';
