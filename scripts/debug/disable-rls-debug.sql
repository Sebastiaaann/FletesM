-- ============================================
-- SOLUCIÓN DE EMERGENCIA: DESHABILITAR RLS
-- ============================================
-- ⚠️ SOLO PARA DESARROLLO/DEBUG
-- NO USAR EN PRODUCCIÓN
-- ============================================

-- Deshabilitar RLS temporalmente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- Ahora intenta recargar la app

-- ============================================
-- PARA VOLVER A HABILITAR (después de verificar):
-- ============================================
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
