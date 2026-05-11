import { Link } from 'react-router-dom';
import { Phone, CreditCard, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { TextInput } from '@/components/ui/TextInput';
import { useTokens } from '@/hooks/useTokens';
import type { Step2Props } from './types';

export function RegisterStep2({
  phone,
  setPhone,
  cpf,
  setCpf,
  birthDate,
  setBirthDate,
  loading,
  error,
  onBack,
  onSubmit,
  focused: _focused,
  setFocused,
}: Step2Props) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <TextInput
        label="Telefone"
        optional
        placeholder="(00) 00000-0000"
        icon={<Phone size={16} />}
        value={phone}
        onFocus={() => setFocused('phone')}
        onBlur={() => setFocused(null)}
        onChange={(e) => {
          let v = e.target.value.replace(/\D/g, '').slice(0, 11);
          if (v.length <= 10) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
          else v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
          setPhone(v);
        }}
      />

      <TextInput
        label="CPF"
        optional
        placeholder="000.000.000-00"
        icon={<CreditCard size={16} />}
        value={cpf}
        onFocus={() => setFocused('cpf')}
        onBlur={() => setFocused(null)}
        onChange={(e) => {
          const v = e.target.value
            .replace(/\D/g, '')
            .slice(0, 11)
            .replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
          setCpf(v);
        }}
      />

      <DatePicker
        label="Data de nascimento"
        optional
        placeholder="Selecione sua data de nascimento"
        value={birthDate}
        onChange={(v) => setBirthDate(v)}
        max={new Date().toISOString().split('T')[0]}
      />

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

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            height: 46,
            padding: '0 18px',
            borderRadius: 12,
            border: `1.5px solid ${t.border.input}`,
            background: 'transparent',
            color: t.text.secondary,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.muted)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <ChevronLeft size={15} /> Voltar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            height: 46,
            borderRadius: 12,
            border: 'none',
            background: loading
              ? isDark
                ? 'rgba(99,102,241,0.4)'
                : '#a5b4fc'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
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
          onMouseEnter={(e) => {
            if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Criando
              conta...
            </>
          ) : (
            <>
              Criar conta <ChevronRight size={15} />
            </>
          )}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: t.text.muted, margin: 0 }}>
        Já tem uma conta?{' '}
        <Link to="/login" style={{ color: t.text.link, fontWeight: 600, textDecoration: 'none' }}>
          Entrar
        </Link>
      </p>
    </form>
  );
}
