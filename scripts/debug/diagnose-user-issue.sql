-- ============================================
-- DIAGNÓSTICO: Verificar estado de usuario
-- ============================================
-- Este script te ayuda a diagnosticar por qué un usuario no tiene rol
-- ============================================

-- 1. Verificar si el usuario existe en auth.users
SELECT 
  '1️⃣ Usuario en auth.users' as paso,
  id,
  email,
  created_at,
  CASE 
    WHEN id IS NOT NULL THEN '✅ Usuario existe'
    ELSE '❌ Usuario NO existe'
  END as estado
FROM auth.users 
WHERE email = 'sebastian.almo9@gmail.com';

-- 2. Verificar si tiene perfil en profiles
SELECT 
  '2️⃣ Perfil en public.profiles' as paso,
  id,
  email,
  role,
  full_name,
  CASE 
    WHEN id IS NOT NULL THEN '✅ Perfil existe'
    ELSE '❌ Perfil NO existe (ESTE ES EL PROBLEMA)'
  END as estado
FROM public.profiles 
WHERE email = 'sebastian.almo9@gmail.com';

-- 3. Verificar trigger automático
SELECT 
  '3️⃣ Trigger automático' as paso,
  tgname as nombre_trigger,
  tgenabled as habilitado,
  CASE 
    WHEN tgname IS NOT NULL THEN '✅ Trigger existe'
    ELSE '❌ Trigger NO existe'
  END as estado
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 4. Verificar función del trigger
SELECT 
  '4️⃣ Función del trigger' as paso,
  proname as nombre_funcion,
  CASE 
    WHEN proname IS NOT NULL THEN '✅ Función existe'
    ELSE '❌ Función NO existe'
  END as estado
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 5. Verificar permisos en la tabla profiles
SELECT 
  '5️⃣ Permisos de la tabla' as paso,
  grantee as rol,
  privilege_type as permiso,
  CASE 
    WHEN grantee IN ('authenticated', 'anon') THEN '✅ Tiene permisos'
    ELSE '⚠️ Revisar permisos'
  END as estado
FROM information_schema.role_table_grants
WHERE table_name = 'profiles'
AND grantee IN ('authenticated', 'anon', 'postgres');

-- 6. Verificar políticas RLS
SELECT 
  '6️⃣ Políticas RLS' as paso,
  policyname as nombre_politica,
  cmd as comando,
  qual as condicion,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ Política existe'
    ELSE '❌ Sin políticas RLS'
  END as estado
FROM pg_policies 
WHERE tablename = 'profiles';

-- ============================================
-- RESUMEN
-- ============================================
-- Si el paso 1 muestra ✅ y el paso 2 muestra ❌
-- → Ejecuta fix-missing-profile.sql
--
-- Si el paso 3 o 4 muestra ❌
-- → Configura el trigger automático
--
-- Si el paso 5 muestra problemas
-- → Ejecuta verify-grants.sql
-- ============================================
