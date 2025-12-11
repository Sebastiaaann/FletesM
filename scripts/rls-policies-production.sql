-- =====================================================
-- POLÍTICAS RLS RESTRICTIVAS PARA PRODUCCIÓN
-- FleetTech - Diciembre 2025
-- =====================================================

-- IMPORTANTE: Ejecutar en Supabase SQL Editor
-- Estas políticas reemplazan las permisivas actuales

-- =====================================================
-- 1. TABLA: profiles
-- =====================================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Enable all operations for profiles" ON profiles;

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Usuarios pueden actualizar su propio perfil (excepto role)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND OLD.role = NEW.role -- Prevenir cambio de rol
);

-- Solo admins pueden crear perfiles
CREATE POLICY "Admins can insert profiles"
ON profiles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Solo admins pueden eliminar perfiles
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- 2. TABLA: drivers
-- =====================================================

DROP POLICY IF EXISTS "Enable all operations for drivers" ON drivers;

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver conductores disponibles
CREATE POLICY "Anyone can view drivers"
ON drivers FOR SELECT
USING (true);

-- Solo admins pueden gestionar conductores
CREATE POLICY "Admins can manage drivers"
ON drivers FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- 3. TABLA: vehicles
-- =====================================================

DROP POLICY IF EXISTS "Enable all operations for vehicles" ON vehicles;

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden ver vehículos
CREATE POLICY "Authenticated users can view vehicles"
ON vehicles FOR SELECT
USING (auth.role() = 'authenticated');

-- Solo admins pueden gestionar vehículos
CREATE POLICY "Admins can manage vehicles"
ON vehicles FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- 4. TABLA: routes
-- =====================================================

DROP POLICY IF EXISTS "Enable all operations for routes" ON routes;

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Admins y clientes pueden ver todas las rutas
-- Conductores solo ven sus rutas asignadas
CREATE POLICY "Users can view relevant routes"
ON routes FOR SELECT
USING (
  -- Admins ven todo
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR
  -- Conductores ven sus rutas
  driver_id IN (
    SELECT id FROM drivers
    WHERE drivers.user_id = auth.uid()
  )
  OR
  -- Clientes ven sus rutas (si agregaste campo client_id)
  client_id = auth.uid()
);

-- Solo admins pueden crear rutas
CREATE POLICY "Admins can create routes"
ON routes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins y conductores asignados pueden actualizar
CREATE POLICY "Admins and assigned drivers can update routes"
ON routes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR
  driver_id IN (
    SELECT id FROM drivers
    WHERE drivers.user_id = auth.uid()
  )
);

-- Solo admins pueden eliminar
CREATE POLICY "Admins can delete routes"
ON routes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- 5. TABLA: gps_locations
-- =====================================================

DROP POLICY IF EXISTS "Enable all operations for gps_locations" ON gps_locations;

ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver ubicaciones de sus rutas
CREATE POLICY "Users can view route locations"
ON gps_locations FOR SELECT
USING (
  route_id IN (
    SELECT id FROM routes
    WHERE 
      -- Admin ve todo
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
      OR
      -- Conductor de la ruta
      routes.driver_id IN (
        SELECT id FROM drivers
        WHERE drivers.user_id = auth.uid()
      )
      OR
      -- Cliente de la ruta
      routes.client_id = auth.uid()
  )
);

-- Solo conductores asignados pueden insertar ubicaciones
CREATE POLICY "Assigned drivers can insert locations"
ON gps_locations FOR INSERT
WITH CHECK (
  route_id IN (
    SELECT id FROM routes
    WHERE routes.driver_id IN (
      SELECT id FROM drivers
      WHERE drivers.user_id = auth.uid()
    )
  )
);

-- =====================================================
-- 6. TABLA: delivery_proofs
-- =====================================================

DROP POLICY IF EXISTS "Enable all operations for delivery_proofs" ON delivery_proofs;

ALTER TABLE delivery_proofs ENABLE ROW LEVEL SECURITY;

-- Similar a gps_locations
CREATE POLICY "Users can view delivery proofs"
ON delivery_proofs FOR SELECT
USING (
  route_id IN (
    SELECT id FROM routes
    WHERE 
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
      OR
      routes.driver_id IN (
        SELECT id FROM drivers
        WHERE drivers.user_id = auth.uid()
      )
      OR
      routes.client_id = auth.uid()
  )
);

-- Solo conductores asignados pueden insertar POD
CREATE POLICY "Assigned drivers can insert delivery proofs"
ON delivery_proofs FOR INSERT
WITH CHECK (
  route_id IN (
    SELECT id FROM routes
    WHERE routes.driver_id IN (
      SELECT id FROM drivers
      WHERE drivers.user_id = auth.uid()
    )
  )
);

-- =====================================================
-- 7. STORAGE: delivery-photos bucket
-- =====================================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Public read delivery photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- Lectura pública (o restringir si prefieres)
CREATE POLICY "Authenticated users can view delivery photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'delivery-photos'
  AND auth.role() = 'authenticated'
);

-- Solo conductores pueden subir fotos
CREATE POLICY "Drivers can upload delivery photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'delivery-photos'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('driver', 'admin')
  )
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ejecuta esto para confirmar que RLS está habilitado:
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'drivers', 'vehicles', 'routes', 'gps_locations', 'delivery_proofs');

-- Ver todas las políticas activas:
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

-- 1. **Campo user_id en drivers**: 
--    Si aún no existe, agregarlo:
--    ALTER TABLE drivers ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. **Campo client_id en routes**:
--    Si quieres que clientes vean sus rutas:
--    ALTER TABLE routes ADD COLUMN client_id UUID REFERENCES auth.users(id);

-- 3. **Testing**:
--    Antes de aplicar en producción, prueba con usuarios reales
--    en desarrollo para verificar que las políticas funcionan.

-- 4. **Rollback**:
--    Si algo falla, puedes desactivar RLS temporalmente:
--    ALTER TABLE [tabla] DISABLE ROW LEVEL SECURITY;
--    (Pero NUNCA en producción)

-- =====================================================
-- FIN
-- =====================================================
