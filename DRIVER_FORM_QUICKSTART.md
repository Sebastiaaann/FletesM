# 🚗 Driver Form Card - Guía Rápida de Uso

## ✅ Ya Instalado y Listo!

El componente `DriverFormCard` está completamente instalado y funcional en tu proyecto.

## 📦 Qué se instaló

### Dependencias
- ✅ `framer-motion` - Animaciones fluidas
- ✅ `clsx` - Utilidad para clases condicionales
- ✅ `tailwind-merge` - Merge de clases Tailwind

### Componentes UI (shadcn-style)
- ✅ `Button` - Botones con variantes
- ✅ `Input` - Inputs de texto
- ✅ `Label` - Labels de formulario
- ✅ `Select` - Selects nativos
- ✅ `Avatar` - Avatares con imagen
- ✅ `Tooltip` - Tooltips informativos

### Componente Principal
- ✅ `DriverFormCard` - Formulario completo de conductor

## 🚀 Uso en 3 Pasos

### Paso 1: Importar el Componente

```tsx
import { DriverFormCard, DriverFormData } from '@/components/ui/driver-form-card';
```

### Paso 2: Crear los Handlers

```tsx
const handleSubmit = (data: DriverFormData) => {
  console.log('Conductor:', data);
  // data.fullName - Nombre completo
  // data.rut - RUT validado
  // data.licenseType - Tipo de licencia (A1-F)
  // data.licenseExpiration - Fecha de vencimiento
  // data.imageUrl - URL de imagen (opcional)
};

const handleCancel = () => {
  console.log('Cancelado');
};
```

### Paso 3: Usar el Componente

```tsx
<DriverFormCard
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

## 💡 Ejemplo Modal Completo

```tsx
import React, { useState } from 'react';
import { DriverFormCard, DriverFormData } from '@/components/ui/driver-form-card';
import toast from 'react-hot-toast';

export function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (data: DriverFormData) => {
    // Aquí puedes guardar en Supabase
    console.log('Datos del conductor:', data);
    toast.success('Conductor agregado!');
    setShowModal(false);
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        + Agregar Conductor
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <DriverFormCard
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </div>
      )}
    </>
  );
}
```

## 🎯 Ver Demo Completa

Para ver el ejemplo completo funcionando:

```tsx
import { DriverFormExample } from '@/components/ui/driver-form-example';

// En tu componente o página
<DriverFormExample />
```

O visita la página demo:
```
src/pages/DriverFormDemo.tsx
```

## ✨ Características del Formulario

### Validación de RUT Chileno
- ✅ Formateo automático mientras escribes
- ✅ Validación Módulo 11
- ✅ Formato: 12345678-9
- ✅ Mensajes de error descriptivos

### Tipos de Licencia
- ✅ Clases A1, A2, A3, A4, A5
- ✅ Clases B, C, D, E, F
- ✅ Según normativa chilena

### Validación de Fecha
- ✅ No permite licencias vencidas
- ✅ Validación en tiempo real
- ✅ Selector de fecha nativo

### UI/UX
- ✅ Animaciones suaves (Framer Motion)
- ✅ Modo oscuro incluido
- ✅ Responsive (móvil y desktop)
- ✅ Tooltips informativos
- ✅ Estados de error visuales
- ✅ Avatar con placeholder

## 🔗 Integración con Supabase

```tsx
import { supabase } from '@/lib/supabase';

const handleSubmit = async (data: DriverFormData) => {
  try {
    const { error } = await supabase
      .from('drivers')
      .insert({
        full_name: data.fullName,
        rut: data.rut,
        license_type: data.licenseType,
        license_expiration: data.licenseExpiration,
        image_url: data.imageUrl
      });

    if (error) throw error;
    toast.success('Conductor guardado exitosamente');
  } catch (error) {
    toast.error('Error al guardar conductor');
    console.error(error);
  }
};
```

## 📝 Editar Conductor (Datos Iniciales)

```tsx
<DriverFormCard
  initialData={{
    fullName: "Juan Pérez",
    rut: "12345678-9",
    licenseType: "B",
    licenseExpiration: "2025-12-31"
  }}
  onSubmit={handleUpdate}
  onCancel={handleCancel}
/>
```

## 🎨 Personalizar Estilos

Agrega tu propia clase CSS:

```tsx
<DriverFormCard
  className="max-w-4xl mx-auto"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

## 📚 Documentación Completa

Ver: `docs/DRIVER_FORM_COMPONENT.md`

## 🐛 ¿Problemas?

### No se ven los estilos
- Verifica que Tailwind CSS esté configurado
- Revisa que el archivo `tailwind.config.js` incluya `./src/**/*.{js,jsx,ts,tsx}`

### Errores de importación
- Verifica que `@/` esté configurado en `tsconfig.json`
- El alias debe apuntar a `./src/*`

### RUT no se valida
- Asegúrate de que `@/utils/validationRules` existe
- Verifica que la función `validateChileanRut` esté exportada

## 🎉 ¡Listo para Usar!

El componente está 100% funcional. Solo necesitas:
1. Importarlo
2. Crear los handlers
3. Usarlo

¡Disfruta tu nuevo formulario de conductores! 🚀
