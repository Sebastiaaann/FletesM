# 🎨 Sistema de Temas - FleetTech

## ✅ Implementación Completa

Se ha agregado un sistema de modo claro/oscuro con las siguientes características:

### 📦 Archivos Creados/Modificados

1. **`hooks/useTheme.ts`** - Hook personalizado para gestión de tema
   - Detecta preferencia del sistema
   - Guarda preferencia en localStorage
   - Toggle entre dark/light

2. **`tailwind.config.js`** - Configuración de Tailwind
   - `darkMode: 'class'` activado
   - Colores personalizados para brand y dark

3. **`index.css`** - Variables CSS y estilos globales
   - Variables CSS para colores dinámicos
   - Clases `.dark` y `.light`
   - Transiciones suaves
   - Overrides para modo claro

4. **`components/Navbar.tsx`** - Botón de toggle
   - Icono Sun/Moon
   - Desktop: botón en barra superior
   - Mobile: opción en menú hamburguesa

### 🎯 Características

- ✅ Toggle visual con iconos Sun/Moon
- ✅ Persistencia en localStorage
- ✅ Detección de preferencia del sistema
- ✅ Transiciones suaves entre temas
- ✅ Responsive (funciona en desktop y mobile)
- ✅ Accesible (aria-labels)

### 🎨 Paleta de Colores

**Modo Claro:**
- Fondo principal: `#ffffff`
- Fondo secundario: `#f8fafc`
- Texto principal: `#0f172a`
- Bordes: `#e2e8f0`

**Modo Oscuro:**
- Fondo principal: `#020617`
- Fondo secundario: `#0f172a`
- Texto principal: `#f1f5f9`
- Bordes: `rgba(255, 255, 255, 0.1)`

### 🚀 Uso

El tema se cambia automáticamente al hacer clic en:
- **Desktop**: Icono Sun/Moon en la barra de navegación
- **Mobile**: Opción "Apariencia" en el menú hamburguesa

### 🔧 Cómo Funciona

1. Al cargar la app, `useTheme` verifica:
   - ¿Hay tema guardado en localStorage? → Usarlo
   - ¿No? → Detectar preferencia del sistema
   - ¿No? → Usar 'light' por defecto

2. Al cambiar tema:
   - Se agrega clase `.dark` o `.light` al `<html>`
   - Variables CSS se actualizan automáticamente
   - Preferencia se guarda en localStorage

3. Los componentes usan las clases de Tailwind normalmente
   - Las variables CSS sobrescriben los colores según el tema activo

### 📱 Próximas Mejoras

- [ ] Añadir más variantes de tema (azul, verde, etc.)
- [ ] Animación de transición más elaborada
- [ ] Opción "Auto" (seguir sistema)
- [ ] Personalización por usuario en Supabase

### 🐛 Notas

- Si ves componentes que no cambian de color, es porque usan colores hardcodeados
- Puedes agregar más overrides en `index.css` para componentes específicos
- Las variables CSS (`var(--bg-primary)`) se pueden usar directamente en cualquier componente
