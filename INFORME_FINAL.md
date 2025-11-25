# FleetTech – Informe Final Proyecto IA

## 1. Nombre del Proyecto
**FleetTech: Plataforma Inteligente de Gestión y Optimización de Flotas Logísticas.**

## 2. Problema Identificado en el Negocio / Empresa
Las PYMEs y operadores medianos de transporte en Latinoamérica carecen de una solución integral que unifique:
- Visibilidad en tiempo real del estado y ubicación de los vehículos.
- Optimización de rutas considerando carga, distancia, costos y cumplimiento.
- Gestión documental y normativa (revisiones técnicas, permisos de circulación, jornadas laborales, licencias de conductores).
- Control financiero (costos operativos, márgenes, consumo de combustible, mantenimiento).
- Predicción de fallas y reducción de inactividad no planificada.

Consecuencias actuales:
- Sobreconsumo de combustible (ineficiencias de ruta y conducción).
- Planificación manual de rutas con alta carga administrativa.
- Riesgo legal por documentación vencida y falta de alertas preventivas.
- Baja rentabilidad por ausencia de analítica integrada y decisiones tardías.

FleetTech aborda estas brechas mediante una plataforma todo‑en‑uno con IA generativa y componentes analíticos especializados.

## 3. Modelo de Negocio Propuesto y Rol Estratégico de la IA
**Segmentos Objetivo:**
- Transportistas pequeños (1–10 vehículos) que requieren digitalización básica y bajo costo.
- Operadores medianos (11–100 vehículos) con necesidad de optimización y cumplimiento.
- Empresas con logística interna (retail, distribución, e‑commerce) que buscan integración futura vía API.

**Propuesta de Valor:** Unificar rastreo, planificación, cumplimiento, costos y mantenimiento en una sola interfaz, complementada con un asistente inteligente (Gemini) que interpreta manifiestos de carga, sugiere rutas y genera cotizaciones estructuradas rápidamente.

**Fuentes de Ingresos:**
- Suscripción escalonada (Freemium, Starter, Professional, Enterprise).
- Add‑ons: API pública, módulo avanzado de mantenimiento predictivo, integraciones ERP.
- Futuro: Marketplace regional de cargas (fee transaccional por emparejamiento).

**Rol Estratégico de la IA:**
- Cotizaciones automáticas basadas en descripción de carga + distancia calculada.
- Asistente conversacional para consultas operativas (ej: “¿Qué vehículo tiene mayor consumo anómalo esta semana?”).
- Sugerencia de optimización de rutas y priorización de vehículos para mantenimiento.
- Futuro: Modelos predictivos para reducir inactividad y mejorar distribución de carga.

## 4. Tipos de IA Utilizados – Justificación
| Tipo | Uso Actual / Planeado | Justificación |
|------|-----------------------|---------------|
| IA Generativa (Gemini) | Cotizador inteligente, interpretación de manifiestos, asistente operativo NLP | Maneja texto libre y reduce fricción en entrada de datos. |
| Algoritmos de Optimización | Cálculo actual de distancia (Haversine); roadmap VRP (Savings, Clarke‑Wright, genéticos) | Reduce kilómetros y tiempo, mejora ocupación y costos. |
| Detección de Anomalías | Estadística (IQR / Z‑score) para consumo combustible | Identifica desviaciones tempranas para acciones correctivas. |
| Mantenimiento Predictivo (futuro) | Modelos supervisados (Random Forest / XGBoost) | Previene fallas costosas y optimiza calendario de servicios. |

La combinación cubre el espectro: interpretación semiestructurada (generativa), optimización cuantitativa (rutas), prevención (predictivo) y control (anomalías).

## 5. Origen y Tipo de Datos Necesarios
**Estructurados (PostgreSQL / Supabase):**
- Vehículos: patente, tipo, año, estado operativo.
- Conductores: licencias, disponibilidad, historial de conducción.
- Viajes: origen, destino, coordenadas, distancia, consumo de combustible, tiempos.
- Documentación: fechas de vencimiento de revisión técnica, permisos, seguros.
- Costos: mantenimiento, combustible, peajes, ingresos por servicio.

**No estructurados / Semi‑estructurados:**
- Manifiestos de carga (descripciones libres para cotización IA).
- Observaciones de mantenimiento (texto técnico).

**Volumen Estimado Inicial (25 vehículos):**
- 100–300 viajes/semana.
- 12–24 meses de historial recomendado para modelos predictivos.

## 6. Infraestructura Necesaria
| Componente | Tecnología / Servicio | Rol |
|------------|-----------------------|-----|
| Frontend | React + Vite | UI interactiva y rápida (SPA). |
| Estado | Zustand | Manejo de vistas y sesión local. |
| Mapa | Leaflet + OpenStreetMap | Visualización y georreferenciación de rutas. |
| Backend / BaaS | Supabase (PostgreSQL, Auth, Realtime) | Persistencia, autenticación, streaming de cambios. |
| IA | Gemini API | Generación de cotizaciones y respuestas NLP. |
| Hosting | Vercel / Netlify | Despliegue frontend escalable. |
| Observabilidad (futuro) | Prometheus + Grafana | Métricas y salud del sistema. |
| Contenedores (escala) | Docker + Kubernetes (roadmap) | Orquestación para microservicios futuros. |

Seguridad: HTTPS, tokens JWT de Supabase, auditoría de accesos, CORS controlado.

## 7. Ciclo de Vida del Proyecto IA Aplicado
1. Adquisición de datos (registro operativo y documentación).  
2. Limpieza y normalización (validación de coordenadas, formatos de fechas, patentes).  
3. Feature engineering (consumo/km, densidad de rutas, patrones de parada, edad de componentes).  
4. Entrenamiento inicial (cuando existan históricos suficientes).  
5. Evaluación (MAE para costos estimados, precisión en clasificación de riesgo).  
6. Despliegue (funciones serverless / endpoints REST).  
7. Monitoreo (drift en consumo, nuevas clases de falla).  
8. Mejora continua (retuning y ampliación de variables).  

