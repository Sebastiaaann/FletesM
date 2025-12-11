# 🧪 Guía de QA - Sistema de Autenticación y Roles

> **Fase 5 Final:** Endurecimiento de Seguridad y Testing Manual

**Fecha:** 11 de Diciembre, 2025  
**Versión:** 1.0  
**Componentes Modificados:**
- ✅ `src/components/unauthorized/Unauthorized.tsx` (Nuevo)
- ✅ `src/components/Navbar.tsx` (Modificado - User Profile + Logout)
- ✅ `src/App.tsx` (Modificado - Defensive Rendering)

---

## 📋 Checklist General de Pre-Testing

Antes de comenzar las pruebas, verifica:

- [ ] El servidor de desarrollo está corriendo (`npm run dev`)
- [ ] Supabase está configurado correctamente (`.env` con credenciales)
- [ ] La base de datos tiene usuarios de prueba con los 3 roles
- [ ] Tienes acceso a las credenciales de prueba
- [ ] El navegador tiene las Dev Tools abiertas (para ver logs y errores)

---

## 🔐 Test Suite 1: Autenticación Básica

### 1.1 Login - Credenciales Válidas

**Objetivo:** Verificar que el login funciona correctamente

**Pasos:**
1. Abre la aplicación en el navegador
2. Verifica que se muestre `LoginView` (no Navbar ni contenido protegido)
3. Ingresa credenciales válidas (email + password)
4. Presiona "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Aparece toast de éxito: "Inicio de sesión exitoso"
- ✅ Se redirige al Dashboard
- ✅ Aparece Navbar con nombre y rol del usuario
- ✅ No hay errores en consola

---

### 1.2 Login - Credenciales Inválidas

**Objetivo:** Verificar manejo de errores en login

**Pasos:**
1. Ingresa email inexistente o password incorrecta
2. Presiona "Iniciar Sesión"

**Resultado Esperado:**
- ✅ Aparece toast de error: "Credenciales inválidas"
- ✅ No se redirige (permanece en LoginView)
- ✅ El formulario queda habilitado para reintentar
- ✅ No hay errores críticos en consola

---

### 1.3 Logout

**Objetivo:** Verificar que el cierre de sesión funciona

**Pasos:**
1. Estando autenticado, haz click en el avatar/nombre de usuario (Desktop) o hamburger (Mobile)
2. En el dropdown, selecciona "Cerrar Sesión"

**Resultado Esperado:**
- ✅ Aparece toast: "Sesión cerrada - Has cerrado sesión correctamente"
- ✅ Se redirige a LoginView inmediatamente
- ✅ Desaparece Navbar y todo contenido protegido
- ✅ No hay errores en consola

---

### 1.4 Persistencia de Sesión

**Objetivo:** Verificar que la sesión se mantiene al refrescar

**Pasos:**
1. Inicia sesión correctamente
2. Presiona F5 o refresca el navegador
3. Observa el comportamiento

**Resultado Esperado:**
- ✅ Aparece PageLoader brevemente
- ✅ La sesión se restaura automáticamente
- ✅ Vuelves a la misma vista en la que estabas
- ✅ El nombre y rol del usuario se mantienen
- ✅ Log en consola: "Session initialized" o similar

---

## 👤 Test Suite 2: Rol ADMIN

### 2.1 Acceso Completo

**Credenciales de Prueba:** `admin@fleettech.com` / `[tu_password]`

**Objetivo:** Verificar que Admin tiene acceso total

**Pasos:**
1. Inicia sesión con credenciales de Admin
2. Navega por todas las secciones del menú:
   - Dashboard ✅
   - Equipo (Fleet) ✅
   - Rutas ✅
   - Constructor ✅
   - Finanzas ✅
   - Cumplimiento ✅
   - App Conductor ✅

**Resultado Esperado:**
- ✅ Navbar muestra: "Administrador" como rol
- ✅ Todas las vistas se cargan sin errores
- ✅ NO aparece pantalla "Acceso Restringido" en ninguna sección
- ✅ El dropdown de usuario muestra opciones de logout y tema
- ✅ No hay warnings ni errores en consola

---

### 2.2 UI y Navegación

**Pasos:**
1. Verifica que aparezca Navbar en la parte superior
2. Verifica que aparezcan Breadcrumbs debajo de Navbar
3. Verifica que aparezca Footer en la parte inferior
4. Haz click en el avatar/nombre en Navbar

