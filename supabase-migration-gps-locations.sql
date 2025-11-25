-- Migración GPS: Actualizar vehículos existentes con ubicaciones en Puerto Montt, Chile
-- Ejecuta este script en Supabase SQL Editor si quieres agregar ubicaciones de prueba

-- Actualizar vehículos existentes con ubicaciones en Puerto Montt
UPDATE vehicles 
SET 
    location_lat = -41.4693,
    location_lng = -72.9424,
    city = 'Puerto Montt'
WHERE id = 'V-001';

UPDATE vehicles 
SET 
    location_lat = -41.4721,
    location_lng = -72.9367,
    city = 'Puerto Montt'
WHERE id = 'V-002';

UPDATE vehicles 
SET 
    location_lat = -41.4665,
    location_lng = -72.9481,
    city = 'Puerto Montt'
WHERE id = 'V-003';

-- Agregar más vehículos de prueba con diferentes ubicaciones en Puerto Montt
INSERT INTO vehicles (id, plate, model, status, mileage, fuel_level, next_service, location_lat, location_lng, city) VALUES
('V-004', 'PT-AA-45', 'Iveco Stralis', 'Active', 145000, 88, '2024-12-10', -41.4712, -72.9401, 'Puerto Montt'),
('V-005', 'PT-BB-67', 'DAF XF', 'Active', 67000, 95, '2024-12-20', -41.4680, -72.9445, 'Puerto Montt'),
('V-006', 'PT-CC-89', 'MAN TGX', 'Idle', 180000, 45, '2024-11-25', -41.4705, -72.9388, 'Puerto Montt')
ON CONFLICT (id) DO UPDATE SET
    location_lat = EXCLUDED.location_lat,
    location_lng = EXCLUDED.location_lng,
    city = EXCLUDED.city;

-- Verificar que las ubicaciones se actualizaron correctamente
SELECT id, plate, model, status, location_lat, location_lng, city
FROM vehicles
WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- Comentario informativo
COMMENT ON COLUMN vehicles.location_lat IS 'Latitud GPS del vehículo (-90 a 90)';
COMMENT ON COLUMN vehicles.location_lng IS 'Longitud GPS del vehículo (-180 a 180)';
