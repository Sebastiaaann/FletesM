# 🔐 Sistema de Autenticación - FletesM

Sistema completo de autenticación y autorización usando **Supabase Auth** + **Row Level Security (RLS)**.

## 📁 Estructura de Archivos

```
src/
├── lib/
│   └── supabase.ts                    # Cliente de Supabase configurado
├── types/
│   └── auth.types.ts                  # Tipos TypeScript para auth
├── contexts/
│   └── AuthContext.tsx                # Context Provider de autenticación
├── hooks/
│   └── useAuth.ts                     # Hook personalizado
├── components/
│   └── auth/
│       ├── LoginForm.tsx              # Formulario de login
│       ├── RegisterForm.tsx           # Formulario de registro
│       └── ProtectedRoute.tsx         # Componente para proteger rutas
├── vite-env.d.ts                      # Type definitions para Vite
├── App.example.tsx                    # Ejemplo de integración
└── IMPLEMENTATION_GUIDE.md            # Guía de implementación
```

## 🚀 Quick Start

### 1. Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

### 2. Configurar Variables de Entorno

Crea `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Ejecutar Script SQL en Supabase

Ejecuta el script SQL completo en el Editor SQL de Supabase para crear:
- Enum `app_role`
- Tabla `public.profiles`
- Trigger `handle_new_user`
- Políticas RLS

### 4. Envolver tu App con AuthProvider

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

## 📖 Uso Básico

### Acceder al Estado de Autenticación

```tsx
import { useAuth } from './src/hooks/useAuth';

