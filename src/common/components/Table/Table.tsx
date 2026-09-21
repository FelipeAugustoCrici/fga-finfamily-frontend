import { Edit2, Loader2, Trash2 } from 'lucide-react';
import { TableRow } from './TableRow';
import { TableCell } from './TableCell';

interface TableProps<T> {
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  headers?: string[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  children: (item: T) => React.ReactNode;
}

export function Table<T>({
  data,
  isLoading,
  emptyMessage = 'Nenhum registro encontrado',
  headers,
  onEdit,
  onDelete,
  children,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-primary-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const hasActions = onEdit || onDelete;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {headers && (
          <thead>
            <tr className="border-b border-primary-100">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-bold text-primary-600 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
              {hasActions && (
                <th className="px-6 py-4 text-right text-xs font-bold text-primary-600 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-primary-50">
          {data.map((item, index) => (
            <TableRow key={index}>
              {children(item)}
              {hasActions && (
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-primary-400 hover:text-primary-700 hover:bg-primary-100 rounded-md transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-primary-400 hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
}
