import { currentUser } from '../constants/currentUser';
import { UserRole } from '../types';

export const useAuth = () => {
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (requiredRole === 'contributor') {
      return true;
    }
    return currentUser.role === 'admin';
  };

  const canEdit = hasPermission('admin');
  const canView = hasPermission('contributor');

  return {
    user: currentUser,
    canEdit,
    canView,
    hasPermission,
  };
};

