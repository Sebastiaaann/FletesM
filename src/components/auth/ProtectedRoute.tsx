import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AppRole } from '../../types/auth.types';
import PageLoader from '../../../components/PageLoader';
import { LoginView } from '../../../components/auth/LoginView';

// Componente temporal de Unauthorized
const Unauthorized: React.FC = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Acceso Denegado</h1>
    <p>No tienes permisos para acceder a este recurso.</p>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole | AppRole[];
  fallback?: React.ReactNode;
}

/**
 * Componente de ruta protegida compatible con Zustand y Dark Mode
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  // No necesitamos setView aquí porque el componente Renderiza UI alternativa,
  // no redirige (a menos que lo programemos explícitamente).

  // 1. Loading State
  if (loading) {
    return <PageLoader />;
  }

  // 2. No Autenticado
  if (!isAuthenticated) {
    // Si se provee un fallback (ej: un botón de "Logueate para ver más"), úsalo.
    if (fallback) return <>{fallback}</>;
    
    // De lo contrario, mostramos la vista de Login integrada
    return <LoginView />;
  }

  // 3. Verificación de Rol
  if (requiredRole && !hasRole(requiredRole)) {
    // Si hay fallback custom, renderizarlo
    if (fallback) return <>{fallback}</>;

    // Si no, mostrar la pantalla estándar de "Acceso Denegado" (Dark Mode)
    return <Unauthorized />;
  }

  // 4. Éxito: Renderizar contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;