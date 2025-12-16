/**
 * AuthContext - Context de Autenticación y Autorización
 * Implementación Segura y Tipada
 */

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  AuthContextType,
  UserProfile,
  AuthResponse,
  SignUpCredentials,
  AppRole,
} from '../types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetch del perfil de usuario de forma segura
   * Con optimización para evitar re-renders innecesarios
   */
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // 🔒 Log seguro: Solo indicamos que estamos buscando, no imprimimos datos sensibles aún
      if (import.meta.env.DEV) {
        console.log('🔍 Fetching user profile for userId:', userId);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error.message);
        // Si falla el perfil pero hay sesión, es un estado crítico.
        // Opcional: Podrías forzar logout aquí si el perfil es obligatorio.
        setProfile(null);
        return;
      }

      if (data) {
        // 🔒 En Prod no mostramos el objeto data completo
        if (import.meta.env.DEV) console.log('✅ Profile loaded for:', data.role);
        
        // 🛡️ FIX: Comparamos si el rol actual es igual al nuevo para evitar re-renders infinitos
        setProfile(prev => {
          // Si ya tenemos un perfil y el rol es el mismo, no actualizamos el estado
          if (prev && prev.role === data.role && prev.email === data.email) {
            return prev; // Retornamos la misma referencia -> No re-render
          }
          return data as UserProfile; // Solo actualizamos si algo cambió realmente
        });
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching profile:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        // Timeout de seguridad: Si tarda más de 10 segundos, asumir que no hay sesión
        timeoutId = setTimeout(() => {
          if (mounted && loading) {
            console.warn('⚠️ Auth initialization timeout - assuming no session');
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }, 10000);

        // Recuperamos sesión existente (persistida en localStorage)
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        // Limpiar timeout si la respuesta llegó a tiempo
        clearTimeout(timeoutId);

        if (error) {
          console.error('❌ Error getting session:', error);
          throw error;
        }

        if (mounted) {
          if (currentSession?.user) {
            console.log('✅ Session found, user:', currentSession.user.email);
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchUserProfile(currentSession.user.id);
          } else {
            console.log('ℹ️ No active session found');
            // Limpieza explícita
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener de eventos Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        // 🔒 Logs reducidos para producción
        if (import.meta.env.DEV) console.log('🔄 Auth Event:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchUserProfile(currentSession.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  /**
   * Login SEGURO tipado con AuthError
   */
  const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Retornamos el error de Supabase tal cual (mantiene status y code)
        return { error }; 
      }

      return { error: null, data };
    } catch (error) {
      // Si es un error inesperado, lo convertimos a una estructura compatible
      return { 
        error: error as AuthError // Casting seguro para mantener contrato
      };
    }
  };

  /**
   * Registro
   */
  const signUpWithEmail = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: { full_name: credentials.full_name || '' },
        },
      });

      if (error) return { error };

      return { error: null, data };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  /**
   * Logout
   */
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error };

      // Limpieza local inmediata para UX instantánea
      setSession(null);
      setUser(null);
      setProfile(null);

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const hasRole = useCallback((role: AppRole | AppRole[]): boolean => {
    if (!profile) return false;
    if (Array.isArray(role)) return role.includes(profile.role);
    return profile.role === role;
  }, [profile]);

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!user && !!session && !!profile, // Robustez: requiere perfil cargado
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;