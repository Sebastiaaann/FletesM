# FleetTech – Prompts y Diagramas de Arquitectura (Mermaid)

Este documento incluye:
- Prompts listos para pedir a un modelo/IA que genere o refine diagramas.
- Ejemplos base en **Mermaid** que puedes adaptar.
- Variantes: arquitectura lógica, física, flujo de datos, secuencias, estado y roadmap evolutivo.

## 1. Prompt General de Arquitectura Lógica
```
Genera un diagrama Mermaid que muestre la arquitectura lógica de FleetTech.
Incluye: Usuario Web, Frontend (React + Vite), Estado (Zustand), Servicios (Supabase: Auth, DB, Realtime), Servicio IA (Gemini API), Mapa (Leaflet/OpenStreetMap), Gestión de Rutas, Módulo Compliance, Módulo Finanzas y Futuro: Motor de Optimización y Mantenimiento Predictivo. Agrupa por capas: Presentación, Lógica, Datos, IA/Servicios Externos.
```

```mermaid
flowchart LR
  subgraph Presentacion[Presentación]
    U[Usuario Navegador]
    FE[React + Vite SPA]
    ST[Zustand Store]
  end
  subgraph Logica[Capas de Dominio]
    RP[RoutePlanner]
    TR[FleetTracking]
    CP[Compliance]
    FN[Financials]
    AIQ[AIQuote]
  end
  subgraph Datos[Persistencia / Realtime]
    SB[(Supabase DB)]
    AUTH[[Auth Service]]
    RT[(Realtime Canal)]
  end
  subgraph Externo[Servicios Externos]
    GM[Gemini API]
    MAP[Leaflet / OSM]
    FUT1[Optimizador VRP (roadmap)]
    FUT2[Mantenimiento Predictivo (roadmap)]
  end

  U --> FE --> ST
  ST --> RP & TR & CP & FN & AIQ
  RP --> MAP
  AIQ --> GM
  TR --> RT
  CP --> SB
  FN --> SB
  RP --> SB
  SB --> AUTH
  ST --> RT
  FUT1 --> RP
  FUT2 --> CP
```

## 2. Prompt de Arquitectura Física / Despliegue
```
Genera un diagrama Mermaid de despliegue para FleetTech: Cliente Web (Browser), CDN, Hosting (Vercel/Netlify), Supabase (Postgres + Auth + Realtime), API Gemini, Futuro cluster Docker/Kubernetes para microservicios de optimización y mantenimiento. Muestra conexiones seguras HTTPS y direcciones lógicas.
```

```mermaid
flowchart TB
  Browser[(Browser Usuario)] --> CDN[CDN / Edge]
  CDN --> FEHOST[Vercel / Netlify]
  FEHOST --> APICalls((Fetch / REST / WebSocket))
  APICalls --> SUPA[(Supabase Postgres)]
  APICalls --> AUTH[Supabase Auth]
  APICalls --> REALTIME[Supabase Realtime WS]
  APICalls --> GEMINI[Gemini API]
  subgraph ClusterFuturo[Cluster Futuro]
    OPT[Servicio Optimización VRP]
    PRED[Servicio Predictivo Mantenimiento]
  end
  SUPA <--> OPT
  SUPA <--> PRED
  GEMINI <-->|HTTPS| FEHOST
```

## 3. Prompt Flujo de Datos Principal
```
Genera un diagrama Mermaid que represente el flujo de datos cuando un usuario crea una cotización de ruta: Usuario escribe manifiesto + origen/destino -> Frontend calcula distancia -> Envía prompt a Gemini -> Recibe respuesta estructurada -> Guarda resumen en Supabase -> Actualiza vista AIQuote y Financials.
```

```mermaid
sequenceDiagram
  participant U as Usuario
  participant FE as Frontend (React)
  participant MAP as Leaflet
  participant GM as Gemini API
  participant DB as Supabase DB
  U->>FE: Ingresa manifiesto y ubicaciones
  FE->>MAP: Calcula distancia (Haversine)
  MAP-->>FE: Distancia km
  FE->>GM: Prompt (manifiesto + distancia)
  GM-->>FE: Cotización estructurada
  FE->>DB: Persistir cotización
  DB-->>FE: Confirmación
  FE->>U: Mostrar resultado y métricas
```

