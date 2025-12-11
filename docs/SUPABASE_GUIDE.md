# 🗄️ Guía Completa de Supabase - FleetTech

> **Documento consolidado**: Configuración, integración, migración y troubleshooting

---

## 📋 Tabla de Contenidos

1. [Setup Inicial](#setup-inicial)
2. [Integración con Auth](#integración-con-auth)
3. [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
4. [Firma Digital y POD](#firma-digital-y-pod)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una nueva organización y proyecto
3. Guarda las credenciales:
   - `Project URL`: `https://[tu-proyecto].supabase.co`
   - `anon/public key`: Clave pública para el cliente

### 2. Variables de Entorno

Crea archivo `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://[tu-proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
VITE_GEMINI_API_KEY=tu-gemini-key
```

⚠️ **IMPORTANTE**: `.env.local` debe estar en `.gitignore`

### 3. Cliente TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

---

## 🔐 Integración con Auth

### Esquema de Autenticación

**Tablas principales**:
- `auth.users` (gestionada por Supabase)
- `public.profiles` (datos extendidos del usuario)

### Crear Tabla Profiles

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'driver', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Auth Flow en React

```typescript
// contexts/AuthContext.tsx
const { data: { session } } = await supabase.auth.getSession();

if (session?.user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  setUser(session.user);
  setProfile(profile);
}
```

---

## 🗃️ Migraciones de Base de Datos

### Estructura Principal

Ejecuta en **SQL Editor** de Supabase:

```sql
-- 1. Tabla de conductores
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT UNIQUE,
  status TEXT CHECK (status IN ('Available', 'On Route', 'Off Duty')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de vehículos
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL,
  license_plate TEXT UNIQUE NOT NULL,
  capacity NUMERIC,
  status TEXT CHECK (status IN ('Active', 'Maintenance', 'Inactive')),
  mileage INTEGER,
  fuel_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de rutas
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance NUMERIC,
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  status TEXT CHECK (status IN ('Planned', 'In Progress', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ubicaciones GPS
CREATE TABLE gps_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Pruebas de entrega (POD)
CREATE TABLE delivery_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  signature_data TEXT, -- Base64 de la firma
  photo_url TEXT,
  notes TEXT,
  delivered_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Índices para Performance

```sql
CREATE INDEX idx_routes_driver ON routes(driver_id);
CREATE INDEX idx_routes_vehicle ON routes(vehicle_id);
CREATE INDEX idx_gps_route ON gps_locations(route_id);
CREATE INDEX idx_delivery_route ON delivery_proofs(route_id);
```

---

## ✍️ Firma Digital y POD

### Setup de Storage

1. Ve a **Storage** en Supabase Dashboard
2. Crea bucket `delivery-photos` (público)
3. Configura políticas:

```sql
-- Política de lectura pública
CREATE POLICY "Public read delivery photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'delivery-photos');

-- Política de escritura autenticada
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'delivery-photos' 
  AND auth.role() = 'authenticated'
);
```

### Componente de Firma

```tsx
import SignaturePad from './SignaturePad';

const DeliveryProof = () => {
  const handleSave = async (signatureDataUrl: string) => {
    const { error } = await supabase
      .from('delivery_proofs')
      .insert({
        route_id: routeId,
        signature_data: signatureDataUrl,
      });
  };
  
  return <SignaturePad onSave={handleSave} />;
};
```

---

## 🔒 Row Level Security (RLS)

### ¿Por Qué RLS?

RLS protege tus datos a nivel de fila según el usuario autenticado. **Nunca desactives en producción**.

### Políticas Recomendadas

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Solo admins pueden gestionar conductores
CREATE POLICY "Admins manage drivers"
ON drivers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Conductores pueden ver sus rutas asignadas
CREATE POLICY "Drivers view own routes"
ON routes FOR SELECT
USING (
  driver_id IN (
    SELECT id FROM drivers
    WHERE drivers.user_id = auth.uid()
  )
);
```

### Desarrollo vs Producción

**⚠️ Solo para desarrollo local**:
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**✅ En producción, usa políticas específicas**.

---

## 🛠️ Troubleshooting

### Error: "No role found for user"

**Causa**: Profile no existe en `public.profiles`

**Solución**:
```sql
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'user-uuid-aqui',
  'usuario@email.com',
  'Nombre Completo',
  'admin'
);
```

### Error: Query timeout

**Causa**: RLS bloqueando consultas

**Debug**:
```sql
-- Verificar estado RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Error: 400 Bad Request

**Causas comunes**:
1. Columna inexistente en query
2. Constraint violado (UNIQUE, CHECK)
3. RLS sin política para la operación

**Debug**:
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

console.log('Error details:', error);
```

### Performance Lento

**Optimizaciones**:
1. Agregar índices en columnas frecuentemente consultadas
2. Usar `.select()` específico en vez de `*`
3. Implementar cache en frontend
4. Usar Supabase Realtime solo cuando necesario

---

## 📚 Recursos Adicionales

- [Supabase Docs](https://supabase.com/docs)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

**Última actualización**: Diciembre 2025
**Mantenido por**: Equipo FleetTech
