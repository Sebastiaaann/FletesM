/**
 * GUÍA DE IMPLEMENTACIÓN - Sistema de Autenticación
 * 
 * Pasos para integrar el sistema de autenticación en tu aplicación.
 */

## 📋 Checklist de Implementación

### 1. Variables de Entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 2. Ejecutar el Script SQL en Supabase

1. Ve al Dashboard de Supabase
2. Abre el Editor SQL
3. Ejecuta el script SQL completo que generamos
4. Verifica que la tabla `profiles` se creó correctamente

### 3. Envolver la App con AuthProvider

Edita tu archivo `App.tsx` o `index.tsx`:

```tsx
import { AuthProvider } from './src/contexts/AuthContext';
import App from './App';

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default Root;
```

### 4. Usar el Hook useAuth en Componentes

```tsx
import { useAuth } from './src/hooks/useAuth';

function MyComponent() {
  const { user, profile, loading, isAuthenticated, signOut } = useAuth();

  if (loading) return <div>Cargando...</div>;
  
  if (!isAuthenticated) return <LoginForm />;

  return (
    <div>
      <h1>Bienvenido {profile?.full_name}</h1>
      <p>Rol: {profile?.role}</p>
      <button onClick={signOut}>Cerrar Sesión</button>
    </div>
  );
}
```

### 5. Proteger Rutas por Rol

```tsx
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';

function App() {
  return (
    <div>
      {/* Solo admins */}
      <ProtectedRoute requiredRole="admin">
        <AdminPanel />
      </ProtectedRoute>

      {/* Admin o Fleet Manager */}
      <ProtectedRoute requiredRole={['admin', 'fleet_manager']}>
        <FleetManagement />
      </ProtectedRoute>

      {/* Cualquier usuario autenticado */}
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </div>
  );
}
```

## 🔍 Debugging

### Verificar Conexión

```tsx
import { testSupabaseConnection } from './src/lib/supabase';

// En useEffect o al cargar la app
useEffect(() => {
  testSupabaseConnection();
}, []);
```

### Ver Estado de Auth en Consola

El AuthContext ya incluye logs detallados:
- 🔐 Initialization
- ✅ Login/Logout events
- 🔄 Session changes
- 🔍 Profile fetching

## 🎯 Flujo de Datos

```
1. Usuario inicia sesión
   ↓
2. Supabase Auth crea sesión
   ↓
3. Trigger crea perfil en public.profiles
   ↓
4. AuthContext detecta cambio (onAuthStateChange)
   ↓
5. Fetch automático del perfil con rol
   ↓
6. Estado global actualizado
   ↓
7. Componentes re-renderizan con nuevos datos
```

## 🔐 Casos de Uso Comunes

### Verificar Permisos en Código

```tsx
const { hasRole } = useAuth();

if (hasRole('admin')) {
  // Mostrar opciones de admin
}

if (hasRole(['admin', 'fleet_manager'])) {
  // Mostrar gestión de flota
}
```

### Datos del Usuario Actual

```tsx
const { user, profile } = useAuth();

console.log(user.email);           // Email de auth.users
console.log(profile.full_name);    // Nombre del perfil
console.log(profile.role);         // Rol del usuario
```

### Manejo de Errores en Login

```tsx
const handleLogin = async () => {
  const { error } = await signInWithEmail(email, password);
  
  if (error) {
    // Mostrar mensaje de error al usuario
    toast.error(error.message);
    return;
  }
  
  // Login exitoso, AuthContext manejará el estado
  toast.success('Bienvenido!');
};
```

## 🚨 Problemas Comunes

### "Profile not found" después de registro

**Causa:** El trigger `handle_new_user` no se ejecutó.

**Solución:**
1. Verifica que el trigger existe en Supabase
2. Revisa los logs en Supabase Dashboard > Database > Logs
3. Ejecuta manualmente:
```sql
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'driver'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

### Variables de entorno no se cargan

**Causa:** Vite requiere reinicio después de cambios en `.env`.

**Solución:**
1. Detén el servidor de desarrollo
2. Ejecuta `npm run dev` nuevamente
3. Verifica que las variables tienen el prefijo `VITE_`

### RLS bloquea acceso a profiles

**Causa:** Las políticas RLS están mal configuradas.

**Solución:**
1. Verifica en Supabase Dashboard > Authentication > Policies
2. Asegúrate de que las políticas permiten SELECT donde `auth.uid() = id`

## 📚 Recursos Adicionales

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## ✅ Verificación Final

- [ ] Script SQL ejecutado en Supabase
- [ ] Variables de entorno configuradas
- [ ] AuthProvider envuelve la app
- [ ] Login/Logout funcionan correctamente
- [ ] Perfil se carga con el rol correcto
- [ ] Rutas protegidas funcionan según rol
- [ ] No hay errores en la consola

¡Sistema de autenticación listo! 🚀
