/**
 * Supabase Client Configuration
 * 
 * Cliente inicializado para toda la aplicación.
 * Verifica variables de entorno críticas al cargar.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Obtener variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación estricta de variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase configuration is missing!');
  console.error('Required environment variables:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - VITE_SUPABASE_ANON_KEY');
  console.error('Please create a .env.local file with these values.');
  
  throw new Error('Supabase configuration missing. Check console for details.');
}

// Validar formato de URL
try {
  new URL(supabaseUrl);
} catch {
  console.error('❌ VITE_SUPABASE_URL is not a valid URL:', supabaseUrl);
  throw new Error('Invalid Supabase URL format');
}

/**
 * Cliente de Supabase singleton
 * Configurado con persistencia de sesión y refresh automático
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'FletesM',
    },
  },
});

/**
 * Helper para verificar la conexión a Supabase
 * Útil para debugging y health checks
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

// Log de conexión en desarrollo
if (import.meta.env.DEV) {
  console.log('🔌 Supabase client initialized');
  console.log('📍 URL:', supabaseUrl);
}

export default supabase;
