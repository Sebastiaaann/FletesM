# Guía de QA - Testing de Autenticación y Control de Acceso

Esta guía describe los pasos para verificar que la implementación de autenticación y control de acceso basado en roles funciona correctamente.

## Pre-requisitos

1. Base de datos Supabase configurada con la tabla `user_profiles`
2. Usuarios de prueba creados con los tres roles: `admin`, `fleet_manager`, `driver`
3. Variables de entorno configuradas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

---

## Test 1: Rol Admin (Acceso Completo)

### Setup
- Usuario de prueba con `role = 'admin'`
- Email: admin@fleettech.test

### Casos de Prueba

#### ✅ TC1.1: Login y Visualización de Perfil
1. Iniciar sesión con credenciales de admin
2. **Verificar**: Navbar muestra el nombre completo del usuario
3. **Verificar**: Navbar muestra el rol como "Administrador"
4. **Verificar**: Avatar muestra las iniciales correctas del nombre

#### ✅ TC1.2: Acceso a Dashboard
1. Navegar a la vista Dashboard
2. **Verificar**: Se muestra el contenido del Dashboard sin restricciones
3. **Verificar**: No aparece el componente "Acceso Restringido"

#### ✅ TC1.3: Acceso a Finanzas (Admin Only)
1. Hacer clic en el botón "Finanzas" en el navbar
2. **Verificar**: Se muestra el componente Financials correctamente
3. **Verificar**: No hay redirección automática
4. **Verificar**: No aparece el componente "Acceso Restringido"

#### ✅ TC1.4: Acceso a Cumplimiento (Admin Only)
1. Hacer clic en el botón "Cumplimiento" en el navbar
2. **Verificar**: Se muestra el componente Compliance correctamente
3. **Verificar**: No hay redirección automática
4. **Verificar**: No aparece el componente "Acceso Restringido"

#### ✅ TC1.5: Acceso a Gestión de Flota
1. Hacer clic en el botón "Equipo" en el navbar
2. **Verificar**: Se muestra el componente FleetManager correctamente
3. **Verificar**: Puede ver y editar vehículos y conductores

#### ✅ TC1.6: Acceso a App Conductor
1. Hacer clic en el botón "App Conductor" en el navbar
2. **Verificar**: Se muestra el componente DriverMobile correctamente

#### ✅ TC1.7: Logout
1. Hacer clic en el avatar/nombre en el navbar (desktop)
2. Se abre el menú dropdown
3. Hacer clic en "Cerrar Sesión"
4. **Verificar**: Aparece un toast de éxito "Sesión cerrada correctamente"
5. **Verificar**: Usuario es redirigido a la vista HOME
6. **Verificar**: Navbar ya no muestra información del usuario

---

## Test 2: Rol Fleet Manager (Acceso Limitado)

### Setup
- Usuario de prueba con `role = 'fleet_manager'`
- Email: manager@fleettech.test

### Casos de Prueba

#### ✅ TC2.1: Login y Visualización de Perfil
1. Iniciar sesión con credenciales de fleet_manager
2. **Verificar**: Navbar muestra el nombre completo del usuario
3. **Verificar**: Navbar muestra el rol como "Gerente de Flota"
4. **Verificar**: Avatar muestra las iniciales correctas

#### ✅ TC2.2: Acceso a Dashboard
1. Navegar a la vista Dashboard
2. **Verificar**: Se muestra el contenido del Dashboard correctamente

#### ✅ TC2.3: Intento de Acceso a Finanzas (Restringido)
1. Intentar navegar a Finanzas (si es posible desde la URL o forzando)
2. **Verificar**: Se muestra el componente "Acceso Restringido"
3. **Verificar**: Aparece un ícono de alerta/candado
4. **Verificar**: Mensaje "Acceso Restringido" visible
5. **Verificar**: Botón "Volver al Inicio" presente
6. **Verificar**: Al hacer clic en "Volver al Inicio", redirige a Dashboard

#### ✅ TC2.4: Intento de Acceso a Cumplimiento (Restringido)
1. Intentar navegar a Cumplimiento
2. **Verificar**: Se muestra el componente "Acceso Restringido"
3. **Verificar**: Comportamiento igual a TC2.3

#### ✅ TC2.5: Acceso a Gestión de Flota (Permitido)
1. Hacer clic en el botón "Equipo" en el navbar
2. **Verificar**: Se muestra el componente FleetManager correctamente
3. **Verificar**: Puede gestionar vehículos y conductores

#### ✅ TC2.6: Acceso a Rutas y Constructor
1. Hacer clic en "Rutas" y "Constructor"
2. **Verificar**: Ambas vistas son accesibles sin restricciones

#### ✅ TC2.7: Logout
1. Cerrar sesión desde el navbar
2. **Verificar**: Toast de éxito aparece
3. **Verificar**: Usuario es deslogueado correctamente

---

## Test 3: Rol Driver (Acceso Muy Restringido)

### Setup
- Usuario de prueba con `role = 'driver'`
- Email: driver@fleettech.test

### Casos de Prueba

#### ✅ TC3.1: Login y Visualización de Perfil
1. Iniciar sesión con credenciales de driver
2. **Verificar**: Navbar muestra el nombre completo del usuario
3. **Verificar**: Navbar muestra el rol como "Conductor"
4. **Verificar**: Avatar muestra las iniciales correctas

