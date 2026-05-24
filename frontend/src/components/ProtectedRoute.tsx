import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname, message: t('common.protectedMsg') }} replace />;
  }

  return <>{children}</>;
}
