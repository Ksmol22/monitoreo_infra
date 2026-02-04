# Monitoreo Infraestructura - Angular Frontend

Aplicación Angular para monitoreo de infraestructura (servidores Linux, Windows y bases de datos).

## Características

- Dashboard con métricas en tiempo real
- Gestión de sistemas (Linux, Windows, Databases)
- Visualización de logs del sistema
- Interfaz responsive con Tailwind CSS

## Requisitos

- Node.js 18+
- npm o yarn
- Angular CLI 18+

## Instalación

```bash
# Instalar dependencias
npm install

# Instalar Angular CLI globalmente (si no lo tienes)
npm install -g @angular/cli
```

## Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start
# o
ng serve

# La aplicación estará disponible en http://localhost:4200
```

## Build

```bash
# Build de producción
npm run build
# o
ng build --configuration production

# Los archivos compilados estarán en dist/
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/       # Componentes reutilizables
│   │   ├── layout/
│   │   ├── loader/
│   │   ├── metric-card/
│   │   └── status-badge/
│   ├── pages/           # Páginas/Vistas
│   │   ├── dashboard/
│   │   ├── database-list/
│   │   ├── linux-list/
│   │   ├── windows-list/
│   │   ├── logs/
│   │   └── not-found/
│   ├── services/        # Servicios HTTP
│   │   ├── api.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── logs.service.ts
│   │   ├── metrics.service.ts
│   │   └── systems.service.ts
│   ├── models/          # Interfaces TypeScript
│   ├── environments/    # Configuración por entorno
│   ├── app.module.ts
│   ├── app.component.ts
│   └── app-routing.module.ts
├── index.css
└── main.ts
```

## API Backend

La aplicación se conecta a un backend FastAPI. Configurar la URL del API en:
- Desarrollo: `src/app/environments/environment.ts`
- Producción: `src/app/environments/environment.prod.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## Proxy de Desarrollo

El archivo `proxy.conf.json` redirige las peticiones `/api` al backend durante el desarrollo:

```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

## Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Build de producción
- `npm run watch` - Build en modo watch
- `npm test` - Ejecuta los tests

## Tecnologías Principales

- **Angular 18** - Framework principal
- **TypeScript** - Lenguaje
- **Tailwind CSS** - Estilos
- **RxJS** - Programación reactiva
- **HttpClient** - Peticiones HTTP

## Licencia

MIT
