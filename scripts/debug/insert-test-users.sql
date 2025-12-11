-- ============================================
-- INSERTAR PERFILES DE PRUEBA
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Ve al Dashboard de Supabase → Authentication → Users
-- 2. Copia el UUID del usuario que creaste
-- 3. Reemplaza 'TU-UUID-AQUI' con ese UUID en las líneas de abajo
-- 4. Ejecuta este SQL en el SQL Editor de Supabase
--
-- IMPORTANTE: El UUID debe coincidir con el usuario creado en Authentication
-- ============================================

-- Ejemplo: Insertar perfil para un ADMIN
INSERT INTO public.profiles (id, role, full_name, email)
VALUES (
  'TU-UUID-AQUI',  -- ⚠️ REEMPLAZA CON EL UUID REAL DEL USUARIO
  'admin',
  'Administrador de Prueba',
  'admin@fletesm.cl'  -- ⚠️ DEBE SER EL MISMO EMAIL DEL USUARIO
)
ON CONFLICT (id) DO UPDATE 
SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Ejemplo: Insertar perfil para un FLEET MANAGER
-- INSERT INTO public.profiles (id, role, full_name, email)
-- VALUES (
--   'UUID-DEL-MANAGER',
--   'fleet_manager',
--   'Gerente de Flota',
--   'manager@fletesm.cl'
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET 
--   role = EXCLUDED.role,
--   full_name = EXCLUDED.full_name,
--   email = EXCLUDED.email,
--   updated_at = NOW();

-- Ejemplo: Insertar perfil para un DRIVER
-- INSERT INTO public.profiles (id, role, full_name, email)
-- VALUES (
--   'UUID-DEL-CONDUCTOR',
--   'driver',
--   'Juan Pérez',
--   'conductor@fletesm.cl'
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET 
--   role = EXCLUDED.role,
--   full_name = EXCLUDED.full_name,
--   email = EXCLUDED.email,
--   updated_at = NOW();

-- ============================================
-- VERIFICAR QUE SE INSERTÓ CORRECTAMENTE
-- ============================================

SELECT 
  id,
  role,
  full_name,
  email,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
