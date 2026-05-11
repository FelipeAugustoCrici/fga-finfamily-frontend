import { Button } from '@/components/ui/Button';
import { Save, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTokens } from '@/hooks/useTokens';

export function RecordFormHeader({ isEdit, isLoading }: { isEdit: boolean; isLoading: boolean }) {
  const navigate = useNavigate();
  const t = useTokens();

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text.primary, margin: 0 }}>
        {isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
      </h2>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
          style={{ padding: '6px 14px', fontSize: 13 }}
        >
          <X size={14} style={{ marginRight: 5 }} />
          Cancelar
        </Button>

        <Button type="submit" disabled={isLoading} style={{ padding: '6px 14px', fontSize: 13 }}>
          {isLoading ? (
            <Loader2 size={14} style={{ marginRight: 5 }} className="animate-spin" />
          ) : (
            <Save size={14} style={{ marginRight: 5 }} />
          )}
          {isEdit ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
