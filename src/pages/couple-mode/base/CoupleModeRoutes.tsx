import { CoupleModeList } from '../CoupleModeList';
import type { AppRoute } from '@/routes/routes';

export const CoupleModeRoutes = {
  coupleMode: {
    path: '/couple-mode',
    element: <CoupleModeList />,
  },
} satisfies Record<string, AppRoute>;
