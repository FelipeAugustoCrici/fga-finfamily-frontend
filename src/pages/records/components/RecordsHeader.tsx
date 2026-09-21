import { Button } from '@/components/ui/Button';
import { QuickLaunchInput } from './QuickLaunch/QuickLaunchInput';

export function RecordsHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-800">Lançamentos</h2>
          <p className="text-primary-500">Gerencie todos os seus lançamentos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreate}>Novo Lançamento</Button>
        </div>
      </div>

      <QuickLaunchInput />
    </div>
  );
}