#### ✅ TC3.2: Redirección Automática a App Conductor
1. Después del login, observar la vista inicial
2. **Verificar**: Usuario es redirigido automáticamente a DriverMobile
3. **Verificar**: Se muestra la interfaz móvil del conductor

#### ✅ TC3.3: Intento de Acceso a Dashboard (Restringido)
1. Intentar navegar manualmente al Dashboard (cambiando vista)
2. **Verificar**: Sistema redirige automáticamente a DriverMobile
3. **Verificar**: Aparece toast de error "Acceso denegado"

#### ✅ TC3.4: Intento de Acceso a Finanzas (Restringido)
1. Intentar acceder a Finanzas
2. **Verificar**: Redirección automática a DriverMobile
3. **Verificar**: Toast de error visible

#### ✅ TC3.5: Intento de Acceso a Cumplimiento (Restringido)
1. Intentar acceder a Cumplimiento
2. **Verificar**: Redirección automática a DriverMobile
3. **Verificar**: Toast de error visible

#### ✅ TC3.6: Intento de Acceso a Gestión de Flota (Restringido)
1. Intentar acceder a Equipo/Flota
2. **Verificar**: Redirección automática a DriverMobile
3. **Verificar**: Toast de error visible

#### ✅ TC3.7: Permanencia en App Conductor
1. Permanecer en la vista DriverMobile
2. **Verificar**: Usuario puede interactuar normalmente con la app de conductor
3. **Verificar**: Puede ver rutas asignadas
4. **Verificar**: Puede completar entregas

#### ✅ TC3.8: Logout
1. Cerrar sesión desde el navbar
2. **Verificar**: Toast de éxito aparece
3. **Verificar**: Usuario es redirigido a HOME

---

## Test 4: Responsive y UX

### TC4.1: Navbar Desktop
1. En pantalla desktop (>768px)
2. **Verificar**: Menú de usuario aparece en la parte superior derecha
3. **Verificar**: Al hacer clic, se despliega dropdown con email, rol y opción de logout
4. **Verificar**: Dropdown se cierra al hacer clic fuera de él

### TC4.2: Navbar Mobile
1. En pantalla móvil (<768px)
2. **Verificar**: Menú hamburguesa visible
3. **Verificar**: Al abrir el drawer, perfil de usuario aparece en la sección inferior
4. **Verificar**: Avatar, nombre, rol y botón de logout son visibles
5. **Verificar**: Botón de logout tiene estilo rojo (bg-red-500/10)

### TC4.3: Componente Unauthorized - Diseño
1. Acceder a una vista restringida (ej: fleet_manager → Finanzas)
2. **Verificar**: Componente está centrado verticalmente y horizontalmente
3. **Verificar**: Ícono de candado/alerta visible con efecto blur rojo
4. **Verificar**: Texto "Acceso Restringido" en tamaño grande
5. **Verificar**: Descripción clara del problema
6. **Verificar**: Botón "Volver al Inicio" con estilo brand (brand-500)
7. **Verificar**: Footer con mensaje de soporte
8. **Verificar**: Toda la UI respeta el tema oscuro

---

## Test 5: Estados Edge Cases

### TC5.1: Usuario Sin Perfil
1. Crear usuario en Supabase Auth sin registro en `user_profiles`
2. Intentar login
3. **Verificar**: Sistema maneja el error gracefully
4. **Verificar**: No hay crash de la aplicación
5. **Verificar**: Muestra "Usuario" como nombre por defecto

### TC5.2: Sesión Expirada
1. Iniciar sesión
2. Forzar expiración de sesión en Supabase
3. Intentar navegar
4. **Verificar**: Usuario es redirigido a login
5. **Verificar**: Toast informativo aparece

### TC5.3: Cambio de Rol en Tiempo Real
1. Usuario logueado como fleet_manager
2. Admin cambia su rol a 'admin' en la base de datos
3. Refrescar la página
4. **Verificar**: Nuevo rol se refleja correctamente
5. **Verificar**: Permisos se actualizan (ahora puede acceder a Finanzas)

---

## Criterios de Aceptación Global

- ✅ Ningún usuario puede acceder a vistas no autorizadas
- ✅ Redirecciones son suaves, sin parpadeos de contenido prohibido
- ✅ Mensajes de error son claros y en español
- ✅ UI es consistente con el tema oscuro de FleetTech
- ✅ Logout funciona en todos los roles
- ✅ Navbar muestra información real del usuario (no hardcoded)
- ✅ Sistema es responsive en desktop y mobile

---

## Herramientas de Testing

- **Manual Testing**: Seguir los casos de prueba paso a paso
- **Browser DevTools**: Verificar consola para errores
- **Supabase Dashboard**: Verificar consultas y sesiones
- **React DevTools**: Inspeccionar estado de AuthContext

---

## Reportar Bugs

Si encuentras algún problema:
1. Anota el rol del usuario
2. Anota la vista/acción que causó el error
3. Captura el error en la consola del navegador
4. Captura screenshot de la UI
5. Describe los pasos para reproducir

---

**Última actualización**: Fase 5 - Integración de Autenticación
**Versión**: 1.0
