# Estándares de Código - FletesM

## Filosofía del Proyecto

Este proyecto sigue las mejores prácticas de desarrollo front-end moderno con React, TypeScript y TailwindCSS. El código debe ser limpio, accesible, mantenible y seguir el principio DRY (Don't Repeat Yourself).

---

## Principios Generales

### 1. **Claridad sobre Performance**
- Prioriza código fácil de leer y mantener sobre optimizaciones prematuras
- La legibilidad es fundamental para el trabajo en equipo

### 2. **Early Returns**
- Usa retornos tempranos para reducir la anidación y mejorar la legibilidad

```typescript
// ❌ Evitar
const processData = (data: Data | null) => {
  if (data) {
    if (data.isValid) {
      return data.value;
    }
  }
  return null;
};

// ✅ Preferir
const processData = (data: Data | null) => {
  if (!data) return null;
  if (!data.isValid) return null;
  
  return data.value;
};
```

### 3. **Código Completo**
- NO dejar TODOs, placeholders o piezas faltantes
- Implementar toda la funcionalidad solicitada
- Verificar que el código esté completo y funcional

---

## Nomenclatura y Estilo

### Componentes
- **Archivos de componentes**: PascalCase (`Dashboard.tsx`, `SignaturePad.tsx`)
- **Componentes funcionales**: Usar `const` con arrow functions

```typescript
// ✅ Correcto
const Dashboard: React.FC<DashboardProps> = ({ title, data }) => {
  // ...
  return <div>...</div>;
};

export default Dashboard;
```

### Variables y Funciones
- **Variables**: camelCase descriptivo (`vehicleList`, `isLoading`, `userData`)
- **Constantes**: UPPER_SNAKE_CASE para valores constantes (`MAX_VEHICLES`, `API_URL`)
- **Funciones**: camelCase con verbos descriptivos (`fetchVehicles`, `calculateTotal`)

### Event Handlers
- **Prefijo "handle"**: Todas las funciones de eventos deben usar el prefijo `handle`

```typescript
// ✅ Correcto
const handleClick = () => {
  console.log('clicked');
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    // ...
  }
};

const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  // ...
};

// En JSX
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  Enviar
</button>
```

---

## TypeScript

### Tipado Estricto
- **Siempre definir tipos** para props, estados y funciones
- Evitar `any` - usar `unknown` si es necesario y hacer type guards

```typescript
// ✅ Correcto
interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect: (id: string) => void;
  className?: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect, className }) => {
  // ...
};

// ✅ Tipos para funciones
const calculateDistance = (start: Coordinates, end: Coordinates): number => {
  // ...
  return distance;
};
```

### Interfaces vs Types
- **Interfaces**: Para definición de objetos y props de componentes
- **Types**: Para uniones, intersecciones y tipos complejos

```typescript
// Interfaces para objetos
interface User {
  id: string;
  name: string;
  email: string;
}

// Types para uniones y tipos complejos
type Status = 'idle' | 'loading' | 'success' | 'error';
type Result<T> = { success: true; data: T } | { success: false; error: string };
```

---

## Styling con TailwindCSS

### Reglas Generales
- **SIEMPRE usar Tailwind** para estilos - evitar CSS inline o archivos CSS separados
- Usar clases utilitarias de Tailwind en lugar de estilos personalizados
- Para estilos complejos, usar `@apply` en archivos CSS solo cuando sea absolutamente necesario

```typescript
// ✅ Correcto
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-2xl font-bold text-gray-900">Título</h2>
</div>

// ❌ Evitar
<div style={{ display: 'flex', padding: '24px', backgroundColor: 'white' }}>
  <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Título</h2>
</div>
```

### Clases Condicionales
- Usar template literals para clases dinámicas
- Considerar librerías como `clsx` o `classnames` para lógica compleja

```typescript
// ✅ Simple
<button className={`px-4 py-2 rounded ${isActive ? 'bg-blue-600' : 'bg-gray-400'}`}>
  Click
</button>

// ✅ Con múltiples condiciones (usar clsx)
import clsx from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded transition-colors',
  isActive && 'bg-blue-600 text-white',
  isDisabled && 'opacity-50 cursor-not-allowed',
  !isActive && !isDisabled && 'bg-gray-400 hover:bg-gray-500'
)}>
  Click
</button>
```

---

## Accesibilidad (A11y)

### Elementos Interactivos
- **Todos los elementos interactivos** deben ser accesibles mediante teclado
- Usar atributos ARIA apropiados

```typescript
// ✅ Correcto - Botón accesible
<button
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  aria-label="Cerrar modal"
  tabIndex={0}
  className="p-2 rounded hover:bg-gray-100"
>
  <X className="w-5 h-5" />
</button>

// ✅ Correcto - Div interactivo
<div
  role="button"
  onClick={handleSelect}
  onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
  tabIndex={0}
  aria-label={`Seleccionar vehículo ${vehicle.plate}`}
  className="cursor-pointer p-4 rounded hover:bg-gray-50"
>
  {vehicle.plate}
</div>
```

### Atributos ARIA Comunes
- `aria-label`: Etiqueta descriptiva para lectores de pantalla
- `aria-labelledby`: Referencia al ID del elemento que etiqueta
- `aria-describedby`: Referencia al ID del elemento que describe
- `aria-hidden`: Ocultar elementos decorativos de lectores de pantalla
- `role`: Definir el rol semántico del elemento

```typescript
// ✅ Modal accesible
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirmar acción</h2>
  <p id="modal-description">¿Está seguro de continuar?</p>
  <button onClick={handleConfirm} aria-label="Confirmar">Sí</button>
  <button onClick={handleCancel} aria-label="Cancelar">No</button>
</div>
```

### Focus Management
- Asegurar que el foco sea visible y lógico
- Usar `autoFocus` con precaución

```typescript
// ✅ Estilos de focus visibles
<button className="px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Enviar
</button>
```

---

## Estructura de Componentes

### Orden Interno del Componente
```typescript
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks de estado
  const [state, setState] = useState(initialValue);
  
  // 2. Hooks de contexto/store
  const { data } = useStore();
  
  // 3. Refs
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 4. Effects
  useEffect(() => {
    // ...
  }, [dependencies]);
  
  // 5. Event handlers (con prefijo "handle")
  const handleClick = () => {
    // ...
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // ...
  };
  
  // 6. Funciones auxiliares
  const calculateTotal = () => {
    // ...
  };
  
  // 7. Early returns
  if (!data) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // 8. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

### Imports
- Agrupar y ordenar imports lógicamente

```typescript
// 1. React y hooks de React
import React, { useState, useEffect, useRef } from 'react';

// 2. Librerías externas
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';

// 3. Contextos y stores
import { useStore } from '../store/useStore';

// 4. Componentes
import Button from './Button';
import Modal from './Modal';

// 5. Tipos
import type { Vehicle, Route } from '../types';

// 6. Utilidades y servicios
import { formatDate } from '../utils/dateUtils';
import { vehicleService } from '../services/vehicleService';

// 7. Estilos (si es necesario)
import './styles.css';
```

---

## Manejo de Estado

### useState
- Nombres descriptivos para estado y setter
- Inicializar con valores apropiados

```typescript
// ✅ Correcto
const [isLoading, setIsLoading] = useState(false);
const [vehicles, setVehicles] = useState<Vehicle[]>([]);
const [selectedId, setSelectedId] = useState<string | null>(null);
```

### useEffect
- Dependencias claras y correctas
- Cleanup cuando sea necesario

```typescript
// ✅ Correcto
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetchVehicles();
      setVehicles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);

