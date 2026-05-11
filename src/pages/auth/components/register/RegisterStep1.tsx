import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { TextInput } from '@/components/ui/TextInput';
import type { Step1Props } from './types';

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Um caractere especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function RegisterStep1({
  register,
  setValue,
  errors,
  password,
  showPassword,
  setShowPassword,
  focused,
  setFocused,
  onSubmit,
}: Step1Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const showRules = focused === 'password' || password.length > 0;
  const [localPasswordFocused, setLocalPasswordFocused] = useState(false);

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <TextInput
        label="Nome completo"
        required
        placeholder="Seu nome e sobrenome"
        icon={<User size={16} />}
        error={errors.name}
        {...register('name')}
        onFocus={() => setFocused('name')}
        onBlur={() => setFocused(null)}
      />

      <TextInput
        label="Email"
        required
        type="email"
        placeholder="seu@exemplo.com"
        icon={<Mail size={16} />}
        error={errors.email}
        {...register('email')}
        onChange={(e) => setValue('email', e.target.value.toLowerCase(), { shouldValidate: true })}
        onFocus={() => setFocused('email')}
        onBlur={() => setFocused(null)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <TextInput
          label="Senha"
          required
          type={showPassword ? 'text' : 'password'}
          placeholder="Crie uma senha segura"
          icon={<Lock size={16} />}
          error={errors.password}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                color: t.text.muted,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          {...register('password')}
          onFocus={() => {
            setFocused('password');
            setLocalPasswordFocused(true);
          }}
          onBlur={() => {
            setFocused(null);
            setLocalPasswordFocused(false);
          }}
        />

        {(localPasswordFocused || showRules) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '5px 8px',
              padding: '10px 12px',
              borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            }}
          >
            {PASSWORD_RULES.map(({ label, test }) => {
              const ok = test(password);
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: ok ? '#22c55e' : isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                      transition: 'background 0.2s',
                    }}
                  >
                    {ok && (
                      <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, lineHeight: 1 }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: ok ? '#22c55e' : t.text.muted,
                      transition: 'color 0.2s',
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="submit"
        style={{
          width: '100%',
          height: 46,
          borderRadius: 12,
          border: 'none',
          marginTop: 4,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          transition: 'opacity 0.18s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
        }}
      >
        Continuar <ChevronRight size={15} />
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: t.text.muted, margin: 0 }}>
        Já tem uma conta?{' '}
        <Link to="/login" style={{ color: t.text.link, fontWeight: 600, textDecoration: 'none' }}>
          Entrar
        </Link>
      </p>
    </form>
  );
}
