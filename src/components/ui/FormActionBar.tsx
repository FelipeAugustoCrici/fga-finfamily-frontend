import { Check, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { useTokens } from '@/hooks/useTokens';

interface FormActionBarProps {
  isLoading?: boolean;
  isEdit?: boolean;
  saveLabel?: string;
  editLabel?: string;
  onCancel?: () => void;
}

export function FormActionBar({
  isLoading = false,
  isEdit = false,
  saveLabel = 'Salvar lançamento',
  editLabel = 'Atualizar lançamento',
  onCancel,
}: FormActionBarProps) {
  const navigate = useNavigate();
  const t = useTokens();
  const isDark = t.bg.page === '#12161a';

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate(-1);
  };

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        background: isDark
          ? 'rgba(18, 22, 26, 0.92)'
          : 'rgba(248, 247, 242, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: `1px solid ${t.border.default}`,
        padding: '12px 0',
        marginTop: 24,
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          style={{ fontSize: 13, padding: '8px 18px' }}
        >
          <X size={14} style={{ marginRight: 6 }} />
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          size="md"
          style={{ fontSize: 13, padding: '8px 22px', minWidth: 160 }}
        >
          {isLoading ? (
            <Loader2 size={14} style={{ marginRight: 6 }} className="animate-spin" />
          ) : (
            <Check size={14} style={{ marginRight: 6 }} />
          )}
          {isEdit ? editLabel : saveLabel}
        </Button>
      </div>
    </div>
  );
}
