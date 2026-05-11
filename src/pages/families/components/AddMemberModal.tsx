import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { familyService } from '../services/families.service';
import { User, Mail, Phone, Lock, ShieldCheck, Check, X } from 'lucide-react';

const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Uma letra minúscula', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Uma letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Um número', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Um caractere especial', test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

const schema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().optional(),
    phone: z.string().optional(),
    hasAccess: z.boolean(),
    temporaryPassword: z.string().optional(),
  })
  .refine((d) => !d.hasAccess || (d.email && d.email.length > 0), {
    message: 'E-mail é obrigatório para acesso à plataforma',
    path: ['email'],
  })
  .refine(
    (d) =>
      !d.hasAccess ||
      !d.temporaryPassword ||
      passwordRules.every((r) => r.test(d.temporaryPassword!)),
    { message: 'A senha não atende todos os requisitos', path: ['temporaryPassword'] },
  );

type FormData = z.infer<typeof schema>;

interface Props {
  familyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ familyId, isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', hasAccess: false, temporaryPassword: '' },
  });

  const hasAccess = watch('hasAccess');
  const temporaryPassword = watch('temporaryPassword') ?? '';

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      familyService.createMember(familyId, {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        hasAccess: data.hasAccess,
        temporaryPassword: data.temporaryPassword || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      queryClient.invalidateQueries({ queryKey: ['family', familyId] });
      showToast({ title: 'Sucesso', description: 'Membro adicionado!', variant: 'success' });
      reset();
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Erro ao adicionar membro';
      showToast({ title: 'Erro', description: msg, variant: 'error' });
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  const passedRules = passwordRules.filter((r) => r.test(temporaryPassword)).length;
  const showStrength = hasAccess && temporaryPassword.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Membro">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome"
          placeholder="Nome completo"
          {...register('name')}
          error={errors.name?.message}
          icon={<User size={16} className="text-primary-400" />}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="email@exemplo.com"
          {...register('email')}
          error={errors.email?.message}
          icon={<Mail size={16} className="text-primary-400" />}
        />

        <Input
          label="Telefone (opcional)"
          placeholder="(00) 00000-0000"
          {...register('phone')}
          error={errors.phone?.message}
          icon={<Phone size={16} className="text-primary-400" />}
        />

        <div
          onClick={() => {
            const current = watch('hasAccess');
            reset({ ...watch(), hasAccess: !current });
          }}
          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
            hasAccess
              ? 'border-primary-400 bg-primary-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${hasAccess ? 'bg-primary-800' : 'bg-slate-100'}`}
          >
            <ShieldCheck size={18} className={hasAccess ? 'text-white' : 'text-slate-400'} />
          </div>
          <div className="flex-1">
            <p
              className={`text-sm font-semibold ${hasAccess ? 'text-primary-800' : 'text-slate-700'}`}
            >
              Acesso à plataforma
            </p>
            <p className="text-xs text-slate-400">
              {hasAccess
                ? 'Este membro poderá fazer login no sistema'
                : 'Membro apenas para controle interno'}
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${hasAccess ? 'border-primary-600 bg-primary-600' : 'border-slate-300'}`}
          >
            {hasAccess && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>

        {hasAccess && (
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Configurações de acesso
            </p>

            <Input
              label="Senha temporária (opcional)"
              type="password"
              placeholder="Digite uma senha segura"
              {...register('temporaryPassword')}
              error={errors.temporaryPassword?.message}
              icon={<Lock size={16} className="text-primary-400" />}
            />

            {/* Barra de força */}
            {showStrength && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {passwordRules.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i < passedRules
                          ? passedRules <= 2
                            ? 'bg-danger-500'
                            : passedRules <= 3
                              ? 'bg-yellow-400'
                              : passedRules <= 4
                                ? 'bg-blue-400'
                                : 'bg-green-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs font-medium ${
                    passedRules <= 2
                      ? 'text-danger-500'
                      : passedRules <= 3
                        ? 'text-yellow-500'
                        : passedRules <= 4
                          ? 'text-blue-500'
                          : 'text-green-600'
                  }`}
                >
                  {passedRules <= 2
                    ? 'Senha fraca'
                    : passedRules <= 3
                      ? 'Senha razoável'
                      : passedRules <= 4
                        ? 'Senha boa'
                        : 'Senha forte'}
                </p>
              </div>
            )}

            {/* Checklist de requisitos */}
            {showStrength && (
              <ul className="space-y-1">
                {passwordRules.map((rule) => {
                  const ok = rule.test(temporaryPassword);
                  return (
                    <li key={rule.label} className="flex items-center gap-2">
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 transition-all ${ok ? 'bg-green-500' : 'bg-slate-200'}`}
                      >
                        {ok ? (
                          <Check size={10} className="text-white" strokeWidth={3} />
                        ) : (
                          <X size={10} className="text-slate-400" strokeWidth={3} />
                        )}
                      </span>
                      <span
                        className={`text-xs transition-colors ${ok ? 'text-green-700' : 'text-slate-400'}`}
                      >
                        {rule.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="text-xs text-slate-400">
              Se não informada, o Cognito enviará um e-mail de convite automaticamente.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Adicionar Membro'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
