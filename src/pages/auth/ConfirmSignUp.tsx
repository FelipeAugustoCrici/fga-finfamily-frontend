import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSignUp } from './hooks/useSignUp';
import { AuthLayout } from './components/AuthLayout';
import { KeyRound, Loader2 } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

export function ConfirmSignUp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { confirm, loading } = useSignUp();
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await confirm(
        state.email,
        code,
        state.password,
        state.name,
        state.phone,
        state.cpf,
        state.birthDate,
      );
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar cadastro.');
    }
  }

  if (!state?.email || !state?.password || !state?.name) {
    return (
      <AuthLayout>
        <p style={{ textAlign: 'center', color: isDark ? '#fca5a5' : '#991b1b', fontSize: 14 }}>
          Fluxo inválido.{' '}
          <a href="/register" style={{ color: t.text.link }}>
            Voltar ao cadastro
          </a>
        </p>
      </AuthLayout>
    );
  }

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
          <KeyRound size={22} color="#6366f1" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text.primary, margin: 0 }}>
          Confirmar cadastro
        </h2>
        <p style={{ fontSize: 13, color: t.text.muted, marginTop: 6 }}>
          Digite o código enviado para{' '}
          <span style={{ color: t.text.secondary, fontWeight: 600 }}>{state.email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>
            Código de verificação
          </label>
          <input
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required
            maxLength={6}
            style={{
              width: '100%',
              height: 52,
              padding: '0 16px',
              borderRadius: 12,
              border: `1.5px solid ${focused ? t.border.focus : t.border.input}`,
              background: t.bg.input,
              color: t.text.primary,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.3em',
              textAlign: 'center',
              outline: 'none',
              boxShadow: focused ? t.shadow.focus : 'none',
              transition: 'border-color 0.18s, box-shadow 0.18s',
              boxSizing: 'border-box',
            }}
          />
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
          disabled={loading || code.length < 6}
          style={{
            width: '100%',
            height: 46,
            borderRadius: 12,
            border: 'none',
            background:
              loading || code.length < 6
                ? isDark
                  ? 'rgba(99,102,241,0.4)'
                  : '#a5b4fc'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 700,
            cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: loading || code.length < 6 ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
            transition: 'opacity 0.18s',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Confirmando...
            </>
          ) : (
            'Confirmar cadastro'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
