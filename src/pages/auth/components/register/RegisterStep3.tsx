import { KeyRound, Loader2 } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import type { Step3Props } from './types';

export function RegisterStep3({
  email,
  code,
  setCode,
  loading,
  error,
  onSubmit,
  focused,
  setFocused,
}: Step3Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 14,
            background: isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff',
            marginBottom: 10,
          }}
        >
          <KeyRound size={22} color="#6366f1" />
        </div>
        <p style={{ fontSize: 13, color: t.text.secondary, margin: 0 }}>Enviamos um código para</p>
        <p style={{ fontSize: 14, fontWeight: 700, color: t.text.primary, marginTop: 2 }}>
          {email}
        </p>
      </div>

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
          maxLength={6}
          style={{
            width: '100%',
            height: 56,
            padding: '0 16px',
            borderRadius: 12,
            border: `1.5px solid ${focused === 'code' ? t.border.focus : t.border.input}`,
            background: t.bg.input,
            color: t.text.primary,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.35em',
            textAlign: 'center',
            outline: 'none',
            boxShadow: focused === 'code' ? t.shadow.focus : 'none',
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
          color: '#fff',
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
        onMouseEnter={(e) => {
          if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
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
  );
}
