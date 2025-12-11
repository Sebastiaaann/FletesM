-- ============================================
-- FIX: Políticas RLS para tabla profiles
-- ============================================
-- Este script arregla el problema de acceso a perfiles
-- Ejecutar en SQL Editor de Supabase

-- 1. LIMPIAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;

-- 2. VERIFICAR QUE RLS ESTÁ HABILITADO
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. CREAR POLÍTICA DE LECTURA SIMPLE Y FUNCIONAL
-- Esta política permite que cada usuario autenticado vea su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4. CREAR POLÍTICA DE ACTUALIZACIÓN
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. POLÍTICA PARA QUE ADMINS VEAN TODO
-- Esta usa una subconsulta para verificar si el usuario actual es admin
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- VERIFICACIÓN: Listar políticas activas
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================
-- TEST: Verificar que puedes leer tu perfil
-- ============================================
-- Ejecuta esto DESPUÉS de las políticas para verificar
SELECT 
  id,
  role,
  full_name,
  email
FROM public.profiles
WHERE id = auth.uid();
