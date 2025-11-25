-- ========================================
-- MIGRACIÓN: Agregar campo 'city' a vehículos
-- ========================================
-- Ejecuta este script en Supabase SQL Editor

-- 1. Agregar columna 'city' a la tabla vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. (Opcional) Actualizar vehículos existentes con ciudades de ejemplo
UPDATE vehicles SET city = 'Puerto Montt' WHERE id = 'V-001';
UPDATE vehicles SET city = 'Santiago' WHERE id = 'V-002';
UPDATE vehicles SET city = 'Valdivia' WHERE id = 'V-003';

-- 3. Verificar la actualización
SELECT id, plate, model, city, location_lat, location_lng FROM vehicles;

-- ========================================
-- INSTRUCCIONES:
-- ========================================
-- 1. Copia este SQL completo
-- 2. Ve a tu proyecto en Supabase Dashboard
-- 3. Abre el SQL Editor
-- 4. Pega el código y ejecuta
-- 5. La columna 'city' estará disponible para todos los vehículos
-- ========================================
