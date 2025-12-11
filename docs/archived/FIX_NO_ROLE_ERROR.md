# 🔧 Solución: Error "No role found for user"

## 📋 Problema Identificado

El usuario `sebastian.almo9@gmail.com` puede autenticarse en Supabase Auth, pero **no tiene un registro en la tabla `profiles`**, lo que causa que la aplicación no pueda determinar su rol.

## 🎯 Causa Raíz

Cuando se creó el usuario en Supabase Authentication, no se creó automáticamente su perfil en la tabla `profiles`. Esto puede ocurrir si:

1. El trigger automático no está configurado
2. El usuario se creó antes de configurar el trigger
3. Hubo un error al crear el perfil durante el registro

## ✅ Solución Inmediata

### Opción 1: Usando SQL en Supabase (RECOMENDADO)

1. **Abre el SQL Editor en Supabase Dashboard**
   - Ve a tu proyecto en Supabase
   - Navega a `SQL Editor`

2. **Ejecuta este script** (`fix-missing-profile.sql`):

```sql
-- Crear perfil para el usuario faltante
INSERT INTO public.profiles (id, role, full_name, email)
SELECT 
  id,
  'admin'::app_role,  -- Cambia a 'fleet_manager' o 'driver' si es necesario
  'Sebastian Almo',
  email
FROM auth.users
WHERE email = 'sebastian.almo9@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = NOW();
```

3. **Verifica que se creó correctamente**:

```sql
SELECT 
  p.id,
  p.email,
  p.role,
  p.full_name,
  p.created_at
FROM public.profiles p
WHERE p.email = 'sebastian.almo9@gmail.com';
```

### Opción 2: Manual (Si prefieres pasos individuales)

1. **Obtén el UUID del usuario**:
```sql
SELECT id, email 
FROM auth.users 
WHERE email = 'sebastian.almo9@gmail.com';
```

2. **Copia el UUID y ejecuta**:
```sql
INSERT INTO public.profiles (id, role, full_name, email)
VALUES (
  'PEGA-EL-UUID-AQUI',
  'admin',
  'Sebastian Almo',
  'sebastian.almo9@gmail.com'
);
```

## 🛡️ Prevención: Configurar Trigger Automático

Para evitar este problema en el futuro, configura un trigger que cree automáticamente el perfil cuando se registre un usuario:

```sql
-- Función que se ejecutará al crear un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, full_name)
  VALUES (
    NEW.id,
    'driver'::app_role,  -- Rol por defecto
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario Nuevo')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 🔍 Verificación Post-Fix

Después de ejecutar el script, verifica que todo funcione:

1. **Refresca la página** en tu navegador
2. **Inicia sesión nuevamente** con `sebastian.almo9@gmail.com`
3. La aplicación debería cargar sin errores

## 📊 Roles Disponibles

Puedes asignar cualquiera de estos roles al usuario:

- `'admin'` - Acceso completo al sistema (Dashboard, Fleet Manager, etc.)
- `'fleet_manager'` - Gestión de flotas, rutas y conductores
- `'driver'` - Vista móvil exclusiva para conductores

## 🚨 Solución de Problemas

Si el error persiste después de ejecutar el script:

1. **Verifica los permisos de la tabla**:
```sql
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'profiles'
AND grantee IN ('authenticated', 'anon');
```

2. **Verifica las políticas RLS**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

3. **Limpia el caché del navegador**:
   - Presiona `Ctrl + Shift + R` (Windows/Linux)
   - Presiona `Cmd + Shift + R` (Mac)

4. **Revisa la consola del navegador** para más detalles del error

## 📁 Archivos Relacionados

- `fix-missing-profile.sql` - Script de solución
- `supabase-auth-setup.sql` - Configuración completa de auth
- `insert-test-users.sql` - Template para insertar usuarios
- `verify-grants.sql` - Verificación de permisos

## 🎓 Aprende Más

Este error es común cuando:
- Se migra de un sistema de auth a otro
- Se crean usuarios manualmente en Supabase Dashboard
- No se ha configurado el trigger automático

**Siempre asegúrate de que el trigger esté configurado antes de crear usuarios en producción.**
