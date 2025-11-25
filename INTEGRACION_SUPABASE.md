# 🚀 Integración Supabase - Modo Express para FleetTech

## ✅ **Paso 1: Ejecutar SQL en Supabase**

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. En el menú lateral, click en **SQL Editor**
3. Click en **New Query**
4. Copia TODO el contenido del archivo `supabase-schema.sql`
5. Pégalo en el editor
6. Click en **Run** (o presiona Ctrl+Enter)
7. Verifica que aparezca el mensaje de éxito ✅

## ✅ **Paso 2: Verificar Tablas Creadas**

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver las siguientes tablas:
   - `drivers` (con 3 conductores)
   - `vehicles` (con 3 vehículos)
   - `routes` (vacía por ahora)

## ✅ **Paso 3: Verificar Variables de Entorno**

Asegúrate de que tu archivo `.env.local` tenga:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_GEMINI_API_KEY=tu_api_key_de_gemini
```

## ✅ **Paso 4: Reiniciar el Servidor de Desarrollo**

En tu terminal, detén el servidor (Ctrl+C) y vuelve a iniciarlo:

```bash
npm run dev
```

## 🎉 **¡Listo! Ya está integrado**

### **¿Qué se integró?**

✅ **Tablas creadas en Supabase:**
- `drivers` - Conductores con RUT chileno
- `vehicles` - Vehículos con estado y mantenimiento
- `routes` - Rutas con origen, destino y estado

✅ **Servicios actualizados:**
- `routeService` - CRUD completo para rutas
- `databaseService.ts` - Funciones para DB

✅ **Store con Supabase:**
- `addRoute()` - Guarda en Supabase + localStorage
- `updateRouteStatus()` - Actualiza en Supabase + local
- `removeRoute()` - Elimina de Supabase + local
- `loadRoutes()` - Carga rutas al iniciar

✅ **Realtime habilitado:**
- Sincronización automática cuando hay cambios
- Notificaciones toast cuando se crean/actualizan rutas
- Actualizaciones en tiempo real entre dispositivos

### **¿Cómo probarlo?**

1. **Crear ruta en App Conductor:**
   - Ve a "App Conductor" en navbar
   - Click en botón (+)
   - Llena el formulario y guarda
   - ✨ Se guarda en Supabase automáticamente

2. **Ver en Dashboard:**
   - Ve a Dashboard
   - Las rutas aparecen sincronizadas
   - Los KPIs se actualizan en tiempo real

3. **Probar Realtime:**
   - Abre la app en 2 ventanas/pestañas
   - Crea una ruta en una ventana
   - 🎊 Aparece automáticamente en la otra

### **Fallback automático:**

Si Supabase falla (sin internet, error de API):
- ✅ La app sigue funcionando con localStorage
- ✅ No se rompe nada
- ✅ Se sincroniza cuando vuelve la conexión

### **Próximos pasos (opcional):**

1. Integrar vehículos y conductores con Supabase
2. Agregar autenticación (usuarios y roles)
3. Implementar Edge Functions para Gemini API
4. Configurar RLS (Row Level Security) con políticas avanzadas

---

## 🐛 **Troubleshooting**

**Problema:** "relation 'routes' does not exist"
- **Solución:** Ejecuta el SQL nuevamente en Supabase

**Problema:** Las rutas no se sincronizan
- **Solución:** Verifica las variables de entorno y reinicia el servidor

**Problema:** Error de CORS
- **Solución:** Verifica que la URL de Supabase sea correcta

---

**¿Necesitas ayuda?** Revisa los logs en la consola del navegador (F12)
