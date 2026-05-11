import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { Input } from './Input';

interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  value?: string | number;
  onChange?: (value: string) => void;
}

function formatCurrency(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = parseFloat(numbers) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function unformatCurrency(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '0';
  return (parseFloat(numbers) / 100).toFixed(2);
}

function numericToDisplay(value: string | number | undefined): string {
  if (value === undefined || value === '' || value === '0' || value === '0.00') return '';
  const numValue = typeof value === 'number' ? value.toString() : value;
  const parsed = parseFloat(numValue);
  if (isNaN(parsed) || parsed === 0) return '';
  const valueInCents = Math.round(parsed * 100).toString();
  return formatCurrency(valueInCents);
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, icon, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => numericToDisplay(value));
    const isFocused = useRef(false);

    useEffect(() => {
      if (!isFocused.current) {
        setDisplayValue(numericToDisplay(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCurrency(e.target.value);
      setDisplayValue(formatted);
      if (onChange) {
        onChange(unformatCurrency(e.target.value));
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        label={label}
        error={error}
        icon={icon}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={(e) => {
          isFocused.current = true;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          isFocused.current = false;
          props.onBlur?.(e);
        }}
      />
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';
