/**
 * Authentication & Authorization Types
 * 
 * Tipos para el sistema de autenticación y roles de usuario.
 * Deben coincidir exactamente con el schema de Supabase.
 */

import { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Roles de la aplicación (debe coincidir con el enum de PostgreSQL)
 */
export type AppRole = 'admin' | 'fleet_manager' | 'driver' | 'demo';

/**
 * Perfil de usuario extendido
 * Estructura que coincide con la tabla public.profiles
 */
export interface UserProfile {
  id: string;
  role: AppRole;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Estado de autenticación completo
 */
export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

/**
 * Credenciales para login
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Credenciales para registro
 */
export interface SignUpCredentials {
  email: string;
  password: string;
  full_name?: string;
}

/**
 * Respuesta de operaciones de autenticación
 */
export interface AuthResponse {
  // CORRECCIÓN: Usar AuthError para acceder a propiedades como 'status' o 'code'
  error: AuthError | null;
  data?: {
    user: User | null;
    session: Session | null;
  };
}

/**
 * Contexto de autenticación expuesto al Provider
 */
export interface AuthContextType {
  // Estado
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;

  // Métodos de autenticación
  signInWithEmail: (email: string, password: string) => Promise<AuthResponse>;
  signUpWithEmail: (credentials: SignUpCredentials) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;

  // Helpers
  isAuthenticated: boolean;
  hasRole: (role: AppRole | AppRole[]) => boolean;
}

/**
 * Permisos por rol (UI ONLY)
 * ADVERTENCIA: Estos permisos solo controlan la visibilidad en el Frontend.
 * La seguridad real debe estar implementada en Supabase RLS.
 */
export const ROLE_PERMISSIONS = {
  admin: [
    'view_all',
    'edit_all',
    'delete_all',
    'manage_users',
    'manage_fleet',
    'view_financials',
    'manage_routes',
    'view_compliance'
  ],
  fleet_manager: [
    'view_fleet',
    'edit_fleet',
    'manage_routes',
    'assign_drivers',
    // 🔒 SEGURIDAD: 'view_financials' ELIMINADO para cumplir requerimientos
  ],
  driver: [
    'view_assigned_routes',
    'update_delivery_status',
    'upload_pod',
    'view_own_profile',
  ],
  demo: [
    'view_dashboard', // Solo puede ver el dashboard
  ],
} as const;

/**
 * Type helper para extraer los permisos de un rol específico
 * Ejemplo: PermissionType = 'view_all' | 'edit_all' | ...
 */
export type PermissionType = typeof ROLE_PERMISSIONS[AppRole][number];

/**
 * Type guard para verificar si un string es un AppRole válido
 */
export const isValidAppRole = (role: string): role is AppRole => {
  return ['admin', 'fleet_manager', 'driver', 'demo'].includes(role);
};

/**
 * Labels en español para los roles
 */
export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  fleet_manager: 'Gestor de Flota',
  driver: 'Conductor',
  demo: 'Usuario Demo',
};