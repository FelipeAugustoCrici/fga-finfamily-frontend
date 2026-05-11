import { useLocation, useNavigate } from 'react-router-dom';
import { confirmSignIn, fetchAuthSession } from 'aws-amplify/auth';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from './components/AuthLayout';
import { Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  });

type FormValues = z.infer<typeof schema>;

const rules = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Número', test: (v: string) => /\d/.test(v) },
];

export function NewPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const methods = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange' });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = methods;

  const passwordValue = watch('password') ?? '';

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      await confirmSignIn({ challengeResponse: values.password });
      await fetchAuthSession();
      reset();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao definir nova senha.');
    } finally {
      setLoading(false);
    }
  }

  if (!state?.user) {
    return (
      <AuthLayout>
        <p style={{ textAlign: 'center', color: isDark ? '#fca5a5' : '#991b1b', fontSize: 14 }}>
          Fluxo inválido.{' '}
          <a href="/login" style={{ color: t.text.link }}>
            Voltar ao login
          </a>
        </p>
      </AuthLayout>
    );
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    height: 46,
    padding: '0 42px 0 42px',
    borderRadius: 12,
    border: `1.5px solid ${
      errors[field as keyof FormValues]
        ? isDark
          ? 'rgba(252,165,165,0.6)'
          : '#fca5a5'
        : focused === field
          ? t.border.focus
          : t.border.input
    }`,
    background: t.bg.input,
    color: t.text.primary,
    fontSize: 14,
    outline: 'none',
    boxShadow: focused === field ? t.shadow.focus : 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    boxSizing: 'border-box' as const,
  });

  return (
    <AuthLayout>
      {}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 14,
            background: isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff',
            marginBottom: 12,
          }}
        >
          <Lock size={22} color="#6366f1" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text.primary, margin: 0 }}>
          Defina sua nova senha
        </h2>
        <p style={{ fontSize: 13, color: t.text.muted, marginTop: 6 }}>
          Escolha uma senha segura para continuar
        </p>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>
              Nova senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 13,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focused === 'password' ? t.border.focus : t.text.muted,
                  pointerEvents: 'none',
                  transition: 'color 0.18s',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                style={inputStyle('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
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
            </div>

            {}
            {passwordValue.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
                {rules.map((rule) => {
                  const ok = rule.test(passwordValue);
                  return (
                    <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: ok
                            ? '#10b981'
                            : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#f1f5f9',
                          transition: 'background 0.2s',
                        }}
                      >
                        {ok && <Check size={10} color="#fff" />}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: ok ? (isDark ? '#6ee7b7' : '#166534') : t.text.muted,
                        }}
                      >
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {errors.password && (
              <p style={{ fontSize: 11, color: isDark ? '#fca5a5' : '#991b1b', marginLeft: 2 }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>
              Confirmar senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 13,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focused === 'confirmPassword' ? t.border.focus : t.text.muted,
                  pointerEvents: 'none',
                  transition: 'color 0.18s',
                }}
              />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                onFocus={() => setFocused('confirmPassword')}
                onBlur={() => setFocused(null)}
                style={inputStyle('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  color: t.text.muted,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ fontSize: 11, color: isDark ? '#fca5a5' : '#991b1b', marginLeft: 2 }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: isDark ? 'rgba(252,165,165,0.08)' : '#fef2f2',
                border: `1px solid ${isDark ? 'rgba(252,165,165,0.2)' : '#fecdd3'}`,
                fontSize: 13,
                color: isDark ? '#fca5a5' : '#991b1b',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 46,
              borderRadius: 12,
              border: 'none',
              background: loading
                ? isDark
                  ? 'rgba(99,102,241,0.4)'
                  : '#a5b4fc'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: loading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
              transition: 'opacity 0.18s',
              marginTop: 4,
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1';
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Salvando...
              </>
            ) : (
              'Salvar senha'
            )}
          </button>
        </form>
      </FormProvider>
    </AuthLayout>
  );
}
