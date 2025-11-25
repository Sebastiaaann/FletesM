# 🗄️ Configuración de Supabase para FleetTech

Esta guía te ayudará a configurar la base de datos en Supabase para tu proyecto FleetTech.

## 📋 Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa los datos:
   - **Name**: FleetTech
   - **Database Password**: (guarda esta contraseña de forma segura)
   - **Region**: Elige la más cercana a tu ubicación
   - **Pricing Plan**: Free (suficiente para empezar)

## 🔑 Paso 2: Obtener las Credenciales

1. Una vez creado el proyecto, ve a **Settings → API**
2. Copia estos valores:
   - **Project URL**: `https://tuproyecto.supabase.co`
   - **anon/public key**: La key que empieza con `eyJ...`

3. Agrega estas credenciales a tu archivo `.env.local`:

```env
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## 🏗️ Paso 3: Crear las Tablas

Ve a **SQL Editor** en tu dashboard de Supabase y ejecuta este script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- VEHICLES TABLE
-- ============================================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Idle')),
    mileage DECIMAL(10, 2) DEFAULT 0,
    fuel_level DECIMAL(5, 2) DEFAULT 100,
    capacity_tons DECIMAL(8, 2),
    fuel_consumption_per_km DECIMAL(6, 2),
    fixed_monthly_cost DECIMAL(12, 2),
    next_service_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- DRIVERS TABLE
-- ============================================
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    rut VARCHAR(12) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    license_type VARCHAR(10) NOT NULL,
    license_expiry DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'On Route', 'Off Duty')),
    performance_score DECIMAL(3, 2) DEFAULT 0,
    salary_per_route DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    rut VARCHAR(12) UNIQUE NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    rating DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ROUTES TABLE
-- ============================================
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin VARCHAR(255) NOT NULL,
    origin_lat DECIMAL(10, 8),
    origin_lng DECIMAL(11, 8),
    destination VARCHAR(255) NOT NULL,
    destination_lat DECIMAL(10, 8),
    destination_lng DECIMAL(11, 8),
    distance_km DECIMAL(10, 2) NOT NULL,
    estimated_duration_hours DECIMAL(6, 2),
    actual_duration_hours DECIMAL(6, 2),
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    driver_id UUID REFERENCES drivers(id),
    vehicle_id UUID REFERENCES vehicles(id),
    client_id UUID REFERENCES clients(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- CARGO TABLE
-- ============================================
CREATE TABLE cargo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    weight_tons DECIMAL(8, 2) NOT NULL,
    cargo_type VARCHAR(50) CHECK (cargo_type IN ('fragile', 'refrigerated', 'dangerous', 'normal')),
    declared_value DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROUTE COSTS TABLE
-- ============================================
CREATE TABLE route_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID UNIQUE REFERENCES routes(id) ON DELETE CASCADE,
    fuel_cost DECIMAL(12, 2) DEFAULT 0,
    toll_cost DECIMAL(12, 2) DEFAULT 0,
    driver_wage DECIMAL(12, 2) DEFAULT 0,
    insurance_cost DECIMAL(12, 2) DEFAULT 0,
    maintenance_cost DECIMAL(12, 2) DEFAULT 0,
    other_costs DECIMAL(12, 2) DEFAULT 0,
    total_cost DECIMAL(12, 2) GENERATED ALWAYS AS (
        fuel_cost + toll_cost + driver_wage + insurance_cost + maintenance_cost + other_costs
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROUTE REVENUE TABLE
-- ============================================
CREATE TABLE route_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID UNIQUE REFERENCES routes(id) ON DELETE CASCADE,
    quoted_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
    invoice_date DATE,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MAINTENANCE TABLE
-- ============================================
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) CHECK (maintenance_type IN ('preventive', 'corrective', 'mandatory')),
    description TEXT NOT NULL,
    cost DECIMAL(12, 2) NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    next_maintenance_date DATE,
    workshop_provider VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- COMPLIANCE DOCUMENTS TABLE
-- ============================================
CREATE TABLE compliance_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('license', 'insurance', 'permit', 'technical_inspection')),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('driver', 'vehicle')),
    entity_id UUID NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) GENERATED ALWAYS AS (
        CASE 
            WHEN expiry_date < CURRENT_DATE THEN 'expired'
            WHEN expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
            ELSE 'valid'
        END
    ) STORED,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- GPS TRACKING TABLE
-- ============================================
CREATE TABLE gps_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(6, 2) DEFAULT 0,
    engine_on BOOLEAN DEFAULT true,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_vehicles_status ON vehicles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_drivers_status ON drivers(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_routes_status ON routes(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_routes_driver ON routes(driver_id);
CREATE INDEX idx_routes_vehicle ON routes(vehicle_id);
CREATE INDEX idx_gps_route ON gps_tracking(route_id, timestamp DESC);
CREATE INDEX idx_compliance_expiry ON compliance_documents(expiry_date) WHERE deleted_at IS NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_costs_updated_at BEFORE UPDATE ON route_costs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_revenue_updated_at BEFORE UPDATE ON route_revenue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔐 Paso 4: Configurar Row Level Security (RLS)

Para mayor seguridad, ejecuta estos comandos:

```sql
-- Enable RLS on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (puedes personalizarlas después)
CREATE POLICY "Enable all operations for authenticated users" ON vehicles FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON drivers FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON routes FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON clients FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON cargo FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON route_costs FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON route_revenue FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON maintenance FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON compliance_documents FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON gps_tracking FOR ALL USING (true);
```

## 📊 Paso 5: Insertar Datos de Prueba (Opcional)

```sql
-- Insert test vehicles
INSERT INTO vehicles (plate, brand, model, year, vehicle_type, status, mileage, capacity_tons) VALUES
('AB-1234', 'Volvo', 'FH16', 2020, 'Semi-trailer', 'Active', 150000, 28),
('CD-5678', 'Scania', 'R450', 2021, 'Semi-trailer', 'Active', 80000, 26),
('EF-9012', 'Mercedes-Benz', 'Actros', 2019, 'Semi-trailer', 'Maintenance', 200000, 25);

-- Insert test drivers
INSERT INTO drivers (name, rut, license_type, license_expiry, status) VALUES
('Carlos Mendoza', '12345678-9', 'A2', '2025-12-31', 'Available'),
('Ana Silva', '98765432-1', 'A4', '2026-06-30', 'Available'),
('Jorge O''Ryan', '11223344-5', 'A2', '2025-08-15', 'On Route');

-- Insert test client
INSERT INTO clients (name, rut, contact_name, contact_email) VALUES
('Transportes ABC Ltda.', '76543210-K', 'Juan Pérez', 'juan@abc.cl');
```

## ✅ Paso 6: Verificar la Conexión

En tu aplicación, abre la consola del navegador. Deberías ver:

```
✅ Supabase connected successfully!
```

Si ves este mensaje, ¡tu conexión está funcionando!

## 🔧 Solución de Problemas

### Error: "relation does not exist"
Las tablas no se crearon correctamente. Vuelve a ejecutar el script de creación.

### Error: "Invalid API key"
Verifica que estés usando la **anon key** y no la service_role key.

### Error: "Row Level Security"
Si tienes problemas de permisos, temporalmente puedes desactivar RLS para debugging:
```sql
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

¡Listo! Tu base de datos está configurada y conectada a FleetTech. 🚀