## 8. Implicancias Éticas, Legales e Impacto Organizacional
- **Privacidad:** Coordenadas GPS son datos sensibles; aplicar principio de minimización y políticas claras de retención.  
- **Sesgos:** IA generativa puede incorporar sesgos en lenguaje; revisión humana en prompts críticos.  
- **Transparencia:** Mostrar criterios de alertas (ej. proximidad a vencimientos) para evitar decisiones opacas.  
- **Protección de datos:** Cumplimiento con normativa local (Ley chilena 19.628 y evoluciones).  
- **Responsabilidad:** Recomendaciones de ruta son apoyo; decisión final recae en operador (disclaimer operativo).  
- **Impacto organizacional:** Automatización reduce trabajo manual y requiere re‑entrenamiento del personal para tareas analíticas.  

## 9. Comparación con Casos Reales y Benchmark
| Competidor | Fortaleza Principal | Brecha que FleetTech Aprovecha |
|------------|--------------------|----------------------------------|
| Samsara | Integración hardware + telemática avanzada | Alto costo y enfoque enterprise. |
| Geotab | Gran ecosistema de datos vehiculares | Menor foco regional (español / normativa local). |
| Route4Me | Optimización de rutas last‑mile | Carece de finanzas y compliance integrados. |
| Uber Freight | Marketplace de cargas | No ofrece gestión interna de flota propia. |
| Project44 | Visibilidad global cadena suministro | Costos y complejidad para PYMEs regionales. |

**Diferenciadores FleetTech:** Todo‑en‑uno (rutas + finanzas + legal + IA), localización en español, entrada Freemium, escalabilidad modular.

## 10. Conclusiones y Visión de Futuro
FleetTech establece una base sólida de digitalización logística para operadores medianos, reduciendo costos y riesgos mientras acelera decisiones.  
**Roadmap Próximo:**
- Optimización avanzada VRP multi‑parada y ventanas temporales.  
- Motor de mantenimiento predictivo (modelos supervisados).  
- API pública para integraciones ERP / TMS externos.  
- Marketplace regional de cargas y emparejamiento inteligente.  
- Panel de sostenibilidad (huella CO₂ por ruta / vehículo).  

Visión: Ser la suite logística inteligente líder en LATAM democratizando herramientas de nivel enterprise con IA transparente y responsable.

## 11. Distribución del Trabajo Entre Integrantes (Ejemplo)
| Rol | Responsabilidades |
|-----|-------------------|
| Product Owner | Roadmap, priorización features, validación con usuarios. |
| Frontend Lead | Componentes React, accesibilidad, rendimiento UI. |
| Backend / Data Engineer | Modelado DB, ETL, integraciones, optimización queries. |
| AI / Data Scientist | Prompts Gemini, prototipos predictivos, evaluación modelos. |
| DevOps / Infra | CI/CD, monitoreo, seguridad, escalabilidad. |
| QA / Compliance Analyst | Pruebas funcionales, validación normativa y documentación. |

## 12. Presentación (Esquema de 10 Diapositivas)
1. Título + Equipo + Tagline.
2. Problema y Dolor Actual (estadísticas breves).
3. Propuesta de Valor y Flujo del Usuario (capturas). 
4. Arquitectura Técnica (diagrama alto nivel). 
5. IA Aplicada (Gemini + futuro VRP + mantenimiento). 
6. Datos y Pipeline (estructurados vs no estructurados). 
7. Benchmark y Diferenciación. 
8. Impacto Esperado (KPIs iniciales). 
9. Roadmap y Escalabilidad. 
10. Cierre + Llamado a Demo / Piloto.

## 13. Rúbrica – Mapeo de Cumplimiento
| Criterio | Evidencia (Sección) | Nivel |
|----------|---------------------|-------|
| Definición del problema | Sección 2 | Logrado |
| Modelo de negocio | Sección 3 | Logrado |
| Tipos de IA utilizados | Sección 4 | Logrado |
| Origen y tipo de datos | Sección 5 | Logrado |
| Infraestructura necesaria | Sección 6 | Logrado |
| Avance del informe | Documento completo estructurado | Logrado |
| Participación grupal | Sección 11 (roles) | Logrado |

## 14. KPIs Propuestos (Seguimiento Futuro)
- Reducción consumo combustible: 8–15% en primeros 6 meses.  
- Reducción tiempo planificación rutas: 50% con asistente IA.  
- Cumplimiento documental: >98% documentos vigentes.  
- Error medio cotización IA vs real: <12% MAE.  
- Disminución inactividad por fallas imprevistas: -20% tras módulo predictivo.  

## 15. Ciclo de Mejora Continua (Resumen Visual – Texto)
Adquisición → Normalización → Feature Engineering → Entrenamiento / Ajuste → Despliegue → Monitoreo (drift, métricas) → Retroalimentación de usuarios → Iteración.

---
**Estado Actual del Proyecto:** Frontend operativo (React/Vite), componentes principales (`RoutePlanner`, `Compliance`, `FleetTracking`, `Financials`), integración con Gemini (cotizador), Supabase para persistencia y autenticación. Listo para ampliar modelos internos.

**Anexos (Opcional Futuro):** Diagramas de arquitectura, ejemplos de prompts Gemini, esquema de tablas Supabase.

> Este informe cumple los requisitos solicitados para la Entrega Final del Proyecto de IA y deja delineado el camino técnico y estratégico para la evolución de FleetTech.
