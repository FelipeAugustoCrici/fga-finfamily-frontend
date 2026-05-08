import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTokens } from '@/hooks/useTokens';
import { User, Mail, Phone, Save, Loader2, Send, Copy, Check, Unlink } from 'lucide-react';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { telegramService } from './services/telegram.service';

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useTokens();

const { data: userAttributes, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const attributes = await fetchUserAttributes();
      return attributes;
    },
  });

const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const attributes: Record<string, string> = {
        name: data.name,
      };

      if (data.phone) {
        
        let phone = data.phone.replace(/\D/g, ''); 

if (!phone.startsWith('55')) {
          phone = '55' + phone;
        }

        attributes.phone_number = '+' + phone;
      }

      if (data.birthDate) {
        attributes.birthdate = data.birthDate;
      }

      await updateUserAttributes({
        userAttributes: attributes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      showToast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!',
        variant: 'success',
      });
      setIsEditing(false);
      reset();
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      showToast({
        title: 'Erro',
        description: 'Erro ao atualizar perfil',
        variant: 'error',
      });
    },
  });

const formatPhoneForDisplay = (phone?: string) => {
    if (!phone) return '';

const cleaned = phone.replace('+55', '').replace(/\D/g, '');

    if (cleaned.length <= 10) {
      
      return cleaned.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else {
      
      return cleaned.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: userAttributes?.name || '',
      email: userAttributes?.email || '',
      phone: formatPhoneForDisplay(userAttributes?.phone_number),
      birthDate: userAttributes?.birthdate || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton height={56} borderRadius={14} />
        <Skeleton height={120} borderRadius={18} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} height={180} borderRadius={18} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        actions={!isEditing ? <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button> : undefined}
      />

      {}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={48} className="text-primary-600" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-primary-800">
              {userAttributes?.name || 'Usuário'}
            </h2>
            <p className="text-primary-500">{userAttributes?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-success-50 text-success-700 text-xs font-medium rounded-full">
                Conta Ativa
              </span>
              {userAttributes?.email_verified && (
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                  Email Verificado
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card title="Informações Pessoais">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  Nome Completo
                </div>
              </label>
              <Input
                {...register('name')}
                disabled={!isEditing}
                placeholder="Seu nome completo"
                error={errors.name?.message}
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </div>
              </label>
              <Input
                {...register('email')}
                type="email"
                disabled={true} 
                placeholder="seu@email.com"
                error={errors.email?.message}
              />
              <p className="text-xs text-primary-500 mt-1">O email não pode ser alterado</p>
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  Telefone
                </div>
              </label>
              <div className="flex gap-2">
                <div className="w-16 flex items-center justify-center bg-primary-50 border border-primary-200 rounded-lg text-sm font-medium text-primary-600">
                  +55
                </div>
                <Input
                  {...register('phone')}
                  disabled={!isEditing}
                  placeholder="(00) 00000-0000"
                  error={errors.phone?.message}
                  maxLength={15}
                  onChange={(e) => {
                    
                    let value = e.target.value.replace(/\D/g, '');

                    if (value.length <= 11) {
                      if (value.length <= 10) {
                        
                        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                      } else {
                        
                        value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
                      }
                    }

                    e.target.value = value;
                  }}
                  className="flex-1"
                />
              </div>
            </div>

            {}
            <div className="md:col-span-2">
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de Nascimento"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!isEditing}
                    error={errors.birthDate?.message}
                  />
                )}
              />
            </div>
          </div>

          {}
          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-primary-100">
              <Button
                type="submit"
                disabled={isSubmitting || updateProfileMutation.isPending}
                className="flex items-center gap-2"
              >
                {isSubmitting || updateProfileMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting || updateProfileMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          )}
        </Card>
      </form>

      {}
      <Card title="Informações da Conta">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-primary-100">
            <div>
              <p className="text-sm font-medium text-primary-800">ID do Usuário</p>
              <p className="text-xs text-primary-500">Identificador único da sua conta</p>
            </div>
            <code className="text-xs bg-primary-50 px-3 py-1 rounded text-primary-700">
              {userAttributes?.sub?.substring(0, 20)}...
            </code>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-primary-100">
            <div>
              <p className="text-sm font-medium text-primary-800">Status da Conta</p>
              <p className="text-xs text-primary-500">Estado atual da sua conta</p>
            </div>
            <span className="text-sm font-semibold text-success-600">Ativa</span>
          </div>

          <div className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-medium text-primary-800">Email Verificado</p>
              <p className="text-xs text-primary-500">Status de verificação do email</p>
            </div>
            <span
              className={`text-sm font-semibold ${userAttributes?.email_verified ? 'text-success-600' : 'text-warning-600'}`}
            >
              {userAttributes?.email_verified ? 'Verificado' : 'Não Verificado'}
            </span>
          </div>
        </div>
      </Card>

      {}
      <Card title="Segurança">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-medium text-primary-800">Senha</p>
              <p className="text-xs text-primary-500">Gerencie sua senha de acesso</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Alterar Senha
            </Button>
          </div>
        </div>
      </Card>

      <TelegramSection t={t} />
    </div>
  );
}

