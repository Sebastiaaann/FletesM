# Driver Form Card Component

Componente de formulario para agregar/editar conductores con validación chilena integrada.

## 🚀 Instalación

Este componente ya está instalado y listo para usar. Las dependencias incluyen:

- `framer-motion` - Para animaciones
- `lucide-react` - Para iconos
- `clsx` & `tailwind-merge` - Para utilidades de estilos

## 📦 Componentes Incluidos

### UI Components (shadcn-style)
- `Button` - Botón con variantes (default, ghost, outline)
- `Input` - Campo de entrada de texto
- `Label` - Etiqueta de formulario
- `Select` - Select dropdown nativo
- `Avatar` - Avatar con imagen y fallback
- `Tooltip` - Tooltips informativos

### Main Component
- `DriverFormCard` - Formulario completo de conductor

## 🎯 Uso Básico

```tsx
import { DriverFormCard, DriverFormData } from '@/components/ui/driver-form-card';
import { useState } from 'react';

function MyComponent() {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (data: DriverFormData) => {
    console.log('Datos del conductor:', data);
    // Guardar en base de datos, etc.
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div>
      <button onClick={() => setShowForm(true)}>
        Agregar Conductor
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <DriverFormCard
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
}
```

## 📝 Props del DriverFormCard

```typescript
interface DriverFormCardProps {
  // Datos iniciales para edición (opcional)
  initialData?: Partial<DriverFormData>;
  
  // Callback cuando se envía el formulario
  onSubmit: (data: DriverFormData) => void;
  
  // Callback cuando se cancela
  onCancel: () => void;
  
  // Clases CSS adicionales
  className?: string;
}
```

## 📊 Estructura de Datos

```typescript
interface DriverFormData {
  fullName: string;           // Nombre completo
  rut: string;                // RUT chileno (formato: 12345678-9)
  licenseType: LicenseType;   // 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'B' | 'C' | 'D' | 'E' | 'F'
  licenseExpiration: string;  // Fecha ISO (YYYY-MM-DD)
  imageUrl?: string;          // URL de imagen (opcional)
}
```

## ✅ Validaciones Incluidas

### RUT (Módulo 11)
- ✓ Formato automático mientras se escribe
- ✓ Validación de dígito verificador
- ✓ Mensajes de error descriptivos
- ✓ Formato: 12345678-9

### Nombre Completo
- ✓ Campo requerido
- ✓ Validación de texto no vacío

### Tipo de Licencia
- ✓ Opciones válidas según normativa chilena
- ✓ Clases: A1, A2, A3, A4, A5, B, C, D, E, F

### Vencimiento de Licencia
- ✓ Fecha requerida
- ✓ No permite fechas pasadas
- ✓ Validación en tiempo real

## 🎨 Características de UI

1. **Animaciones Suaves**: Usando Framer Motion con efecto stagger
2. **Modo Oscuro**: Soporte completo para dark mode
3. **Responsive**: Adaptable a móvil y escritorio
4. **Tooltips**: Información contextual en cada campo
5. **Estados de Error**: Visual feedback en campos con errores
6. **Avatar Upload**: Zona para subir foto del conductor

## 🔧 Ejemplo con Datos Iniciales (Edición)

```tsx
<DriverFormCard
  initialData={{
    fullName: "Juan Pérez",
    rut: "12345678-9",
    licenseType: "B",
    licenseExpiration: "2025-12-31",
    imageUrl: "/path/to/image.jpg"
  }}
  onSubmit={handleUpdate}
  onCancel={handleCancel}
/>
```

## 🎭 Ejemplo Completo

Ver el archivo `driver-form-example.tsx` para un ejemplo completo con:
- Gestión de estado
- Lista de conductores
- Modal de formulario
- Integración con react-hot-toast

## 🔗 Integración con Supabase

```tsx
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
    
    toast.success('Conductor agregado exitosamente');
    setShowForm(false);
  } catch (error) {
    toast.error('Error al guardar conductor');
    console.error(error);
  }
};
```

## 🎯 Tipos de Licencia Chilena

| Clase | Descripción |
|-------|-------------|
| A1    | Motocicletas hasta 125cc |
| A2    | Motocicletas de más de 125cc |
| A3    | Profesional motocicletas |
| A4    | Automóviles de turismo |
| A5    | Automóviles y furgones |
| B     | Vehículos de hasta 9 asientos |
| C     | Vehículos de carga hasta 3.500 kg |
| D     | Transporte público pasajeros |
| E     | Transporte carga más de 3.500 kg |
| F     | Taxi colectivo |

## 🐛 Troubleshooting

### El RUT no se valida
- Asegúrate de importar `validateChileanRut` desde `@/utils/validationRules`
- Verifica que el formato sea: 12345678-9

### Las animaciones no funcionan
- Verifica que `framer-motion` esté instalado: `npm install framer-motion`

### Estilos no se aplican
- Asegúrate de tener Tailwind CSS configurado correctamente
- Verifica que `@/lib/utils` exporte la función `cn`

## 📚 Referencias

- [Validación RUT Chile](https://www.sii.cl)
- [Tipos de Licencia](https://www.conaset.cl)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [shadcn/ui](https://ui.shadcn.com/)
