# 🎨 Driver Form Card - Estructura Visual

## 📐 Estructura del Componente

```
┌─────────────────────────────────────────────────────┐
│  Agregar Conductor                             [X]  │ ← Header con título y botón cerrar
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐     ┌────────────────────────────┐   │
│  │          │     │ Nombre Completo *          │   │
│  │  Avatar  │     │ [Juan Pérez González    ]  │   │
│  │   +      │     │                            │   │
│  │          │     │ RUT * (i)                  │   │
│  └──────────┘     │ [12345678-9            ]   │   │
│  Foto del         │                            │   │
│  Conductor        │ Tipo de Licencia * (i)     │   │
│  Máx. 1MB         │ [▼ Clase B             ]   │   │
│                   │                            │   │
│  [Agregar Imagen] │ Vencimiento Licencia * (i) │   │
│                   │ [📅 31/12/2025        ]   │   │
│                   └────────────────────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                              [Cancelar] [Guardar]  │ ← Botones de acción
└─────────────────────────────────────────────────────┘
```

## 🎯 Campos del Formulario

### 1. Foto del Conductor (Opcional)
```tsx
<Avatar className="h-24 w-24">
  <AvatarImage src={imageUrl} />
  <AvatarFallback>
    <User className="h-8 w-8" />
  </AvatarFallback>
</Avatar>
```

**Características:**
- Avatar circular de 24x24 (96px)
- Botón + para agregar imagen
- Fallback con icono de usuario
- Borde punteado visual
- Texto informativo "Máx. 1MB"

---

### 2. Nombre Completo * (Requerido)
```tsx
<Input
  type="text"
  placeholder="Juan Pérez González"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  required
/>
```

**Validaciones:**
- ✅ Campo requerido
- ✅ No puede estar vacío
- ✅ Muestra error si está vacío al enviar

**Estados:**
- Normal: Borde gris
- Error: Borde rojo + mensaje de error
- Focus: Borde azul + ring

---

### 3. RUT * (Requerido) 🇨🇱
```tsx
<Input
  type="text"
  placeholder="12345678-9"
  value={rut}
  onChange={handleRutChange}
  onBlur={handleRutBlur}
  maxLength={10}
/>
```

**Características:**
- 🔄 Formateo automático mientras escribes
- ✅ Validación Módulo 11 en tiempo real
- ℹ️ Tooltip con formato esperado
- 🔴 Validación al perder el foco (onBlur)

**Validaciones:**
- ✅ Formato: 12345678-9
- ✅ Dígito verificador correcto
- ✅ Longitud mínima 7 caracteres
- ✅ Solo números y K/k

**Mensajes de Error:**
```
"RUT es requerido"
"RUT es muy corto. Formato: 12345678-9"
"Formato de RUT inválido. Formato: 12345678-9"
"Dígito Verificador inválido. Debería ser X"
```

---

### 4. Tipo de Licencia * (Requerido)
```tsx
<Select
  value={licenseType}
  onChange={(e) => setLicenseType(e.target.value)}
>
  <option value="A1">Clase A1</option>
  <option value="A2">Clase A2</option>
  ...
  <option value="F">Clase F</option>
</Select>
```

**Opciones Disponibles:**
| Clase | Descripción |
|-------|-------------|
| A1    | Motocicletas hasta 125cc |
| A2    | Motocicletas +125cc |
| A3    | Profesional motos |
| A4    | Automóviles turismo |
| A5    | Automóviles y furgones |
| B     | Vehículos hasta 9 asientos |
| C     | Carga hasta 3.500 kg |
| D     | Transporte público |
| E     | Carga +3.500 kg |
| F     | Taxi colectivo |

---

### 5. Vencimiento Licencia * (Requerido)
```tsx
<Input
  type="date"
  value={licenseExpiration}
  onChange={(e) => setLicenseExpiration(e.target.value)}
  min={new Date().toISOString().split('T')[0]}
/>
```

**Validaciones:**
- ✅ No permite fechas pasadas
- ✅ Validación en tiempo real
- ✅ Formato ISO (YYYY-MM-DD)
- ✅ Selector de fecha nativo del navegador

**Mensajes de Error:**
```
"Fecha de vencimiento es requerida"
"La licencia está vencida"
```

---

## 🎬 Animaciones (Framer Motion)

### Container
```tsx
<motion.div
  initial="hidden"
  animate="show"
  variants={{
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } }
  }}
>
```

### Elementos Individuales
```tsx
const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};
```

