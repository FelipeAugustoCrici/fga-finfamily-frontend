import { Table, TableCell } from '@/common/components/Table';
import { formatCurrency } from '../utils/formatters';
import { formatShortDate } from '@/common/utils/date';
import type { UnifiedRecord } from '../types/record.types';

type Props = {
  records: UnifiedRecord[];
  isLoading: boolean;
  onEdit: (r: UnifiedRecord) => void;
  onDelete: (r: UnifiedRecord) => void;
};

export function RecordsTable({ records, isLoading, onEdit, onDelete }: Props) {
  return (
    <Table
      data={records}
      isLoading={isLoading}
      headers={['Descrição', 'Categoria', 'Data', 'Valor']}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      {(record) => (
        <>
          <TableCell>{record.description}</TableCell>
          <TableCell>{record.category?.name || record.categoryName || 'Geral'}</TableCell>
          <TableCell>{formatShortDate(record.date)}</TableCell>
          <TableCell
            className={
              record.type === 'income'
                ? 'text-success-600 font-bold font-mono'
                : 'text-danger-600 font-bold font-mono'
            }
          >
            {record.type === 'income' ? '+' : '-'} {formatCurrency(record.value)}
          </TableCell>
        </>
      )}
    </Table>
  );
}
