# 🚛 FleetMaster - Sistema de Gestión de Flotas con IA

Sistema inteligente de gestión logística para optimizar operaciones de transporte, análisis financiero en tiempo real y predicciones con Gemini AI.

## 🌟 Características

- **Dashboard Operacional**: Métricas en tiempo real de tu flota
- **Rastreo GPS**: Monitoreo en vivo de vehículos
- **Gestión de Flota**: Administración de vehículos y conductores
- **Planificador de Rutas**: Optimización de trayectos
- **Constructor de Rutas Financiero**: Análisis de rentabilidad con IA
- **Análisis Financiero**: Reportes de costos y utilidades
- **Cumplimiento**: Gestión de documentación y licencias

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener:

- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (incluido con Node.js)
- **API Key de Google Gemini** - [Obtener gratis aquí](https://aistudio.google.com/app/apikey)

## 🚀 Instalación y Configuración

### Paso 1: Extraer el proyecto

Extrae el archivo ZIP en una carpeta de tu elección.

### Paso 2: Instalar dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

**Nota para Windows**: Si usas PowerShell y tienes problemas, ejecuta:
```powershell
npm install --legacy-peer-deps
```

### Paso 3: Configurar la API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la clave generada

5. En la carpeta del proyecto, abre el archivo `.env.local` y reemplaza:

```env
GEMINI_API_KEY=tu_api_key_aqui
```

Por tu clave real:

```env
GEMINI_API_KEY=AIzaSyCmMd6y1ulJ5P5MXjziGdhQf02xIdu5IXs
```

**⚠️ IMPORTANTE**: No compartas tu API key públicamente.

### Paso 4: Ejecutar el proyecto

Una vez instalado todo, ejecuta:

```bash
npm run dev
```

La aplicación se abrirá automáticamente en tu navegador en:
```
http://localhost:3001
```

Si el puerto 3000 está ocupado, Vite automáticamente usará el 3001 o siguiente disponible.

## 🛠️ Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la versión de producción |
| `npm run preview` | Previsualiza el build de producción |

## 📦 Estructura del Proyecto

```
FletesM/
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── FleetManager.tsx
│   ├── RouteBuilder.tsx  # Constructor con análisis financiero
│   ├── RoutePlanner.tsx
│   └── ...
├── services/           # Servicios de API
│   └── geminiService.ts
├── App.tsx            # Componente principal
├── types.ts           # Tipos TypeScript
├── .env.local         # Variables de entorno (API Key)
└── package.json       # Dependencias
```

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Port 3000 is already in use"
La aplicación automáticamente usará otro puerto (3001, 3002, etc.). Revisa la terminal para ver el puerto asignado.

### Error: "GEMINI_API_KEY is not defined"
Verifica que:
1. El archivo `.env.local` existe en la raíz del proyecto
2. La API key está configurada correctamente
3. No hay espacios extras en la línea

### Error de compilación de TypeScript
```bash
npm install typescript --save-dev
```

## 🌐 Desplegar en GitHub Pages

1. Construye el proyecto:
```bash
npm run build
```

2. Sube la carpeta `dist` a tu repositorio GitHub

3. Configura GitHub Pages en Settings → Pages → Source: GitHub Actions

El workflow ya está configurado en `.github/workflows/deploy.yml`

## 📱 Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Google Gemini AI** - Inteligencia artificial
- **Lucide React** - Iconos
- **React Leaflet** - Mapas interactivos

## 💡 Uso del Constructor de Rutas

1. Ve a la sección "Constructor" en el menú
2. Completa los detalles de la ruta (origen, destino, distancia)
3. Ingresa la estructura de costos
4. Haz clic en "Calcular Rentabilidad"
5. Gemini AI analizará y dará recomendaciones
6. Guarda la ruta en el historial

## 🔐 Seguridad

- **Nunca** compartas tu API key públicamente
- **No subas** el archivo `.env.local` a GitHub
- Usa variables de entorno en producción

## 📞 Soporte

Si encuentras problemas:
1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que npm esté instalado: `npm --version`
3. Borra `node_modules` y `package-lock.json`, luego ejecuta `npm install` nuevamente

## 📄 Licencia

© 2024 FleetMaster Corp. Todos los derechos reservados.

---

**🎉 ¡Listo! Ahora puedes empezar a usar FleetMaster.**
