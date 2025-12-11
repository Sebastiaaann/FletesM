/**
 * Authentication Module Exports
 * 
 * Punto de entrada centralizado para el sistema de autenticación
 */

// Context y Provider
export { AuthProvider, AuthContext } from './contexts/AuthContext';

// Hook principal
export { useAuth } from './hooks/useAuth';

// Cliente de Supabase
export { supabase, testSupabaseConnection } from './lib/supabase';

// Tipos
export type {
  AppRole,
  UserProfile,
  AuthState,
  SignInCredentials,
  SignUpCredentials,
  AuthResponse,
  AuthContextType,
} from './types/auth.types';

export {
  ROLE_PERMISSIONS,
  ROLE_LABELS,
  isValidAppRole,
} from './types/auth.types';

// Componentes
export { default as LoginForm } from './components/auth/LoginForm';
export { default as RegisterForm } from './components/auth/RegisterForm';
export { default as ProtectedRoute } from './components/auth/ProtectedRoute';
