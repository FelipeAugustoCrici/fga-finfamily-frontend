import { ReactNode } from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';
import { useTheme } from '@/hooks/useTheme';

interface AuthLayoutProps {
  children: ReactNode;
  maxWidth?: number;
}

export function AuthLayout({ children, maxWidth = 420 }: AuthLayoutProps) {
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const { toggle } = useTheme();

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
      <div style={{ width: '100%', maxWidth }}>
        {}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
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
              marginBottom: 14,
            }}
          >
            <Sparkles size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: t.text.primary, margin: 0 }}>
            FinFamily
          </h1>
        </div>

        {}
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 20,
            padding: '28px 28px 24px',
            boxShadow: t.shadow.cardLg,
          }}
        >
          {children}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