**Resultado Esperado:**
- ✅ Navbar visible con navegación completa
- ✅ Breadcrumbs actualizándose según la vista
- ✅ Footer visible con links (Privacidad, Seguridad, API)
- ✅ Dropdown muestra: Nombre completo, Rol "Administrador", botón Logout
- ✅ Avatar muestra inicial del nombre

---

## 👨‍💼 Test Suite 3: Rol FLEET MANAGER

### 3.1 Acceso Restringido

**Credenciales de Prueba:** `manager@fleettech.com` / `[tu_password]`

**Objetivo:** Verificar restricciones específicas de Fleet Manager

**Pasos:**
1. Inicia sesión con credenciales de Fleet Manager
2. Navega por el menú y verifica cada sección:
   - Dashboard → ✅ Permitido
   - Equipo (Fleet) → ✅ Permitido
   - Rutas → ✅ Permitido
   - Constructor → ✅ Permitido
   - **Finanzas → ❌ NO Permitido**
   - **Cumplimiento → ❌ NO Permitido**
   - App Conductor → ✅ Permitido

**Resultado Esperado:**
- ✅ Navbar muestra: "Gerente de Flota" como rol
- ✅ Al intentar acceder a **COMPLIANCE**:
  - Aparece toast: "Acceso Restringido - No tienes permisos..."
  - Se redirige automáticamente a Dashboard
  - Log en consola: "⚠️ Access denied - Redirecting to Dashboard"
- ✅ **IMPORTANTE:** Si intentas escribir la URL directamente (ej: cambiando state), debe mostrar componente `<Unauthorized />`

---

### 3.2 Defensive Rendering - Financials

**Pasos:**
1. Estando logueado como Fleet Manager
2. Abre Dev Tools → Console
3. Intenta forzar la vista Financials escribiendo en consola:
   ```javascript
   useStore.getState().setView('FINANCIALS')
   ```

**Resultado Esperado:**
- ✅ Aparece pantalla "Acceso Restringido" (componente Unauthorized)
- ✅ Muestra icono de escudo rojo con alerta
- ✅ Texto: "No tienes los permisos necesarios..."
- ✅ Botón "Volver al Inicio" funcional
- ✅ NO se renderiza el componente Financials

---

### 3.3 UI Normal

**Resultado Esperado:**
- ✅ Navbar visible
- ✅ Breadcrumbs visibles
- ✅ Footer visible
- ✅ Dropdown de usuario funcional con logout

---

## 🚗 Test Suite 4: Rol DRIVER

### 4.1 Redirección Forzada a Mobile

**Credenciales de Prueba:** `driver@fleettech.com` / `[tu_password]`

**Objetivo:** Verificar que Driver solo ve vista móvil

**Pasos:**
1. Inicia sesión con credenciales de Driver
2. Observa la pantalla inmediatamente después del login

**Resultado Esperado:**
- ✅ Se redirige automáticamente a `DRIVER_MOBILE` view
- ✅ Log en consola: "🚗 Driver detected - Redirecting to mobile view"
- ✅ NO aparece Navbar
- ✅ NO aparecen Breadcrumbs
- ✅ NO aparece Footer
- ✅ La vista `DriverMobile` ocupa toda la pantalla
- ✅ Main tag NO tiene padding superior (pt-20)

---

### 4.2 Bloqueo de Navegación

**Pasos:**
1. Estando logueado como Driver
2. Intenta acceder a otra vista escribiendo en consola:
   ```javascript
   useStore.getState().setView('DASHBOARD')
   ```
3. Observa qué sucede

**Resultado Esperado:**
- ✅ useEffect detecta el cambio
- ✅ Se redirige de vuelta a DRIVER_MOBILE automáticamente
- ✅ Log en consola: "🚗 Driver detected - Redirecting to mobile view"
- ✅ NO se muestra ningún otro componente

---

### 4.3 UI Simplificada

**Resultado Esperado:**
- ✅ Solo se ve el componente DriverMobile
- ✅ NO hay Navbar superior
- ✅ NO hay Breadcrumbs
- ✅ NO hay Footer inferior
- ✅ Fondo completamente bg-dark-950

---

