import { useState } from 'react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from './components/AuthLayout';
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2, ChevronLeft } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

export function ForgotPassword() {
  const navigate = useNavigate();
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ username: email });
      setStep('confirm');
    } catch {
      setError('Erro ao solicitar código. Verifique o email informado.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: password,
      });
      navigate('/login');
    } catch {
      setError('Código inválido ou senha não atende aos requisitos.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field: string, pl = 42) => ({
    width: '100%',
    height: 46,
    padding: `0 14px 0 ${pl}px`,
    borderRadius: 12,
    border: `1.5px solid ${focused === field ? t.border.focus : t.border.input}`,
    background: t.bg.input,
    color: t.text.primary,
    fontSize: 14,
    outline: 'none',
    boxShadow: focused === field ? t.shadow.focus : 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
    boxSizing: 'border-box' as const,
  });

  const iconStyle = (field: string) => ({
    position: 'absolute' as const,
    left: 13,
    top: '50%',
    transform: 'translateY(-50%)',
    color: focused === field ? t.border.focus : t.text.muted,
    pointerEvents: 'none' as const,
    transition: 'color 0.18s',
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
          {step === 'request' ? (
            <Mail size={22} color="#6366f1" />
          ) : (
            <KeyRound size={22} color="#6366f1" />
          )}
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: t.text.primary, margin: 0 }}>
          {step === 'request' ? 'Recuperar senha' : 'Nova senha'}
        </h2>
        <p style={{ fontSize: 13, color: t.text.muted, marginTop: 6 }}>
          {step === 'request' ? (
            'Informe seu email para receber o código de recuperação'
          ) : (
            <>
              Código enviado para{' '}
              <span style={{ color: t.text.secondary, fontWeight: 600 }}>{email}</span>
            </>
          )}
        </p>
      </div>

      {step === 'request' ? (
        <form
          onSubmit={handleRequest}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={iconStyle('email')} />
              <input
                type="email"
                placeholder="seu@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                required
                style={inputStyle('email')}
              />
            </div>
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
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enviando...
              </>
            ) : (
              'Enviar código'
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: t.text.muted, margin: 0 }}>
            <Link
              to="/login"
              style={{
                color: t.text.link,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ChevronLeft size={13} /> Voltar ao login
            </Link>
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleConfirm}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>
              Código de verificação
            </label>
            <input
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onFocus={() => setFocused('code')}
              onBlur={() => setFocused(null)}
              required
              maxLength={6}
              style={{
                width: '100%',
                height: 52,
                padding: '0 16px',
                borderRadius: 12,
                border: `1.5px solid ${focused === 'code' ? t.border.focus : t.border.input}`,
                background: t.bg.input,
                color: t.text.primary,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.3em',
                textAlign: 'center',
                outline: 'none',
                boxShadow: focused === 'code' ? t.shadow.focus : 'none',
                transition: 'border-color 0.18s, box-shadow 0.18s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: t.text.secondary }}>
              Nova senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={iconStyle('password')} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
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
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Salvando...
              </>
            ) : (
              'Salvar nova senha'
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: t.text.muted, margin: 0 }}>
            <button
              type="button"
              onClick={() => setStep('request')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: t.text.link,
                fontWeight: 600,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ChevronLeft size={13} /> Reenviar código
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
