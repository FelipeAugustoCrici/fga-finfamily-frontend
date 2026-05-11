import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RecordForm } from './components/RecordForm';
import { useUpdateRecord } from './hooks/useUpdateRecord';
import { useRecord } from './hooks/useRecord';
import { familyService } from '@/pages/families/services/families.service';
import { useCategories } from '@/pages/categories/hooks/useCategories';
import { SkeletonDetail } from '@/components/ui/Skeleton';
import { useTokens } from '@/hooks/useTokens';
import { PageHeader } from '@/components/ui/PageHeader';

export function RecordsEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateRecord = useUpdateRecord();

  const { data: item, isLoading } = useRecord(id);
  const t = useTokens();

  const { data: families = [] } = useQuery({
    queryKey: ['families'],
    queryFn: () => familyService.list(),
  });

  const { data: categories = [] } = useCategories();

  const people = families[0]?.members || [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <SkeletonDetail t={t} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-primary-500">Lançamento não encontrado</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader />
      <RecordForm
        initialData={item}
        families={families}
        categories={categories}
        people={people}
        onSubmit={(data) =>
          updateRecord.mutate(
            { id: id!, data: data as any },
            {
              onSuccess: () => navigate('/record'),
            },
          )
        }
        isLoading={updateRecord.isPending}
      />
    </div>
  );
}
