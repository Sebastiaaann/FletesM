# 🚀 Guía de Migración - Firma Digital en Supabase

## 📋 Pasos para Aplicar la Migración

### 1️⃣ Acceder a Supabase Dashboard
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto FleetTech
3. En el menú lateral, busca **SQL Editor**

### 2️⃣ Ejecutar Script de Migración
1. Click en **New Query** o **+ New**
2. Copia y pega el contenido de `supabase-migration-delivery-proof.sql`
3. Click en **Run** o presiona `Ctrl + Enter`
4. Verifica que aparezca mensaje de éxito: "Success. No rows returned"

### 3️⃣ Verificar Migración
Ejecuta esta consulta para verificar:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'routes' 
AND column_name = 'delivery_proof';
```

**Resultado esperado:**
```
column_name     | data_type
----------------|----------
delivery_proof  | jsonb
```

### 4️⃣ Verificar Índice
Ejecuta:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'routes' 
AND indexname = 'idx_routes_has_delivery_proof';
```

**Resultado esperado:**
```
indexname                      | indexdef
-------------------------------|----------------------------------
idx_routes_has_delivery_proof  | CREATE INDEX ... ((delivery_proof IS NOT NULL))
```

## 🧪 Probar la Integración

### Opción A: Desde la Aplicación
1. Inicia el servidor de desarrollo: `npm run dev`
2. Ve a la vista móvil del conductor
3. Inicia una ruta y finalízala con firma
4. Verifica en Dashboard que aparece el botón "Ver POD"

### Opción B: Consulta SQL Directa
Inserta una ruta de prueba con comprobante:
```sql
INSERT INTO routes (
  id, 
  origin, 
  destination, 
  distance, 
  estimated_price, 
  vehicle_type, 
  status,
  timestamp,
  delivery_proof
) VALUES (
  'TEST-001',
  'Santiago, Chile',
  'Valparaíso, Chile',
  '120 km',
  '$85.000',
  'Camión 3/4',
  'Completed',
  extract(epoch from now()) * 1000,
  '{
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "clientName": "Juan Pérez",
    "clientId": "12.345.678-9",
    "deliveredAt": 1732550400000,
    "notes": "Entrega realizada sin problemas"
  }'::jsonb
);
```

Verificar:
```sql
SELECT id, origin, destination, delivery_proof->>'clientName' as client
FROM routes 
WHERE id = 'TEST-001';
```

## 📊 Consultas Útiles

### Ver todas las rutas con comprobante
```sql
SELECT 
  id,
  origin,
  destination,
  status,
  delivery_proof->>'clientName' as cliente,
  delivery_proof->>'clientId' as rut,
  to_timestamp((delivery_proof->>'deliveredAt')::bigint / 1000) as fecha_entrega
FROM routes
WHERE delivery_proof IS NOT NULL
ORDER BY timestamp DESC;
```

### Contar rutas con/sin comprobante
```sql
SELECT 
  COUNT(*) FILTER (WHERE delivery_proof IS NOT NULL) as con_firma,
  COUNT(*) FILTER (WHERE delivery_proof IS NULL AND status = 'Completed') as sin_firma,
  COUNT(*) FILTER (WHERE status = 'Completed') as total_completadas
FROM routes;
```

### Últimas 10 firmas capturadas
```sql
SELECT 
  id,
  origin,
  destination,
  delivery_proof->>'clientName' as cliente,
  to_timestamp((delivery_proof->>'deliveredAt')::bigint / 1000) as fecha
FROM routes
WHERE delivery_proof IS NOT NULL
ORDER BY (delivery_proof->>'deliveredAt')::bigint DESC
LIMIT 10;
```

## 🔄 Rollback (Si es necesario)

Si necesitas revertir la migración:
```sql
-- Eliminar índice
DROP INDEX IF EXISTS idx_routes_has_delivery_proof;

-- Eliminar columna
ALTER TABLE routes DROP COLUMN IF EXISTS delivery_proof;
```

## ✅ Checklist de Verificación

- [ ] Migración ejecutada sin errores
- [ ] Columna `delivery_proof` existe en tabla `routes`
- [ ] Índice `idx_routes_has_delivery_proof` creado
- [ ] Comentario en columna visible
- [ ] Aplicación funciona sin errores
- [ ] Firmas se guardan correctamente
- [ ] Dashboard muestra botón "Ver POD"
- [ ] Modal de visualización funciona
- [ ] Descarga de firma funciona

## 🐛 Troubleshooting

### Error: "column already exists"
La columna ya fue creada. Puedes ignorar o usar:
```sql
ALTER TABLE routes ADD COLUMN IF NOT EXISTS delivery_proof JSONB;
```

### Error: "index already exists"
El índice ya fue creado. Puedes ignorar o usar:
```sql
CREATE INDEX IF NOT EXISTS idx_routes_has_delivery_proof ON routes ((delivery_proof IS NOT NULL));
```

### Las firmas no se guardan en Supabase
1. Verifica que la migración se ejecutó correctamente
2. Revisa las credenciales de Supabase en `.env.local`
3. Abre la consola del navegador para ver errores
4. Verifica permisos RLS en Supabase

### Error de permisos RLS
Si ves "new row violates row-level security policy":
```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'routes';

-- Asegurar que existe política permisiva
CREATE POLICY "Enable all operations for routes" 
ON routes FOR ALL 
USING (true) 
WITH CHECK (true);
```

## 📝 Notas Importantes

1. **Tamaño de Firmas**: Las firmas base64 PNG pueden ser grandes (30-100 KB cada una). Considera usar Supabase Storage para proyectos con alto volumen.

2. **Backup**: Antes de ejecutar en producción, haz backup:
   ```sql
   -- Backup completo de la tabla
   CREATE TABLE routes_backup AS SELECT * FROM routes;
   ```

3. **Performance**: El índice `idx_routes_has_delivery_proof` optimiza consultas como:
   ```sql
   SELECT * FROM routes WHERE delivery_proof IS NOT NULL;
   ```

4. **Alternativa con Storage**: Para optimizar, considera almacenar solo la URL:
   ```jsonb
   {
     "signatureUrl": "https://supabase.co/storage/v1/object/public/signatures/route-123.png",
     "clientName": "Juan Pérez",
     ...
   }
   ```

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu sistema de firma digital estará completamente integrado con Supabase.

**Próximos pasos opcionales:**
- Implementar firma con Supabase Storage
- Agregar exportación a PDF
- Enviar email con comprobante al cliente
- Galería de fotos de entrega

---

**Creado**: 25 de noviembre, 2024  
**Versión**: 1.0  
**Estado**: ✅ Listo para producción