## 4. Prompt Secuencia Tracking en Tiempo Real
```
Genera un diagrama Mermaid de secuencia para el tracking: Conductor actualiza posición -> Supabase Realtime emite evento -> Frontend suscrito actualiza mapa Leaflet -> Estado almacena última posición y recalcula panel resumen.
```

```mermaid
sequenceDiagram
  participant DEV as Dispositivo Vehículo
  participant RT as Supabase Realtime
  participant DB as Supabase DB
  participant FE as Frontend
  participant MAP as Leaflet Map
  DEV->>DB: Insert/Update posición
  DB->>RT: Trigger evento cambio
  RT-->>FE: Evento WS nueva posición
  FE->>MAP: Re-render marker
  FE->>FE: Actualiza Zustand (estado flota)
```

## 5. Prompt Diagrama de Estados Simplificado
```
Genera un diagrama de estados Mermaid para un vehículo: Operativo, En Ruta, En Mantenimiento, Inactivo, Alerta Documentación. Transiciones: Asignar viaje, Completar viaje, Registrar mantenimiento, Detectar vencimiento, Validar documentación.
```

```mermaid
stateDiagram-v2
  [*] --> Operativo
  Operativo --> En_Ruta: Asignar viaje
  En_Ruta --> Operativo: Completar viaje
  Operativo --> En_Mantenimiento: Registrar mantenimiento
  En_Ruta --> En_Mantenimiento: Falla detectada
  Operativo --> Alerta_Documentacion: Detectar vencimiento
  Alerta_Documentacion --> Operativo: Validar documentación
  En_Mantenimiento --> Operativo: Finalizar servicio
  Inactivo --> Operativo: Reactivar
  Operativo --> Inactivo: Baja temporal
```

## 6. Prompt Roadmap Evolutivo (Release Plan)
```
Genera diagrama Mermaid mostrando roadmap por fases: MVP (Tracking básico, Cotizador IA), Fase 2 (Optimización rutas multi-parada, Panel Finanzas), Fase 3 (Mantenimiento predictivo, API pública), Fase 4 (Marketplace y CO2 Dashboard).
```

```mermaid
gantt
  dateFormat  YYYY-MM-DD
  title Roadmap Evolutivo FleetTech
  section MVP
  Tracking Básico & Cotizador IA     :done, m1, 2025-09-01,2025-10-15
  section Fase 2
  Optimización Multi-Parada          :active, m2, 2025-10-16,2025-12-15
  Panel Finanzas                     :m3, 2025-11-01,2025-12-30
  section Fase 3
  Mantenimiento Predictivo           :m4, 2026-01-05,2026-03-30
  API Pública                        :m5, 2026-02-01,2026-04-15
  section Fase 4
  Marketplace Cargas                 :m6, 2026-05-01,2026-07-31
  Dashboard CO2                      :m7, 2026-06-01,2026-08-15
```

## 7. Prompt Diagrama Entidad-Relación Simplificado
```
Genera un diagrama Mermaid (classDiagram) mostrando entidades: Vehiculo, Conductor, Viaje, Documento, Cotizacion, Mantenimiento. Relaciones: Vehiculo 1..* Viaje, Conductor 1..* Viaje, Vehiculo 1..* Documento, Vehiculo 1..* Mantenimiento, Viaje 1..1 Cotizacion.
```

```mermaid
classDiagram
  class Vehiculo {
    string patente
    string tipo
    int anio
    string estado
  }
  class Conductor {
    string nombre
    string licencia
    bool disponible
  }
  class Viaje {
    string origen
    string destino
    float distanciaKm
    float consumoEstimado
  }
  class Documento {
    string tipo
    date vencimiento
    bool vigente
  }
  class Cotizacion {
    string manifiesto
    float costoEstimado
    string moneda
  }
  class Mantenimiento {
    date fecha
    string tipoServicio
    float costo
  }
  Vehiculo "1" -- "*" Viaje
  Conductor "1" -- "*" Viaje
  Vehiculo "1" -- "*" Documento
  Vehiculo "1" -- "*" Mantenimiento
  Viaje "1" -- "1" Cotizacion
```

