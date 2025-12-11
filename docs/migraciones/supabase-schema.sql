-- FleetTech - Supabase Database Schema (Express Mode)
-- Copia este SQL y ejecútalo en Supabase SQL Editor

-- 1. Tabla de Conductores
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rut TEXT UNIQUE NOT NULL,
    license_type TEXT NOT NULL,
    license_expiry TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Available', 'On Route', 'Off Duty')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Vehículos
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    plate TEXT UNIQUE NOT NULL,
    model TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Maintenance', 'Idle')),
    mileage INTEGER NOT NULL DEFAULT 0,
    fuel_level INTEGER NOT NULL DEFAULT 100 CHECK (fuel_level >= 0 AND fuel_level <= 100),
    next_service TEXT NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Rutas
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance TEXT NOT NULL,
    estimated_price TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    driver TEXT,
    vehicle TEXT,
    timestamp BIGINT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    delivery_proof JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_driver ON routes(driver);
CREATE INDEX IF NOT EXISTS idx_routes_timestamp ON routes(timestamp);
CREATE INDEX IF NOT EXISTS idx_routes_has_delivery_proof ON routes ((delivery_proof IS NOT NULL));
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

-- Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales (mock data)
INSERT INTO drivers (id, name, rut, license_type, license_expiry, status) VALUES
('D-1', 'Carlos Mendoza', '12345678-5', 'A5', '2025-03-15', 'On Route'),
('D-2', 'Ana Silva', '15432198-K', 'A4', '2024-11-20', 'Available'),
('D-3', 'Jorge O''Ryan', '9876543-2', 'A5', '2023-12-01', 'Off Duty')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, plate, model, status, mileage, fuel_level, next_service) VALUES
('V-001', 'HG-LF-99', 'Volvo FH16', 'Active', 120500, 75, '2024-11-15'),
('V-002', 'JS-KK-22', 'Scania R450', 'Maintenance', 240100, 10, '2024-10-28'),
('V-003', 'LK-MM-11', 'Mercedes Actros', 'Active', 85000, 92, '2024-12-01')
ON CONFLICT (id) DO NOTHING;

-- Habilitar Row Level Security (RLS) - Modo básico para desarrollo
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo (permitir todo)
CREATE POLICY "Enable all operations for drivers" ON drivers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for vehicles" ON vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for routes" ON routes FOR ALL USING (true) WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE drivers IS 'Tabla de conductores del sistema FleetTech';
COMMENT ON TABLE vehicles IS 'Tabla de vehículos de la flota';
COMMENT ON TABLE routes IS 'Tabla de rutas registradas en el sistema';
COMMENT ON COLUMN routes.delivery_proof IS 'JSON object containing delivery proof data: signature (base64 PNG), clientName, clientId, deliveredAt timestamp, and notes';

-- ========================================
-- MIGRACIÓN: Agregar columna 'city' a tabla existente
-- ========================================
-- Ejecuta esto SOLO si ya tienes la tabla vehicles creada sin el campo city
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS city TEXT;
