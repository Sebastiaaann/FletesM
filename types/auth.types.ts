// Tipos de roles de usuario
export type UserRole = 'admin' | 'fleet_manager' | 'driver';

// Perfil de usuario
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: UserRole;
  email: string;
  created_at?: string;
  updated_at?: string;
}

// Usuario autenticado
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

// Estado de autenticación
export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