function TelegramSection({ t }: { t: ReturnType<typeof useTokens> }) {
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['telegram-link-status'],
    queryFn: () => telegramService.getLinkStatus(),
  })

  const generateMutation = useMutation({
    mutationFn: () => telegramService.generateCode(),
    onSuccess: (data) => setCode(data.code),
    onError: () => showToast({ title: 'Erro', description: 'Não foi possível gerar o código.', variant: 'error' }),
  })

  const unlinkMutation = useMutation({
    mutationFn: () => telegramService.unlink(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-link-status'] })
      setCode(null)
      showToast({ title: 'Sucesso', description: 'Telegram desvinculado.', variant: 'success' })
    },
    onError: () => showToast({ title: 'Erro', description: 'Não foi possível desvincular.', variant: 'error' }),
  })

  const handleCopy = () => {
    if (!code) return
    navigator.clipboard.writeText(`/start ${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card title="Telegram">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(37,99,235,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Send size={20} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: t.text.primary, margin: 0 }}>
              Bot do Telegram
            </p>
            <p style={{ fontSize: 12, color: t.text.muted, margin: 0 }}>
              {statusLoading ? 'Verificando...' : status?.linked
                ? `Vinculado${status.username ? ` como @${status.username}` : ''}`
                : 'Não vinculado'}
            </p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
            background: status?.linked ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
            color: status?.linked ? '#059669' : t.text.muted,
          }}>
            {status?.linked ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {!status?.linked && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: t.text.secondary, margin: 0 }}>
              Vincule sua conta para lançar despesas e receitas diretamente pelo Telegram.
            </p>

            {!code ? (
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                size="sm"
              >
                {generateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Gerar código de ativação
              </Button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 13, color: t.text.secondary, margin: 0 }}>
                  Envie o comando abaixo para o bot <b>@FinFamilyBot</b> no Telegram:
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: t.bg.muted, borderRadius: 10, padding: '10px 14px',
                  border: `1px solid ${t.border.default}`,
                }}>
                  <code style={{ flex: 1, fontSize: 15, fontWeight: 700, color: t.text.primary, letterSpacing: '0.05em' }}>
                    /start {code}
                  </code>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: copied ? '#10b981' : t.text.muted, padding: 4,
                    }}
                    title="Copiar"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: t.text.muted, margin: 0 }}>
                  Código válido por 15 minutos.
                </p>
                <Button variant="outline" size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                  Gerar novo código
                </Button>
              </div>
            )}
          </div>
        )}

        {status?.linked && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => unlinkMutation.mutate()}
            disabled={unlinkMutation.isPending}
            style={{ alignSelf: 'flex-start', color: '#dc2626', borderColor: '#fca5a5' }}
          >
            {unlinkMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Unlink size={14} />}
            Desvincular Telegram
          </Button>
        )}
      </div>
    </Card>
  )
}