### 4.4 Logout desde Mobile

**Pasos:**
1. Busca el botón de hamburger o menu dentro de DriverMobile (si existe)
2. Si no hay UI de logout en DriverMobile:
   - Usa consola para hacer logout: `document.querySelector('button')` y buscar logout
   - O verifica que el drawer mobile tenga opción de logout

**Resultado Esperado:**
- ✅ Mobile drawer muestra perfil de usuario con inicial
- ✅ Muestra "Conductor" como rol
- ✅ Botón "Cerrar Sesión" en rojo funcional
- ✅ Al logout, redirige a LoginView correctamente

---

## 🛡️ Test Suite 5: Componente Unauthorized

### 5.1 Diseño y Funcionalidad

**Pasos:**
1. Inicia sesión como Fleet Manager
2. Fuerza la vista Financials desde consola
3. Observa el componente Unauthorized

**Resultado Esperado:**
- ✅ Pantalla centrada verticalmente y horizontalmente
- ✅ Icono ShieldAlert en rojo con glow effect animado (pulse)
- ✅ Título grande: "Acceso Restringido"
- ✅ Descripción clara y legible
- ✅ Botón "Volver al Inicio" con gradiente brand (naranja/rojo)
- ✅ Efecto hover en botón (scale-105, shadow)
- ✅ Footer decorativo con "Error 403"

---

### 5.2 Navegación desde Unauthorized

**Pasos:**
1. Estando en la pantalla Unauthorized
2. Haz click en "Volver al Inicio"

**Resultado Esperado:**
- ✅ Se redirige a Dashboard inmediatamente
- ✅ Se carga el Dashboard correctamente
- ✅ No hay parpadeos ni errores

---

## 🎨 Test Suite 6: UI y UX

### 6.1 Navbar - Desktop

**Pasos:**
1. Inicia sesión como Admin o Fleet Manager
2. Observa la Navbar en desktop (>768px)

**Resultado Esperado:**
- ✅ Logo FleetTech a la izquierda con efecto glow
- ✅ Botones de navegación en el centro
- ✅ Perfil de usuario a la derecha con:
  - Avatar con inicial
  - Nombre completo
  - Rol formateado
- ✅ Al hacer hover en avatar, cambia a hover:text-white
- ✅ Al hacer click, aparece dropdown con:
  - Header con nombre y rol
  - Opción "Cambiar tema" (Sol/Luna)
  - Divisor
  - Opción "Cerrar Sesión" en rojo

---

### 6.2 Navbar - Mobile Drawer

**Pasos:**
1. Reduce el viewport a móvil (<768px)
2. Haz click en el botón hamburger

**Resultado Esperado:**
- ✅ Drawer se desliza desde la derecha con animación smooth
- ✅ Icono hamburger se transforma en X
- ✅ Navegación vertical grande y bold
- ✅ Sección de usuario muestra:
  - Avatar circular
  - Nombre completo
  - Rol formateado
- ✅ Sección "Apariencia" con toggle tema
- ✅ Sección "Sesión" con botón logout rojo
- ✅ Al cerrar, animación reverse

---

### 6.3 Toast Notifications

**Pasos:**
1. Realiza varias acciones que generen toasts:
   - Login exitoso
   - Logout
   - Acceso denegado

**Resultado Esperado:**
- ✅ Toast aparece en posición correcta (top-right por defecto)
- ✅ Login: Toast verde con checkmark
- ✅ Logout: Toast azul/verde con mensaje
- ✅ Acceso denegado: Toast amarillo/naranja warning
- ✅ Toasts se auto-cierran después de ~3 segundos
- ✅ Múltiples toasts se apilan correctamente

---

## 🧩 Test Suite 7: Edge Cases

### 7.1 Navegación Rápida

**Pasos:**
1. Haz click rápido en varios items del menú consecutivamente

**Resultado Esperado:**
- ✅ Las vistas cambian sin errores
- ✅ No hay "flash of unauthorized content"
- ✅ Lazy loading funciona (PageLoader aparece brevemente)
- ✅ No hay memory leaks (verifica en Performance tab)

---

### 7.2 Token Expirado

**Pasos:**
1. Inicia sesión
2. Espera a que el token expire (o fuerza expiración en Supabase)
3. Intenta navegar o hacer una acción

