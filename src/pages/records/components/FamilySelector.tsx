import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { Select } from '@/components/ui/Select';
import { useEffect } from 'react';
import { useTokens } from '@/hooks/useTokens';
import { Users } from 'lucide-react';

export function FamilySelector({ families }: { families: any[] }) {
  const { register, setValue, formState } = useFormContext();
  const familyId = useWatch({ name: 'familyId' });
  const t = useTokens();
  const isDark = t.bg.page === '#020617';

  const family = families[0];
  const people = family?.members || [];

  useEffect(() => {
    if (families.length === 1 && !familyId) {
      setValue('familyId', families[0].id);
    }
  }, [families, familyId, setValue]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input type="hidden" {...register('familyId')} />

      {family && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: isDark ? 'rgba(99,102,241,0.08)' : '#eef2ff',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.20)' : '#c7d2fe'}`,
            borderRadius: 10,
            padding: '10px 14px',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: isDark ? 'rgba(99,102,241,0.20)' : '#e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Users size={14} color={isDark ? '#a5b4fc' : '#4338ca'} />
          </div>
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: isDark ? '#a5b4fc' : '#4338ca',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 1,
              }}
            >
              Família
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#c7d2fe' : '#3730a3' }}>
              {family.name}
            </p>
          </div>
        </div>
      )}

      <Controller
        name="personId"
        control={useFormContext().control}
        render={({ field }) => (
          <Select
            label="Responsável"
            placeholder={
              people.length > 0 ? 'Selecione um responsável' : 'Nenhum membro cadastrado'
            }
            options={people.map((p: { id: string; name: string }) => ({
              value: p.id,
              label: p.name,
            }))}
            value={field.value}
            onChange={field.onChange}
            disabled={people.length === 0}
            error={formState.errors.personId?.message as string}
          />
        )}
      />

      {people.length === 0 && (
        <p style={{ fontSize: 11, color: '#d97706' }}>
          Adicione membros à sua família antes de criar lançamentos
        </p>
      )}
    </div>
  );
}
