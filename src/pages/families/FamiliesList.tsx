import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonList } from '@/components/ui/Skeleton';
import { useTokens } from '@/hooks/useTokens';
import {
  Plus,
  Users,
  Trash2,
  Edit,
  UserPlus,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  MoreVertical,
  UserX,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useFamilies } from './hooks/useFamilies';
import { useCreateFamily } from './hooks/useCreateFamily';
import { useDeleteFamily } from './hooks/useDeleteFamily';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { familyService } from './services/families.service';
import { AddMemberModal } from './components/AddMemberModal';

export function FamiliesList() {
  const navigate = useNavigate();
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const { data: families = [], isLoading } = useFamilies();
  const createFamily = useCreateFamily();
  const deleteFamily = useDeleteFamily();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [newFamilyName, setNewFamilyName] = useState('');
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMemberModalOpen, setDeleteMemberModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const family = families[0];
  const hasFamily = families.length > 0;

  const deleteMember = useMutation({
    mutationFn: (memberId: string) => familyService.deleteMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      showToast({
        title: 'Sucesso',
        description: 'Membro removido com sucesso!',
        variant: 'success',
      });
    },
    onError: () => {
      showToast({ title: 'Erro', description: 'Erro ao remover membro', variant: 'error' });
    },
  });

  const resendInvite = useMutation({
    mutationFn: (memberId: string) => familyService.resendInvite(memberId),
    onSuccess: () => {
      showToast({
        title: 'Convite reenviado',
        description: 'O email de convite foi reenviado com sucesso!',
        variant: 'success',
      });
      setOpenMenuId(null);
    },
    onError: () => {
      showToast({
        title: 'Erro',
        description: 'Não foi possível reenviar o convite',
        variant: 'error',
      });
    },
  });

  const handleCreateFamily = () => {
    if (!newFamilyName.trim()) return;
    createFamily.mutate({ name: newFamilyName }, { onSuccess: () => setNewFamilyName('') });
  };

  const handleDeleteFamily = () => {
    if (!family) return;
    deleteFamily.mutate(family.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['user-family'] });
      },
    });
  };

  const handleDeleteMember = () => {
    if (!selectedMemberId) return;
    deleteMember.mutate(selectedMemberId, {
      onSuccess: () => {
        setDeleteMemberModalOpen(false);
        setSelectedMemberId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: 896, margin: '0 auto' }}>
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 18,
            overflow: 'hidden',
          }}
        >
          <SkeletonList rows={4} t={t} />
        </div>
      </div>
    );
  }

  if (!hasFamily) {
    return (
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              margin: '0 auto 16px',
              background: t.bg.muted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={32} style={{ color: t.text.muted }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text.primary, margin: 0 }}>
            Configure sua Família
          </h2>
          <p style={{ color: t.text.muted, marginTop: 8, fontSize: 14 }}>
            Crie sua família para começar a gerenciar os lançamentos
          </p>
        </div>

        <Card title="Nova Família">
          <div className="space-y-4">
            <Input
              label="Nome da Família"
              placeholder="Ex: Família Silva"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFamily()}
            />
            <Button
              onClick={handleCreateFamily}
              disabled={!newFamilyName.trim() || createFamily.isPending}
              className="w-full"
            >
              {createFamily.isPending ? (
                <Loader2 className="mr-2 animate-spin" size={18} />
              ) : (
                <Plus className="mr-2" size={18} />
              )}
              Criar Família
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const members = family.members || [];
  const activeCount = members.filter((m: any) => m.hasAccess).length;
  const inactiveCount = members.length - activeCount;

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(`/family/edit/${family.id}`)}>
              <Edit size={16} className="mr-2" /> Editar
            </Button>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 size={16} className="mr-2 text-red-500" />
              <span className="text-red-500">Excluir</span>
            </Button>
          </>
        }
      />
      <div
        style={{
          maxWidth: 896,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {[
            { label: 'Total de membros', value: members.length, icon: Users, color: t.text.link },
            {
              label: 'Ativos no sistema',
              value: activeCount,
              icon: CheckCircle2,
              color: t.income.text,
            },
            { label: 'Sem acesso', value: inactiveCount, icon: UserX, color: t.text.muted },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              style={{
                background: t.bg.card,
                border: `1px solid ${t.border.default}`,
                borderRadius: 16,
                padding: '18px 20px',
                boxShadow: t.shadow.card,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: t.text.primary, lineHeight: 1 }}>
                  {value}
                </p>
                <p style={{ fontSize: 12, color: t.text.muted, marginTop: 3 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {}
        <div
          style={{
            background: t.bg.card,
            border: `1px solid ${t.border.default}`,
            borderRadius: 18,
            boxShadow: t.shadow.card,
            overflow: 'hidden',
          }}
        >
          {}
          <div
            style={{
              padding: '18px 24px',
              borderBottom: `1px solid ${t.border.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: t.text.primary }}>
                Membros da Família
              </p>
              <p style={{ fontSize: 12, color: t.text.muted, marginTop: 2 }}>
                {members.length} {members.length === 1 ? 'membro' : 'membros'} • {activeCount}{' '}
                {activeCount === 1 ? 'ativo' : 'ativos'} • {inactiveCount} sem acesso
              </p>
            </div>
          </div>

          {}
          {members.length > 0 ? (
            <div>
              {members.map((member: any, idx: number) => {
                const initials = member.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                const isMenuOpen = openMenuId === member.id;

                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 24px',
                      borderBottom:
                        idx < members.length - 1 ? `1px solid ${t.border.divider}` : 'none',
                      transition: 'background 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.muted)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        flexShrink: 0,
                        background: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.10)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 15,
                        fontWeight: 700,
                        color: t.text.link,
                      }}
                    >
                      {initials}
                    </div>

                    {}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: t.text.primary }}>
                        {member.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        {member.hasAccess ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              color: t.income.text,
                              background: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.08)',
                              border: `1px solid ${isDark ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.2)'}`,
                              borderRadius: 20,
                              padding: '2px 8px',
                            }}
                          >
                            <ShieldCheck size={10} /> Ativo no sistema
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 500,
                              color: t.text.muted,
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                              border: `1px solid ${t.border.subtle}`,
                              borderRadius: 20,
                              padding: '2px 8px',
                            }}
                          >
                            <UserX size={10} /> Não convidado
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: t.text.subtle }}>
                          Participa da divisão de despesas
                        </span>
                      </div>
                    </div>

                    {}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : member.id)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: 'none',
                          background: isMenuOpen ? t.bg.mutedStrong : 'transparent',
                          color: t.text.muted,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = t.bg.mutedStrong)}
                        onMouseLeave={(e) => {
                          if (!isMenuOpen) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {isMenuOpen && (
                        <>
                          {}
                          <div
                            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: 36,
                              zIndex: 20,
                              background: t.bg.card,
                              border: `1px solid ${t.border.default}`,
                              borderRadius: 12,
                              boxShadow: isDark
                                ? '0 8px 24px rgba(0,0,0,0.5)'
                                : '0 8px 24px rgba(0,0,0,0.12)',
                              minWidth: 160,
                              overflow: 'hidden',
                            }}
                          >
                            {member.hasAccess && (
                              <button
                                onClick={() => resendInvite.mutate(member.id)}
                                disabled={resendInvite.isPending}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  background: 'transparent',
                                  border: 'none',
                                  fontSize: 13,
                                  color: t.text.link,
                                  cursor: resendInvite.isPending ? 'not-allowed' : 'pointer',
                                  textAlign: 'left',
                                  transition: 'background 0.15s',
                                  opacity: resendInvite.isPending ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = isDark
                                    ? 'rgba(99,102,241,0.1)'
                                    : 'rgba(99,102,241,0.06)')
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = 'transparent')
                                }
                              >
                                {resendInvite.isPending ? (
                                  <Loader2
                                    size={14}
                                    style={{ animation: 'spin 1s linear infinite' }}
                                  />
                                ) : (
                                  <Send size={14} />
                                )}
                                Reenviar convite
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedMemberId(member.id);
                                setDeleteMemberModalOpen(true);
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: 'transparent',
                                border: 'none',
                                fontSize: 13,
                                color: t.expense.text,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = t.expense.bgIcon)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = 'transparent')
                              }
                            >
                              <Trash2 size={14} /> Remover membro
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  margin: '0 auto 12px',
                  background: t.bg.muted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserPlus size={24} style={{ color: t.text.muted }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: t.text.secondary }}>
                Nenhum membro ainda
              </p>
              <p style={{ fontSize: 13, color: t.text.muted, marginTop: 4 }}>
                Adicione membros para começar a dividir as despesas
              </p>
            </div>
          )}

          {}
          <div
            style={{
              padding: '16px 24px',
              borderTop: `1px solid ${t.border.divider}`,
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
            }}
          >
            <button
              onClick={() => setAddMemberOpen(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.06)',
                border: `1.5px dashed ${isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.25)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = isDark
                  ? 'rgba(99,102,241,0.18)'
                  : 'rgba(99,102,241,0.10)';
                (e.currentTarget as HTMLElement).style.borderColor = isDark
                  ? 'rgba(99,102,241,0.5)'
                  : 'rgba(99,102,241,0.4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = isDark
                  ? 'rgba(99,102,241,0.12)'
                  : 'rgba(99,102,241,0.06)';
                (e.currentTarget as HTMLElement).style.borderColor = isDark
                  ? 'rgba(99,102,241,0.35)'
                  : 'rgba(99,102,241,0.25)';
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserPlus size={16} style={{ color: t.text.link }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: t.text.link }}>
                  Adicionar novo membro
                </p>
                <p style={{ fontSize: 11, color: t.text.muted, marginTop: 1 }}>
                  Convide alguém para participar das despesas
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {family && (
        <AddMemberModal
          familyId={family.id}
          isOpen={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
        />
      )}

      {}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 mb-1">Atenção!</p>
              <p className="text-sm text-red-700">
                Ao excluir a família, todos os lançamentos, membros e dados relacionados serão
                permanentemente removidos. Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
          <p className="text-gray-600">
            Tem certeza que deseja excluir a família <strong>{family?.name}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteFamily}
              disabled={deleteFamily.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteFamily.isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2" size={18} />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {}
      <Modal
        isOpen={deleteMemberModalOpen}
        onClose={() => {
          setDeleteMemberModalOpen(false);
          setSelectedMemberId(null);
        }}
        title="Remover Membro"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Tem certeza que deseja remover este membro da família?</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteMemberModalOpen(false);
                setSelectedMemberId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteMember}
              disabled={deleteMember.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMember.isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Removendo...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
