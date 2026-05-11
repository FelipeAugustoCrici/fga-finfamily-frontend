import { useState } from 'react';
import { login } from '@/services/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, Sun, Moon } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useTheme } from '@/hooks/useTheme';

export function Login() {
  const navigate = useNavigate();
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const { toggle } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result?.status === 'NEW_PASSWORD_REQUIRED') {
        navigate('/new-password', { state: { user: result.user } });
        return;
      }
      if (result?.status === 'CONFIRM_SIGN_UP') {
        navigate('/confirm-signup', { state: { email } });
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    height: 46,
    padding: '0 14px 0 42px',
    borderRadius: 12,
    border: `1.5px solid ${focusedField === field ? t.border.focus : t.border.input}`,
    background: t.bg.input,
    color: t.text.primary,
    fontSize: 14,
    outline: 'none',
    boxShadow: focusedField === field ? t.shadow.focus : 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    boxSizing: 'border-box' as const,
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        position: 'relative',
        background: isDark
          ? 'radial-gradient(ellipse at 60% 0%, rgba(99,102,241,0.12) 0%, #020617 55%)'
          : 'radial-gradient(ellipse at 60% 0%, rgba(99,102,241,0.07) 0%, #f1f5f9 55%)',
      }}
    >
      {}
      <button
        onClick={toggle}
        title={isDark ? 'Modo claro' : 'Modo escuro'}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          width: 38,
          height: 38,
          borderRadius: 10,
          border: `1px solid ${t.border.default}`,
          background: t.bg.card,
          color: t.text.muted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: t.shadow.card,
          transition: 'background 0.2s, color 0.2s',
          zIndex: 100,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = t.text.primary;
          (e.currentTarget as HTMLElement).style.background = t.bg.cardHover;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = t.text.muted;
          (e.currentTarget as HTMLElement).style.background = t.bg.card;
        }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              marginBottom: 16,
            }}
          >
            <Sparkles size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: t.text.primary, margin: 0 }}>
            FinFamily
          </h1>
          <p style={{ fontSize: 14, color: t.text.muted, marginTop: 6 }}>
            Gerencie as finanças da sua família de forma simples e inteligente
          </p>
        </div>

        {}
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 20,
            padding: '32px 28px',
            boxShadow: t.shadow.cardLg,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text.primary, marginBottom: 4 }}>
            Bem-vindo de volta
          </h2>
          <p style={{ fontSize: 13, color: t.text.muted, marginBottom: 24 }}>
            Entre na sua conta para continuar
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 13,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: focusedField === 'email' ? t.border.focus : t.text.muted,
                    pointerEvents: 'none',
                    transition: 'color 0.18s',
                  }}
                />
                <input
                  type="email"
                  placeholder="seu@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle('email')}
                />
              </div>
            </div>

            {}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <label style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>
                  Senha
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: 12, color: t.text.link, textDecoration: 'none' }}
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 13,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: focusedField === 'password' ? t.border.focus : t.text.muted,
                    pointerEvents: 'none',
                    transition: 'color 0.18s',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ ...inputStyle('password'), paddingRight: 42 }}
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
            </div>

            {}
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

            {}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: 46,
                borderRadius: 12,
                border: 'none',
                background: isLoading
                  ? isDark
                    ? 'rgba(99,102,241,0.5)'
                    : '#a5b4fc'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                transition: 'opacity 0.18s, box-shadow 0.18s',
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) (e.currentTarget as HTMLElement).style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>

            {}
            <p style={{ textAlign: 'center', fontSize: 13, color: t.text.muted, margin: 0 }}>
              Não tem uma conta?{' '}
              <Link
                to="/register"
                style={{ color: t.text.link, fontWeight: 600, textDecoration: 'none' }}
              >
                Cadastre-se grátis
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
