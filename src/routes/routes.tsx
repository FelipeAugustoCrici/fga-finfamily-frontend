import { RouteProps } from 'react-router-dom';

import { Dashboard } from '@/pages/dashboard';
import { Login, NewPassword, ForgotPassword, Register, ConfirmSignUp } from '@/pages/auth';
import { FamilyRoutes } from '@/pages/families/base/FamilyRoutes';
import { RecordRoutes } from '@/pages/records/base/RecordRoutes';
import { CategoryRoutes } from '@/pages/categories/base/CategoryRoutes';
import { PlanningRoutes } from '@/pages/planning';
import { CoupleModeRoutes } from '@/pages/couple-mode';
import { ReportsRoutes } from '@/pages/reports/base/ReportsRoutes';
import { CreditCardRoutes } from '@/pages/credit-cards/base/CreditCardRoutes';
import { CalendarRoutes } from '@/pages/calendar/base/CalendarRoutes';
import { ProfileRoutes } from '@/pages/profile/base/ProfileRoutes';

export type AppRoute = RouteProps & {
  isPublic?: boolean;
  use?: string;
};

export const PublicRoutes = {
  login: {
    path: '/login',
    element: <Login />,
    isPublic: true,
  },
  register: {
    path: '/register',
    element: <Register />,
    isPublic: true,
  },
  confirmSignUp: {
    path: '/confirm-signup',
    element: <ConfirmSignUp />,
    isPublic: true,
  },
  newPassword: {
    path: '/new-password',
    element: <NewPassword />,
    isPublic: true,
  },
  forgotPassword: {
    path: '/forgot-password',
    element: <ForgotPassword />,
    isPublic: true,
  },
} satisfies Record<string, AppRoute>;

export const PrivateRoutes = {
  home: {
    path: '/',
    element: <Dashboard />,
  },
  dashboard: {
    path: '/dashboard',
    element: <Dashboard />,
  },
  ...RecordRoutes,
  ...FamilyRoutes,
  ...CategoryRoutes,
  ...ReportsRoutes,
  ...PlanningRoutes,
  ...CoupleModeRoutes,
  ...CreditCardRoutes,
  ...CalendarRoutes,
  ...ProfileRoutes,
} satisfies Record<string, AppRoute>;

export const ROUTES = {
  ...PublicRoutes,
  ...PrivateRoutes,
} satisfies Record<string, AppRoute>;

export const publicRoutesArray = Object.keys(PublicRoutes).map(
  (key) => PublicRoutes[key as keyof typeof PublicRoutes],
) as AppRoute[];

export const privateRoutesArray = Object.keys(PrivateRoutes).map(
  (key) => PrivateRoutes[key as keyof typeof PrivateRoutes],
) as AppRoute[];
