import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useSignUp } from './hooks/useSignUp';
import { registerStep1Schema, type RegisterStep1Data } from './schemas/register.schema';
import { translateAuthError } from './services/auth.errors';
import { RegisterStep1 } from './components/register/RegisterStep1';
import { RegisterStep2 } from './components/register/RegisterStep2';
import { RegisterStep3 } from './components/register/RegisterStep3';
import { useTokens } from '@/hooks/useTokens';
import { useTheme } from '@/hooks/useTheme';

const STEPS = ['Dados pessoais', 'Contato', 'Confirmação'];

export function Register() {
  const navigate = useNavigate();
  const { signUp, confirm, stopLoading, loading } = useSignUp();
  const t = useTokens();
  const isDark = t.bg.page === '#020617';
  const { toggle } = useTheme();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onTouched',
  });

  const password = watch('password', '');

  async function onStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const { email, password: pwd, name } = getValues();
    try {
      const result = await signUp(email, pwd, name);
      if (result?.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') setStep(3);
      else navigate('/login', { replace: true });
    } catch (err: unknown) {
      setSubmitError(translateAuthError(err));
    } finally {
      stopLoading();
    }
  }

  async function onStep3Submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const { email, password: pwd, name } = getValues();
    try {
      await confirm(email, code, pwd, name, phone, cpf, birthDate);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setSubmitError(translateAuthError(err));
    }
  }

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
          ? 'radial-gradient(ellipse at 40% 0%, rgba(99,102,241,0.12) 0%, #020617 55%)'
          : 'radial-gradient(ellipse at 40% 0%, rgba(99,102,241,0.07) 0%, #f1f5f9 55%)',
      }}
    >
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

      <div style={{ width: '100%', maxWidth: 440 }}>
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
          <h1 style={{ fontSize: 24, fontWeight: 800, color: t.text.primary, margin: 0 }}>
            Criar sua conta
          </h1>
          <p style={{ fontSize: 13, color: t.text.muted, marginTop: 6 }}>
            Comece a organizar as finanças da sua família hoje
          </p>
        </div>

        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 20,
            padding: '28px 28px 24px',
            boxShadow: t.shadow.cardLg,
          }}
        >
          {/* Steps indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            {STEPS.map((label, i) => {
              const idx = i + 1;
              const isActive = step === idx;
              const isDone = step > idx;
              const isLast = idx === STEPS.length;
              return (
                <div
                  key={idx}
                  style={{ display: 'flex', alignItems: 'center', flex: isLast ? 'none' : 1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDone
                          ? '#6366f1'
                          : isActive
                            ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                            : t.bg.muted,
                        color: isDone || isActive ? '#fff' : t.text.muted,
                        boxShadow: isActive ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isDone ? '✓' : idx}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? t.text.primary : t.text.muted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        margin: '0 8px',
                        background: isDone ? '#6366f1' : t.border.divider,
                        transition: 'background 0.3s',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <RegisterStep1
              register={register}
              setValue={setValue}
              errors={errors}
              password={password}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              focused={focused}
              setFocused={setFocused}
              onSubmit={handleSubmit(() => {
                setSubmitError(null);
                setStep(2);
              })}
            />
          )}

          {step === 2 && (
            <RegisterStep2
              phone={phone}
              setPhone={setPhone}
              cpf={cpf}
              setCpf={setCpf}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              loading={loading}
              error={submitError}
              onBack={() => setStep(1)}
              onSubmit={onStep2Submit}
              focused={focused}
              setFocused={setFocused}
            />
          )}

          {step === 3 && (
            <RegisterStep3
              email={getValues('email')}
              code={code}
              setCode={setCode}
              loading={loading}
              error={submitError}
              onSubmit={onStep3Submit}
              focused={focused}
              setFocused={setFocused}
            />
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
