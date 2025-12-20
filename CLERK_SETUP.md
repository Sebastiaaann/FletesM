# Configuración de Clerk para FleetesM

## 🚀 Pasos de Configuración

### 1. Obtener tu Publishable Key de Clerk

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com/)
2. Crea una nueva aplicación o selecciona una existente
3. Navega a **API Keys** en el menú lateral
4. Copia tu **Publishable Key** (comienza con `pk_test_` o `pk_live_`)

### 2. Configurar Variables de Entorno

Abre el archivo `.env.local` en la raíz del proyecto y agrega:

```env
VITE_CLERK_PUBLISHABLE_KEY=tu_publishable_key_aqui
```

**⚠️ IMPORTANTE:** 
- Reemplaza `tu_publishable_key_aqui` con tu clave real de Clerk
- Nunca subas este archivo a Git (ya está en `.gitignore`)
- El prefijo `VITE_` es necesario para que Vite exponga la variable al cliente

### 3. Configurar Roles de Usuario en Clerk

Los roles se almacenan en los metadatos públicos del usuario. Para configurarlos:

#### Opción A: Desde el Dashboard de Clerk

1. Ve a **Users & Authentication** → **Users**
2. Selecciona un usuario
3. Ve a la pestaña **Metadata**
4. En **Public metadata**, agrega:

```json
{
  "role": "admin"
}
```

Roles disponibles:
- `admin` - Administrador (acceso completo)
- `fleet_manager` - Gerente de Flota (sin acceso a Finanzas y Cumplimiento)
- `driver` - Conductor (solo vista móvil)
- `demo` - Usuario Demo (solo Dashboard y solicitud de acceso) - **ASIGNADO AUTOMÁTICAMENTE**

#### Opción B: Mediante Webhooks (Automático)

Puedes configurar un webhook en Clerk para asignar roles automáticamente al registrarse:

1. Ve a **Webhooks** en Clerk Dashboard
2. Crea un nuevo endpoint
3. Selecciona el evento `user.created`
4. Usa la API de Clerk para actualizar los metadatos del usuario

### 4. Modo Demo (Nuevo)

**Los usuarios nuevos que se registren automáticamente tendrán acceso limitado (modo demo).**

#### Características del Modo Demo:

✅ **Acceso Permitido:**
- Dashboard (solo lectura)
- Vista de solicitud de acceso
- Políticas de privacidad y términos

❌ **Acceso Restringido:**
- Gestión de flota
- Rutas y constructor
- Finanzas
- Cumplimiento
- Vista de conductor

#### Solicitud de Acceso:

Los usuarios demo pueden solicitar acceso completo mediante:
1. Click en el botón "Solicitar Acceso" del banner naranja
2. Completar formulario con:
   - Rol deseado
   - Empresa
   - Teléfono
   - Motivo de solicitud

#### Aprobar Usuarios Demo:

Como administrador, para dar acceso completo a un usuario:

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com/)
2. **Users & Authentication** → **Users**
3. Selecciona el usuario
4. **Metadata** → **Public metadata**
5. Agrega o modifica:

```json
{
  "role": "fleet_manager"
}
```

6. El usuario tendrá acceso inmediato al recargar la página

### 5. Iniciar la Aplicación

```bash
npm run dev
```

La aplicación ahora usará Clerk para autenticación. Al abrir `http://localhost:5173`, verás la pantalla de inicio de sesión de Clerk.

## 🎨 Personalización de Clerk

### Apariencia

Puedes personalizar la apariencia de los componentes de Clerk desde el Dashboard:

1. Ve a **Customization** → **Theme**
2. Ajusta colores, fuentes y estilos
3. Los cambios se reflejarán automáticamente

### Traducciones

Para traducir los componentes de Clerk al español:

1. Ve a **Customization** → **Localization**
2. Selecciona **Spanish (es-ES)** como idioma predeterminado
3. Personaliza los textos según necesites

## 🔐 Características Implementadas

✅ Autenticación completa con Clerk  
✅ Inicio de sesión con email/contraseña  
✅ Registro de nuevos usuarios  
✅ Gestión de sesiones  
✅ Control de acceso basado en roles  
✅ Integración con UserButton de Clerk  
✅ Compatibilidad con estructura UserProfile existente  
✅ **Modo demo automático para nuevos usuarios**  
✅ **Sistema de solicitud de acceso**  
✅ **Banner informativo para usuarios demo**  

## 📝 Notas Importantes

- **Supabase Auth ha sido reemplazado:** Ya no se usa `AuthContext` de Supabase
- **Base de datos Supabase:** Aún se usa para almacenar datos (vehículos, rutas, etc.)
- **Roles:** Se gestionan desde Clerk, no desde la tabla `profiles` de Supabase
- **Usuarios nuevos:** Automáticamente en modo demo hasta que un admin asigne un rol
- **Migración de usuarios:** Si tienes usuarios existentes en Supabase, deberás migrarlos manualmente a Clerk

## 🆘 Solución de Problemas

### Error: "Missing Clerk Publishable Key"

**Causa:** No se ha configurado la variable de entorno.

**Solución:** 
1. Verifica que `.env.local` existe en la raíz del proyecto
2. Confirma que contiene `VITE_CLERK_PUBLISHABLE_KEY=...`
3. Reinicia el servidor de desarrollo (`npm run dev`)

### Los usuarios no tienen roles

**Causa:** Los metadatos públicos no están configurados.

**Solución:**
1. Ve al Dashboard de Clerk
2. Selecciona el usuario
3. Agrega el campo `role` en **Public metadata**

### Banner demo no desaparece después de asignar rol

**Causa:** El navegador tiene la sesión en caché.

**Solución:**
1. Recarga la página (F5)
2. Si persiste, cierra sesión y vuelve a iniciar

### La aplicación no carga después de la integración

**Causa:** Posible error de TypeScript o dependencias.

**Solución:**
```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📚 Recursos

- [Documentación oficial de Clerk](https://clerk.com/docs)
- [Clerk React Quickstart](https://clerk.com/docs/quickstarts/react)
- [Clerk Dashboard](https://dashboard.clerk.com/)
- [Gestión de Metadatos de Usuario](https://clerk.com/docs/users/metadata)
