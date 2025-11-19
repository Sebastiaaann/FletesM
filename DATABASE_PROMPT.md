# Prompt para Diseño de Base de Datos - FleetMaster

## Contexto del Proyecto

Soy desarrollador de **FleetMaster**, un sistema de gestión de flotas de transporte con inteligencia artificial. La aplicación está construida con React + TypeScript y actualmente usa datos mock. Necesito diseñar una base de datos completa y escalable.

## Descripción del Sistema

FleetMaster es una plataforma logística que permite:

1. **Gestión de Flota**: Administrar vehículos, conductores y su estado operacional
2. **Rastreo GPS**: Monitoreo en tiempo real de ubicaciones
3. **Planificación de Rutas**: Crear y optimizar rutas de transporte
4. **Análisis Financiero**: Calcular costos, ingresos y rentabilidad por ruta
5. **Cumplimiento**: Gestionar documentación legal, licencias y seguros
6. **Dashboard**: Métricas y KPIs en tiempo real
7. **Integración con IA**: Gemini AI para predicciones y recomendaciones

## Requerimientos de la Base de Datos

### 1. Entidades Principales

#### Vehículos (Vehicles)
- Información básica: patente, marca, modelo, año, tipo
- Estado operacional: activo, en mantenimiento, inactivo
- Métricas: kilometraje actual, nivel de combustible
- Mantenimiento: próxima revisión técnica, historial
- Capacidad de carga (toneladas)
- Consumo promedio de combustible
- Costos fijos mensuales (seguro, permisos, etc.)

#### Conductores (Drivers)
- Datos personales: nombre, RUT (ID chileno), contacto
- Licencias: tipo, fecha de vencimiento
- Estado: disponible, en ruta, fuera de servicio
- Historial de rutas completadas
- Evaluación de desempeño
- Salario/costo por ruta

#### Rutas (Routes)
- Origen y destino (texto y coordenadas)
- Distancia en kilómetros
- Duración estimada vs real
- Estado: planificada, en curso, completada, cancelada
- Asignación de conductor y vehículo
- Timestamps: creado, iniciado, completado

#### Carga (Cargo)
- Descripción del producto
- Peso en toneladas
- Tipo: frágil, refrigerado, peligroso, normal
- Valor declarado
- Cliente/empresa origen
- Cliente/empresa destino

#### Costos por Ruta (Route Costs)
- Combustible: costo por km
- Peajes: monto total
- Salario conductor: por ruta
- Seguros: costo prorrateado
- Mantenimiento: costo estimado
- Otros gastos operacionales

#### Ingresos (Revenue)
- Cotización al cliente (precio cobrado)
- Método de pago
- Estado de pago: pendiente, pagado, atrasado
- Fecha de facturación

#### Mantenimientos (Maintenance)
- Vehículo relacionado
- Tipo: preventivo, correctivo, obligatorio
- Descripción del trabajo
- Costo
- Fecha realizada
- Próxima fecha sugerida
- Taller/proveedor

#### Documentos/Cumplimiento (Compliance)
- Tipo: licencia, seguro, permiso, revisión técnica
- Entidad relacionada: conductor o vehículo
- Fecha de vencimiento
- Estado: vigente, próximo a vencer, vencido
- Archivo adjunto (path o URL)

#### Ubicaciones GPS (GPS Tracking)
- Vehículo/ruta relacionada
- Timestamp
- Latitud, longitud
- Velocidad actual
- Estado del motor (encendido/apagado)

#### Clientes (Clients)
- Nombre/razón social
- RUT/identificación fiscal
- Contacto
- Dirección
- Historial de rutas contratadas
- Calificación

#### Usuarios del Sistema (System Users)
- Nombre, email
- Rol: admin, dispatcher, conductor, cliente
- Permisos
- Última sesión

### 2. Relaciones Esperadas

- Un **vehículo** tiene múltiples **mantenimientos** (1:N)
- Un **conductor** tiene múltiples **rutas** asignadas (1:N)
- Una **ruta** tiene UN vehículo y UN conductor (N:1, N:1)
- Una **ruta** tiene múltiples **ubicaciones GPS** (1:N)
- Una **ruta** tiene UN registro de **costos** (1:1)
- Una **ruta** tiene UN registro de **ingresos** (1:1)
- Un **cliente** contrata múltiples **rutas** (1:N)
- Un **vehículo** tiene múltiples **documentos** (1:N)
- Un **conductor** tiene múltiples **documentos** (1:N)

### 3. Métricas y Análisis Requeridos

La base de datos debe permitir consultas para:

- **Rentabilidad por ruta**: ingresos - costos
- **Margen de utilidad**: (utilidad / ingresos) * 100
- **Costo promedio por kilómetro**
- **Conductor más rentable**: suma de utilidades por conductor
- **Ruta más frecuente**: cantidad de veces realizada
- **Vehículo con mayor utilización**: horas/días en ruta
- **Predicción de mantenimientos**: basado en kilometraje
- **Eficiencia de combustible**: consumo real vs esperado
- **Tiempo promedio de entrega por ruta**
- **Historial de ubicaciones GPS** para análisis de comportamiento

### 4. Consideraciones Técnicas

- **Escalabilidad**: El sistema debe soportar cientos de vehículos y miles de rutas
- **Tiempo real**: Las ubicaciones GPS se actualizan cada 30 segundos
- **Integridad**: Restricciones de foreign keys
- **Auditoría**: Campos created_at, updated_at en todas las tablas
- **Soft deletes**: No eliminar registros, usar campo deleted_at
- **Índices**: En campos de búsqueda frecuente (patente, RUT, estado)
- **Moneda**: Todos los valores monetarios en CLP (Pesos Chilenos)

### 5. Tipos de Base de Datos a Considerar

Por favor evalúa y recomienda entre:
- **PostgreSQL** (relacional robusto)
- **MySQL** (relacional popular)
- **MongoDB** (NoSQL para flexibilidad)
- **Firebase/Supabase** (Backend as a Service)

### 6. Funcionalidades Futuras a Considerar

- Sistema de notificaciones (alertas de vencimiento)
- Chat interno entre dispatcher y conductores
- Integración con APIs de mapas (Google Maps, Waze)
- Reportes PDF automatizados
- Dashboard personalizable por usuario
- App móvil para conductores

## Resultado Esperado

Por favor proporciona:

1. **Diagrama ERD** (Entidad-Relación) en texto o formato Mermaid
2. **Scripts SQL de creación** para todas las tablas
3. **Índices recomendados** para optimizar consultas
4. **Triggers o stored procedures** útiles (opcional)
5. **Queries de ejemplo** para las métricas principales
6. **Recomendación de tecnología** con justificación
7. **Estrategia de migración** desde datos mock a producción
8. **Mejores prácticas** de seguridad y performance

## Restricciones

- Presupuesto limitado (preferir soluciones open source o con tier gratuito generoso)
- Equipo pequeño (2-3 desarrolladores)
- Despliegue en la nube (AWS, Azure, GCP o similar)
- Debe integrarse fácilmente con React/TypeScript

## Información Adicional

- La aplicación actual usa TypeScript con interfaces definidas en `types.ts`
- Actualmente no hay backend, es frontend puro con datos mock
- Se usará API REST o GraphQL para comunicación (a definir)
- Autenticación con JWT o similar

---

**Por favor diseña una arquitectura de base de datos completa, profesional y escalable que cumpla con todos estos requerimientos.**
