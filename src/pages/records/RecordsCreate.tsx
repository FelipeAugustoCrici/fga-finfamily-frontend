import { useNavigate, useSearchParams } from 'react-router-dom';
import { RecordForm } from './components/RecordForm';
import { useCreateRecord } from './hooks/useCreateRecord';
import { familyService } from '@/pages/families/services/families.service';
import { useCategories } from '@/pages/categories/hooks/useCategories';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/PageHeader';

export function RecordsCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createRecord = useCreateRecord();

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: () => familyService.list(),
  });

  const { data: categories = [] } = useCategories();
  const people = families[0]?.members || [];

  // Pre-fill from QuickLaunch "Editar" flow
  const prefill = searchParams.has('description')
    ? {
        description: searchParams.get('description') || '',
        value: parseFloat(searchParams.get('value') || '0') || undefined,
        date: searchParams.get('date') || new Date().toISOString().split('T')[0],
        recordType: (searchParams.get('type') || 'expense') as any,
        categoryId: searchParams.get('categoryId') || '',
        personId: searchParams.get('personId') || '',
      }
    : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader />
      <RecordForm
        families={families}
        categories={categories}
        people={people}
        initialData={prefill}
        onSubmit={(data) =>
          createRecord.mutate(data as any, {
            onSuccess: () => navigate('/record'),
          })
        }
        isLoading={createRecord.isPending}
      />
    </div>
  );
}
