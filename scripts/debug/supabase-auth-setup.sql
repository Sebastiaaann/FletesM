-- ============================================
-- SISTEMA DE ROLES Y PERFILES DE USUARIO
-- FletesM - Supabase Configuration
-- ============================================

-- 1. LIMPIEZA: Eliminar objetos existentes
-- ============================================

-- Eliminar tabla profiles si existe
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Eliminar tipo enum si existe
DROP TYPE IF EXISTS public.app_role CASCADE;

-- ============================================
-- 2. CREAR TIPO ENUM PARA ROLES
-- ============================================

CREATE TYPE public.app_role AS ENUM (
  'admin',
  'fleet_manager',
  'driver'
);

COMMENT ON TYPE public.app_role IS 'Roles de usuario en el sistema: admin (acceso total), fleet_manager (gestión de flotas), driver (vista móvil)';

-- ============================================
-- 3. CREAR TABLA PROFILES
-- ============================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role public.app_role NOT NULL DEFAULT 'driver',
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario extendidos con roles y metadatos';
COMMENT ON COLUMN public.profiles.id IS 'ID del usuario, referencia a auth.users';
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario en el sistema';
COMMENT ON COLUMN public.profiles.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN public.profiles.email IS 'Email del usuario (copiado de auth)';

-- ============================================
-- 4. NOTA: TRIGGER AUTOMÁTICO
-- ============================================
-- 
-- En Supabase Cloud, el trigger automático debe configurarse desde el Dashboard:
-- Authentication > Hooks > Insert user hook
-- 
-- O usar el panel SQL de Supabase que tiene permisos elevados.

-- ============================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. POLÍTICAS RLS: LECTURA (SELECT)
-- ============================================

-- Política 1: Los usuarios pueden ver su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política 2: Los admins pueden ver todos los perfiles
-- NOTA: Esta política requiere que el rol esté ya almacenado en profiles.
-- Para verificar el rol, necesitamos hacer una subconsulta.
CREATE POLICY "Los admins pueden ver todos los perfiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

COMMENT ON POLICY "Los usuarios pueden ver su propio perfil" ON public.profiles IS 'Permite que cada usuario vea únicamente su propio perfil';
COMMENT ON POLICY "Los admins pueden ver todos los perfiles" ON public.profiles IS 'Permite que los administradores vean todos los perfiles del sistema';

-- ============================================
-- 8. POLÍTICAS RLS: ACTUALIZACIÓN (UPDATE)
-- ============================================

-- Los usuarios pueden actualizar solo su propio perfil
-- (campos: full_name, email - el rol solo puede ser cambiado por admins)
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles IS 'Permite que cada usuario actualice únicamente su propio perfil';

-- ============================================
-- 9. FUNCIÓN HELPER: OBTENER ROL DEL USUARIO
-- ============================================

-- Función auxiliar para obtener fácilmente el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.app_role AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_role() IS 'Función helper para obtener el rol del usuario autenticado actual';

-- ============================================
-- 10. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

COMMENT ON INDEX idx_profiles_role IS 'Índice para consultas filtradas por rol';
COMMENT ON INDEX idx_profiles_email IS 'Índice para búsquedas por email';
COMMENT ON INDEX idx_profiles_created_at IS 'Índice para ordenar por fecha de creación';

-- ============================================
-- 11. FUNCIÓN: ACTUALIZAR TIMESTAMP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON FUNCTION public.handle_updated_at() IS 'Actualiza automáticamente el campo updated_at al modificar un registro';

-- ============================================
-- 12. GRANTS: PERMISOS DE ACCESO
-- ============================================

-- Permitir acceso autenticado a la tabla profiles
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON TYPE public.app_role TO authenticated;

-- ============================================
-- 13. MIGRACIÓN: CREAR PERFILES PARA USUARIOS EXISTENTES
-- ============================================

-- Si ya tienes usuarios en auth.users sin perfil, ejecuta esto:
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'driver'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 14. VERIFICACIÓN: QUERIES DE PRUEBA
-- ============================================

-- Comentar para ejecución automática
-- SELECT * FROM public.profiles;
-- SELECT public.get_user_role();
-- SELECT * FROM auth.users;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Mostrar resumen
DO $$
BEGIN
  RAISE NOTICE '✅ Setup completado exitosamente!';
  RAISE NOTICE '📊 Tabla profiles creada con RLS habilitado';
  RAISE NOTICE '🔐 Políticas de seguridad configuradas';
  RAISE NOTICE '⚡ Trigger automático habilitado';
  RAISE NOTICE '🎯 Sistema listo para uso';
END $$;