**Efecto Visual:**
1. Elementos aparecen de abajo hacia arriba (y: 10 → 0)
2. Fade in suave (opacity: 0 → 1)
3. Efecto stagger (cada elemento 0.15s después del anterior)
4. Animación tipo "spring" para un efecto natural

---

## 🎨 Estilos y Clases

### Tema Claro
```css
bg-white
text-slate-900
border-slate-200
```

### Tema Oscuro
```css
dark:bg-slate-950
dark:text-slate-100
dark:border-slate-800
```

### Responsive
```css
md:grid-cols-3  /* Desktop: 3 columnas */
grid-cols-1     /* Mobile: 1 columna */
```

---

## 📊 Estados del Formulario

### Estado Normal
```tsx
border-slate-300 dark:border-slate-700
```

### Estado Error
```tsx
border-red-500
+ <p className="text-xs text-red-500">{error}</p>
```

### Estado Focus
```tsx
focus-visible:ring-2 focus-visible:ring-blue-500
```

### Estado Disabled
```tsx
disabled:opacity-50 disabled:cursor-not-allowed
```

---

## 🔄 Flujo de Validación

```
Usuario escribe RUT
        ↓
handleRutChange() → Formateo automático
        ↓
handleRutBlur() → Validación Módulo 11
        ↓
setRutError() → Muestra error si existe
        ↓
Usuario envía formulario
        ↓
handleSubmit() → Valida todos los campos
        ↓
¿Hay errores? → Muestra errores y retorna
        ↓
No hay errores → onSubmit(data)
```

---

## 🎯 Datos Exportados

```typescript
interface DriverFormData {
  fullName: string;           // "Juan Pérez González"
  rut: string;                // "12345678-9"
  licenseType: LicenseType;   // "B"
  licenseExpiration: string;  // "2025-12-31"
  imageUrl?: string;          // "https://..."
}
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
```
┌──────────────┐
│   Avatar     │
│ [Add Image]  │
├──────────────┤
│ Full Name    │
│ [Input]      │
├──────────────┤
│ RUT          │
│ [Input]      │
├──────────────┤
│ License Type │
│ [Select]     │
├──────────────┤
│ Expiration   │
│ [Date]       │
├──────────────┤
│ [Cancel][OK] │
└──────────────┘
```

### Desktop (≥ 768px)
```
┌────────────────────────────────┐
│ ┌────────┐  ┌────────────────┐ │
│ │ Avatar │  │ Full Name      │ │
│ │   +    │  │ [Input]        │ │
│ │        │  │                │ │
│ │ [Add]  │  │ RUT            │ │
│ └────────┘  │ [Input]        │ │
│             │                │ │
│             │ License Type   │ │
│             │ [Select]       │ │
│             │                │ │
│             │ Expiration     │ │
│             │ [Date]         │ │
│             └────────────────┘ │
│                [Cancel] [Save] │
└────────────────────────────────┘
```

---

## 🎨 Colores y Paleta

### Primarios
```css
Blue:   bg-blue-600 hover:bg-blue-700
White:  bg-white text-slate-900
Dark:   bg-slate-950 text-slate-100
```

### Estados
```css
Error:    text-red-500 border-red-500
Warning:  text-yellow-500 border-yellow-500
Success:  text-green-500 border-green-500
Info:     text-blue-500 border-blue-500
```

### Bordes
```css
Light:  border-slate-200
Dark:   dark:border-slate-800
Focus:  ring-blue-500
```

---

## 🔍 Tooltips

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <Info className="h-3 w-3" />
    </TooltipTrigger>
    <TooltipContent>
      <p>Información útil aquí</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Ubicación:** Junto a cada label
**Contenido:**
- RUT: "Formato: 12345678-9"
- Tipo de Licencia: "Clases A-F según normativa chilena"
- Vencimiento: "Fecha de vencimiento de la licencia"

---

## 📋 Checklist de Integración

- [ ] Importar el componente
- [ ] Crear handlers (onSubmit, onCancel)
- [ ] Agregar modal overlay
- [ ] Configurar z-index (≥ 50)
- [ ] Agregar backdrop-blur
- [ ] Testear en mobile
- [ ] Testear en desktop
- [ ] Verificar validaciones
- [ ] Probar con datos reales
- [ ] Integrar con backend

---

**¿Preguntas?** Revisa `DRIVER_FORM_QUICKSTART.md` o `docs/DRIVER_FORM_COMPONENT.md`