**Resultado Esperado:**
- ✅ Supabase detecta token expirado
- ✅ Se redirige automáticamente a LoginView
- ✅ Toast indica "Sesión expirada" (si está implementado)

---

### 7.3 Network Offline

**Pasos:**
1. Activa modo offline en Dev Tools (Network tab)
2. Intenta hacer login o navegar

**Resultado Esperado:**
- ✅ Toast de error indica problema de conexión
- ✅ La app no se rompe
- ✅ Al restaurar conexión, funciona normalmente

---

### 7.4 Perfil sin full_name

**Pasos:**
1. Crea un usuario en Supabase sin campo `full_name`
2. Inicia sesión

**Resultado Esperado:**
- ✅ Navbar muestra "Usuario" como fallback
- ✅ Avatar muestra "U" como inicial
- ✅ No hay errores en consola
- ✅ Dropdown funciona normalmente

---

## 📊 Test Suite 8: Console Logs

### 8.1 Logs Esperados

Durante el testing normal, deberías ver estos logs:

```
✅ "🚗 Driver detected - Redirecting to mobile view" → Al login como driver
✅ "⚠️ Access denied - Redirecting to Dashboard" → Fleet Manager intenta COMPLIANCE
✅ No errores rojos ni warnings amarillos (excepto deprecated APIs externos)
```

---

### 8.2 Errores a Buscar

**NO deberían aparecer:**

```
❌ "Cannot read property 'role' of undefined"
❌ "Maximum update depth exceeded"
❌ "Memory leak detected"
❌ "Failed to fetch" (con conexión activa)
❌ "Uncaught TypeError"
```

---

## ✅ Resumen de Testing

### Checklist Final

Después de completar todos los tests, verifica:

#### Autenticación
- [ ] Login con credenciales válidas funciona
- [ ] Login con credenciales inválidas muestra error
- [ ] Logout redirige a LoginView
- [ ] Sesión persiste al refrescar

#### Rol Admin
- [ ] Acceso total a todas las vistas
- [ ] Navbar/Breadcrumbs/Footer visibles
- [ ] Dropdown de usuario funcional

#### Rol Fleet Manager
- [ ] Acceso restringido a COMPLIANCE
- [ ] Toast de warning al intentar acceso
- [ ] Defensive rendering muestra Unauthorized
- [ ] Navegación normal en vistas permitidas

#### Rol Driver
- [ ] Redirección forzada a DRIVER_MOBILE
- [ ] NO aparece Navbar/Breadcrumbs/Footer
- [ ] Bloqueo de navegación funciona
- [ ] Logout desde mobile funcional

#### Componente Unauthorized
- [ ] Diseño centrado y elegante
- [ ] Botón "Volver al Inicio" funciona
- [ ] Animación de glow en icono

#### UI/UX
- [ ] Navbar desktop muestra datos reales
- [ ] Mobile drawer funcional
- [ ] Toasts aparecen correctamente
- [ ] Animaciones smooth

#### Edge Cases
- [ ] Navegación rápida sin errores
- [ ] Token expirado maneja correctamente
- [ ] Offline mode no rompe la app
- [ ] Fallbacks para datos nulos

---

## 🐛 Reportar Bugs

Si encuentras algún problema durante el testing, documenta:

1. **Pasos para reproducir:** Lista detallada
2. **Resultado esperado:** Qué debería pasar
3. **Resultado actual:** Qué pasó realmente
4. **Screenshots:** Si es visual
5. **Console logs:** Errores o warnings
6. **Entorno:** Navegador, viewport, rol de usuario

---

## 🎉 Criterios de Aprobación

El sistema pasa QA si:

✅ 95% de los tests pasan exitosamente  
✅ No hay errores críticos en consola  
✅ Todos los roles tienen acceso correcto  
✅ UI es consistente en desktop y mobile  
✅ Performance es aceptable (lazy loading funciona)  
✅ Seguridad: No se puede bypassear roles fácilmente  

---

**Tester:** _________________________  
**Fecha:** _________________________  
**Resultado:** ☐ APROBADO  ☐ RECHAZADO  
**Notas:** ___________________________________________________

---

**Preparado por:** GitHub Copilot  
**Versión del Sistema:** Fase 5 - Endurecimiento Final  
**Última Actualización:** 11 de Diciembre, 2025