## 8. Prompt Interacción IA (Secuencia Prompting)
```
Genera diagrama de secuencia Mermaid para flujo de cotización IA: Usuario -> Frontend -> Normaliza texto -> Construye prompt -> Gemini -> Postprocesa respuesta -> Guarda en Supabase -> Actualiza UI.
```

```mermaid
sequenceDiagram
  participant U as Usuario
  participant FE as Frontend
  participant NL as Normalizador (limpieza)
  participant GM as Gemini API
  participant DB as Supabase
  U->>FE: Ingresa descripción carga
  FE->>NL: Limpiar / estructurar manifiesto
  NL-->>FE: Texto normalizado
  FE->>GM: Prompt (carga + distancia + formato)
  GM-->>FE: Respuesta JSON-like
  FE->>FE: Validar campos / fallback
  FE->>DB: Guardar cotización
  DB-->>FE: OK
  FE-->>U: Mostrar precio y detalles
```

## 9. Prompt Seguridad / Acceso
```
Genera diagrama Mermaid de flujo de autenticación: Usuario -> Frontend -> Supabase Auth -> Token -> Acceso autorizado a DB y Realtime. Incluir control de roles futuro (ADMIN, OPERADOR, ANALISTA).
```

```mermaid
flowchart LR
  U[Usuario] --> FE[Frontend]
  FE --> AUTH[Supabase Auth]
  AUTH --> TOK{Token JWT}
  TOK -->|válido| ACCESS[Acceso Recursos]
  ACCESS --> DB[(Postgres)]
  ACCESS --> RT[Realtime Canal]
  TOK -->|inválido| ERR[Error / Re-login]
  subgraph Roles Futuro
    ADMIN[Admin]
    OPER[Operador]
    ANAL[Analista]
  end
  ACCESS --> ADMIN
  ACCESS --> OPER
  ACCESS --> ANAL
```

## 10. Prompt Para Adaptar a Microservicios
```
Genera un diagrama Mermaid que muestre transición futura a microservicios: Servicio Frontend, Servicio Rutas, Servicio Mantenimiento, Servicio Cotizaciones IA, Servicio Compliance, API Gateway, Base de Datos compartida vs bases específicas, Bus de Eventos.
```

```mermaid
flowchart TB
  GW[API Gateway] --> ROUTE[Svc Rutas]
  GW --> QUOTE[Svc Cotizaciones IA]
  GW --> MAINT[Svc Mantenimiento]
  GW --> COMP[Svc Compliance]
  GW --> FIN[Svc Finanzas]
  ROUTE --> BUS[(Event Bus)]
  QUOTE --> BUS
  MAINT --> BUS
  COMP --> BUS
  FIN --> BUS
  subgraph Data
    DB1[(DB Operacional)]
    DB2[(DB Analítica)]
    CACHE[(Redis Cache)]
  end
  ROUTE --> DB1
  QUOTE --> DB1
  MAINT --> DB1
  COMP --> DB1
  FIN --> DB2
  GW --> CACHE
```

---
### Consejos para Refinar Prompts
1. Añade métricas o KPIs concretos al pedir detalle (ej: latencia, reducción de costos).  
2. Especifica si quieres colores o estilos avanzados (Mermaid supports classDef).  
3. Indica si el diagrama debe ocultar elementos futuros (para presentaciones MVP).  
4. Solicita versiones alternativas: "Genera una versión mínima sin componentes futuros".  
5. Para iteraciones: "Refina el diagrama resaltando comunicaciones asíncronas y canales WebSocket".

### Ejemplo Prompt Iterativo
```
Refina el diagrama de flujo de cotización agregando manejo de errores (timeout Gemini) y fallback a tarifa base histórica si la respuesta falla.
```

---
Si necesitas que genere más variantes (p.ej. clases CSS Mermaid o versiones en inglés), pídelo directamente.