// ✅ Con cleanup
useEffect(() => {
  const subscription = dataStream.subscribe(handleData);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Patrones Comunes

### Loading States
```typescript
const MyComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
};
```

### Conditional Rendering
```typescript
// ✅ Early return para casos simples
if (!user) return <LoginPrompt />;

// ✅ Ternario para alternativas simples
{isEditing ? <EditForm /> : <DisplayView />}

// ✅ && para renderizado condicional
{hasNotifications && <NotificationBadge count={count} />}

// ✅ Switch/case para múltiples opciones (en función)
const renderStatus = (status: Status) => {
  switch (status) {
    case 'pending':
      return <PendingIcon />;
    case 'approved':
      return <ApprovedIcon />;
    case 'rejected':
      return <RejectedIcon />;
    default:
      return null;
  }
};
```

---

## Optimización de Performance

### Lazy Loading
```typescript
// ✅ Componentes pesados con lazy loading
import React, { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <HeavyComponent />
  </Suspense>
);
```

### Memoización
```typescript
// ✅ useMemo para cálculos costosos
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// ✅ useCallback para funciones que se pasan como props
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ✅ React.memo para componentes que rerenderean frecuentemente
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* ... */}</div>;
});
```

---

## Testing (Recomendaciones)

### Estructura de Tests
```typescript
describe('VehicleCard', () => {
  it('should render vehicle information correctly', () => {
    // Arrange
    const mockVehicle = { id: '1', plate: 'ABC-123', model: 'Truck' };
    
    // Act
    render(<VehicleCard vehicle={mockVehicle} />);
    
    // Assert
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    // Arrange
    const handleSelect = jest.fn();
    const mockVehicle = { id: '1', plate: 'ABC-123' };
    
    // Act
    render(<VehicleCard vehicle={mockVehicle} onSelect={handleSelect} />);
    fireEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(handleSelect).toHaveBeenCalledWith('1');
  });
});
```

---

## Errores Comunes a Evitar

### ❌ No usar funciones, usar const
```typescript
// ❌ Evitar
function handleClick() {
  // ...
}

// ✅ Preferir
const handleClick = () => {
  // ...
};
```

### ❌ No usar operador ternario en className cuando hay muchas condiciones
```typescript
// ❌ Evitar (difícil de leer)
<div className={`base ${condition1 ? 'class1' : condition2 ? 'class2' : 'class3'}`}>

// ✅ Preferir (con clsx)
<div className={clsx('base', {
  'class1': condition1,
  'class2': condition2 && !condition1,
  'class3': !condition1 && !condition2
})}>
```

### ❌ No repetir código
```typescript
// ❌ Evitar repetición
<button className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
<button className="px-4 py-2 bg-blue-500 text-white rounded">Cancel</button>
<button className="px-4 py-2 bg-blue-500 text-white rounded">Delete</button>

// ✅ Crear componente reutilizable
const Button: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded">
    {children}
  </button>
);
```

---

## Ejemplos de Referencia en el Proyecto

### Componente con todas las mejores prácticas
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import type { Vehicle } from '../types';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (vehicle: Vehicle) => Promise<void>;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plate: vehicle?.plate || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plate || !formData.model) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData as Vehicle);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-lg shadow-lg p-6 space-y-4"
      role="form"
      aria-label="Formulario de vehículo"
    >
      <h2 className="text-2xl font-bold text-gray-900">
        {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
      </h2>

      <div className="space-y-2">
        <label 
          htmlFor="plate" 
          className="block text-sm font-medium text-gray-700"
        >
          Patente
        </label>
        <input
          id="plate"
          name="plate"
          type="text"
          value={formData.plate}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-required="true"
          required
        />
      </div>

      <div className="space-y-2">
        <label 
          htmlFor="model" 
          className="block text-sm font-medium text-gray-700"
        >
          Modelo
        </label>
        <input
          id="model"
          name="model"
          type="text"
          value={formData.model}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-required="true"
          required
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          onKeyDown={(e) => e.key === 'Enter' && onCancel()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Cancelar"
          tabIndex={0}
        >
          <X className="w-5 h-5 inline mr-2" aria-hidden="true" />
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isLoading ? 'Guardando...' : 'Guardar vehículo'}
          tabIndex={0}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 inline mr-2 animate-spin" aria-hidden="true" />
              Guardando...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 inline mr-2" aria-hidden="true" />
              Guardar
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
```

---

## Checklist de Revisión de Código

Antes de hacer commit, verifica:

- [ ] ¿Usé early returns donde fue posible?
- [ ] ¿Todos los estilos están con TailwindCSS?
- [ ] ¿Los event handlers tienen prefijo "handle"?
- [ ] ¿Las variables y funciones tienen nombres descriptivos?
- [ ] ¿Definí tipos TypeScript para todo?
- [ ] ¿Los elementos interactivos son accesibles (tabindex, aria-label, onKeyDown)?
- [ ] ¿El código está completo sin TODOs o placeholders?
- [ ] ¿Importé todas las dependencias necesarias?
- [ ] ¿Seguí el principio DRY?
- [ ] ¿El código es fácil de leer y entender?

---

## Recursos Adicionales

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Best Practices](https://react.dev/learn)

---

**Última actualización**: Diciembre 2025
