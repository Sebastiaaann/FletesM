-- ============================================
-- HABILITAR RLS CON POLÍTICAS CORRECTAS
-- ============================================
-- Ejecutar en SQL Editor de Supabase después de confirmar que funciona sin RLS

-- 1. HABILITAR RLS DE NUEVO
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. CREAR POLÍTICA: Usuario puede ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. CREAR POLÍTICA: Admins pueden ver todos los perfiles
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

-- 4. CREAR POLÍTICA: Usuario puede actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. VERIFICAR LAS POLÍTICAS
SELECT 
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- 6. TEST: Verificar que puedes leer tu perfil con RLS habilitado
SELECT 
  id,
  role,
  full_name,
  email
FROM public.profiles
WHERE id = auth.uid();
