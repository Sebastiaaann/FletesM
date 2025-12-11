import { UserRole } from '../types/auth.types';
import { AppView } from '../types';

/**
 * Verifica si un rol tiene permiso para acceder a una vista específica
 */
export const canAccessView = (role: UserRole | undefined, view: AppView): boolean => {
  if (!role) return false;

  switch (view) {
    case AppView.HOME:
      return true; // Todos pueden acceder

    case AppView.FINANCIALS:
    case AppView.COMPLIANCE:
      return role === 'admin'; // Solo admin

    case AppView.FLEET:
      return role === 'admin' || role === 'fleet_manager'; // Admin o Fleet Manager

    case AppView.DRIVER_MOBILE:
      return true; // Todos pueden acceder

    case AppView.DASHBOARD:
    case AppView.TRACKING:
    case AppView.ROUTES:
    case AppView.ROUTE_BUILDER:
      return role !== 'driver'; // Todos excepto driver

    default:
      return true;
  }
};

/**
 * Obtiene la vista por defecto según el rol del usuario
 */
export const getDefaultViewForRole = (role: UserRole | undefined): AppView => {
  if (role === 'driver') {
    return AppView.DRIVER_MOBILE;
  }
  return AppView.DASHBOARD;
};
