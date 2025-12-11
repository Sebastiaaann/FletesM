-- ============================================
-- FIX: CREAR PERFIL FALTANTE PARA USUARIO
-- ============================================
-- Este script crea un perfil para un usuario que ya existe en auth.users
-- pero que no tiene registro en la tabla profiles.
-- 
-- PROBLEMA: Usuario puede autenticarse pero la app no encuentra su rol.
-- SOLUCIÓN: Crear el registro en profiles asociado al UUID del usuario.
-- ============================================

-- PASO 1: Primero, obtén el UUID del usuario
-- Ejecuta esta consulta para encontrar el UUID del usuario:
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'sebastian.almo9@gmail.com';

-- PASO 2: Copia el UUID del resultado anterior y úsalo en la siguiente inserción
-- Reemplaza 'UUID-DEL-USUARIO' con el UUID real que obtuviste

-- OPCIÓN A: Si conoces el UUID, inserta directamente
-- INSERT INTO public.profiles (id, role, full_name, email)
-- VALUES (
--   'UUID-DEL-USUARIO',  -- ⚠️ REEMPLAZA con el UUID del usuario
--   'admin',             -- Puedes cambiar a 'fleet_manager' o 'driver' según corresponda
--   'Sebastian Almo',    -- Nombre del usuario
--   'sebastian.almo9@gmail.com'
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET 
--   role = EXCLUDED.role,
--   full_name = EXCLUDED.full_name,
--   email = EXCLUDED.email,
--   updated_at = NOW();

-- OPCIÓN B: Insertar automáticamente usando el email (más seguro)
-- Esta opción busca el UUID automáticamente basándose en el email
INSERT INTO public.profiles (id, role, full_name, email)
SELECT 
  id,
  'admin'::app_role,  -- Cambia a 'fleet_manager' o 'driver' si es necesario
  'Sebastian Almo',   -- Cambia el nombre según corresponda
  email
FROM auth.users
WHERE email = 'sebastian.almo9@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- PASO 3: Verificar que se creó correctamente
SELECT 
  p.id,
  p.email,
  p.role,
  p.full_name,
  p.created_at
FROM public.profiles p
WHERE p.email = 'sebastian.almo9@gmail.com';

-- ============================================
-- PREVENCIÓN: Crear trigger automático (si no existe)
-- ============================================
-- Este trigger asegura que cuando se cree un usuario en auth.users,
-- automáticamente se cree su perfil en profiles.

-- Verificar si ya existe el trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Si no existe, crear función y trigger:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, full_name)
  VALUES (
    NEW.id,
    'driver'::app_role,  -- Rol por defecto
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario Nuevo')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger (ejecutar solo si no existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Este script debe ejecutarse en el SQL Editor de Supabase
-- 2. Usa la OPCIÓN B para insertar automáticamente
-- 3. Ajusta el rol según las necesidades del usuario:
--    - 'admin': Acceso completo al sistema
--    - 'fleet_manager': Gestión de flotas y rutas
--    - 'driver': Vista móvil para conductores
-- 4. El trigger previene este problema en el futuro
-- ============================================
