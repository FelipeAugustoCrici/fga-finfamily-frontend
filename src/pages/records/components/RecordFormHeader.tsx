import { useTokens } from '@/hooks/useTokens';

export function RecordFormHeader({ isEdit }: { isEdit: boolean; isLoading?: boolean }) {
  const t = useTokens();

  return (
    <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text.primary, margin: 0 }}>
      {isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
    </h2>
  );
}