function MyComponent() {
  const { 
    user,           // Usuario de Supabase Auth
    profile,        // Perfil con rol desde DB
    loading,        // Estado de carga
    isAuthenticated,// Boolean: está autenticado
    signOut,        // Función para cerrar sesión
    hasRole         // Función para verificar roles
  } = useAuth();

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

### Login

```tsx
import { useAuth } from './src/hooks/useAuth';

function LoginComponent() {
  const { signInWithEmail } = useAuth();
  
  const handleLogin = async () => {
    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      alert('Error: ' + error.message);
      return;
    }
    
    // Login exitoso - AuthContext maneja el estado automáticamente
  };

  return (
    <button onClick={handleLogin}>
      Iniciar Sesión
    </button>
  );
}
```

### Registro

```tsx
import { useAuth } from './src/hooks/useAuth';

function RegisterComponent() {
  const { signUpWithEmail } = useAuth();
  
  const handleRegister = async () => {
    const { error } = await signUpWithEmail({
      email: 'user@example.com',
      password: 'securePassword123',
      full_name: 'Juan Pérez'
    });
    
    if (error) {
      alert('Error: ' + error.message);
      return;
    }
    
    alert('¡Cuenta creada! Revisa tu email para confirmar.');
  };

  return (
    <button onClick={handleRegister}>
      Registrarse
    </button>
  );
}
```

### Proteger Rutas

```tsx
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';

function App() {
  return (
    <div>
      {/* Solo usuarios autenticados */}
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>

      {/* Solo administradores */}
      <ProtectedRoute requiredRole="admin">
        <AdminPanel />
      </ProtectedRoute>

      {/* Admin o Fleet Manager */}
      <ProtectedRoute requiredRole={['admin', 'fleet_manager']}>
        <FleetManagement />
      </ProtectedRoute>

      {/* Solo conductores */}
      <ProtectedRoute requiredRole="driver">
        <DriverDashboard />
      </ProtectedRoute>
    </div>
  );
}
```

### Verificar Roles Manualmente

```tsx
function MyComponent() {
  const { hasRole } = useAuth();

  return (
    <div>
      {hasRole('admin') && (
        <button>Configuración Avanzada</button>
      )}

      {hasRole(['admin', 'fleet_manager']) && (
        <button>Gestionar Flota</button>
      )}

      {hasRole('driver') && (
        <button>Mis Rutas</button>
      )}
    </div>
  );
}
```

## 🎭 Roles Disponibles

### Admin
- Acceso total al sistema
- Puede ver y editar todo
- Gestiona usuarios y permisos

### Fleet Manager
- Gestiona la flota de vehículos
- Crea y asigna rutas
- Ve reportes financieros

### Driver (Conductor)
- Ve rutas asignadas
- Actualiza estado de entregas
- Sube pruebas de entrega (POD)

## 🔒 Seguridad

### Row Level Security (RLS)

Las políticas RLS aseguran que:

1. **Los usuarios solo ven su propio perfil**
   ```sql
   auth.uid() = id
   ```

2. **Los admins ven todos los perfiles**
   ```sql
   EXISTS (
     SELECT 1 FROM profiles 
     WHERE id = auth.uid() AND role = 'admin'
   )
   ```

3. **Los usuarios solo editan su propio perfil**
   ```sql
   auth.uid() = id
   ```

### Variables de Entorno

- **NUNCA** commitear `.env.local` al repositorio
- Usar `.env.example` para documentar variables necesarias
- En producción, configurar variables en el hosting (Vercel, Netlify, etc.)

## 🛠️ API del AuthContext

### Estado

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `session` | `Session \| null` | Sesión actual de Supabase |
| `user` | `User \| null` | Usuario de auth.users |
| `profile` | `UserProfile \| null` | Perfil con rol desde DB |
| `loading` | `boolean` | Estado de carga inicial |
| `isAuthenticated` | `boolean` | Si el usuario está autenticado |

### Métodos

| Método | Firma | Descripción |
|--------|-------|-------------|
| `signInWithEmail` | `(email: string, password: string) => Promise<AuthResponse>` | Login con email/password |
| `signUpWithEmail` | `(credentials: SignUpCredentials) => Promise<AuthResponse>` | Registro de usuario |
| `signOut` | `() => Promise<{ error: Error \| null }>` | Cerrar sesión |
| `hasRole` | `(role: AppRole \| AppRole[]) => boolean` | Verificar si tiene un rol |

## 🔍 Debugging

### Logs Automáticos

El sistema incluye logs detallados en consola:

```
🔐 Initializing auth...
✅ Session found: user@example.com
🔍 Fetching user profile for: uuid-here
✅ Profile loaded: { id, role, full_name, ... }
```

### Verificar Conexión

```tsx
import { testSupabaseConnection } from './src/lib/supabase';

useEffect(() => {
  testSupabaseConnection();
}, []);
```

### Problemas Comunes

#### Profile not found

**Causa:** El trigger no creó el perfil automáticamente.

**Solución:**
```sql
-- Crear perfiles manualmente para usuarios existentes
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'driver'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

#### RLS Blocks Access

**Causa:** Las políticas RLS están muy restrictivas.

**Solución:** Verifica las políticas en Supabase Dashboard > Authentication > Policies.

#### Variables de entorno no se cargan

**Causa:** Vite no detectó cambios en `.env.local`.

**Solución:** Reinicia el servidor: `Ctrl+C` → `npm run dev`.

## 📚 Tipos TypeScript

### AppRole

```typescript
type AppRole = 'admin' | 'fleet_manager' | 'driver';
```

### UserProfile

```typescript
interface UserProfile {
  id: string;
  role: AppRole;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}
```

### AuthResponse

```typescript
interface AuthResponse {
  error: Error | null;
  data?: {
    user: User | null;
    session: Session | null;
  };
}
```

## 🎯 Flujo de Autenticación

```
┌─────────────────┐
│  Usuario hace   │
│  Login/Signup   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Auth  │
│  crea sesión    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Trigger SQL    │
│  crea perfil    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AuthContext    │
│  detecta cambio │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch perfil   │
│  con rol desde  │
│  public.profiles│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Estado global  │
│  actualizado    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Componentes    │
│  re-renderizan  │
└─────────────────┘
```

## 🧪 Testing

### Test Unitario del Hook

```tsx
import { renderHook } from '@testing-library/react';
import { useAuth } from './src/hooks/useAuth';
import { AuthProvider } from './src/contexts/AuthContext';

test('useAuth throws error outside provider', () => {
  expect(() => {
    renderHook(() => useAuth());
  }).toThrow('useAuth must be used within an AuthProvider');
});

test('useAuth returns context when inside provider', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthProvider,
  });

  expect(result.current).toBeDefined();
  expect(result.current.loading).toBeDefined();
});
```

## 📝 Checklist de Implementación

- [ ] Dependencias instaladas (`@supabase/supabase-js`)
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Script SQL ejecutado en Supabase
- [ ] Tabla `profiles` creada con trigger
- [ ] Políticas RLS configuradas
- [ ] `AuthProvider` envuelve la app
- [ ] Login/Logout funcionan
- [ ] Perfiles se cargan correctamente
- [ ] Roles se verifican correctamente
- [ ] Rutas protegidas funcionan
- [ ] No hay errores en consola

## 🚀 Próximos Pasos

1. **Reset Password:** Implementar recuperación de contraseña
2. **Email Confirmation:** Manejo de confirmación de email
3. **Social Login:** Google, GitHub, etc.
4. **2FA:** Autenticación de dos factores
5. **Session Management:** Manejo avanzado de sesiones
6. **Audit Logs:** Registro de acciones de usuarios

## 📖 Recursos

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase React Guide](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

---

**Creado por:** GitHub Copilot  
**Fecha:** Diciembre 2025  
**Versión:** 1.0.0
