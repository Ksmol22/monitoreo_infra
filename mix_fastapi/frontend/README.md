# Frontend Angular 18 - Monitoreo de Infraestructura

Frontend moderno con Angular 18, TypeScript y Tailwind CSS. Interfaz completamente en español con tema corporativo rojo/blanco.

> ✅ **Proyecto Limpio**: Solo contiene código Angular. Todo el código Vue y React ha sido eliminado.

## 📁 Estructura

```
frontend/src/
├── app/
│   ├── components/         # Componentes Angular reutilizables
│   │   ├── layout/        # Navegación principal
│   │   ├── loader/        # Spinner de carga
│   │   ├── metric-card/   # Tarjetas de métricas
│   │   ├── status-badge/  # Badges de estado
│   │   └── add-system-dialog/  # Formulario de sistemas
│   ├── pages/             # Páginas principales
│   │   ├── dashboard/     # Panel de control
│   │   ├── database-list/ # Lista de bases de datos
│   │   ├── linux-list/    # Lista de servidores RHEL
│   │   ├── windows-list/  # Lista de servidores Windows
│   │   ├── logs/          # Vista de logs
│   │   └── not-found/     # Página 404
│   ├── services/          # Servicios Angular
│   │   ├── api.service.ts        # Cliente HTTP base
│   │   ├── systems.service.ts    # Gestión de sistemas
│   │   ├── metrics.service.ts    # Métricas
│   │   ├── logs.service.ts       # Logs
│   │   └── dashboard.service.ts  # Dashboard stats
│   ├── models/            # Interfaces TypeScript
│   │   └── index.ts       # Interfaces del sistema
│   ├── environments/      # Variables de entorno
│   ├── app.module.ts      # Módulo principal
│   ├── app.component.ts   # Componente raíz
│   └── app-routing.module.ts  # Configuración de rutas
├── index.css              # Estilos globales + Tailwind
└── main.ts                # Bootstrap de Angular
└── style.css           # Estilos globales (Tailwind)
```

## 🚀 Stack Tecnológico

- **Angular 18** - Framework frontend
- **TypeScript** - Type safety
- **Angular Router** - Sistema de rutas
- **RxJS** - Programación reactiva
- **HttpClient** - Cliente HTTP con interceptors
- **Tailwind CSS** - Utility-first CSS
- **Angular CLI** - Build tool y dev server

## 🎨 Características de Diseño

### Tema Corporativo
- ✅ Colores corporativos rojo (#dc2626) y blanco
- ✅ Gradientes personalizados
- ✅ Componentes reutilizables estilizados
- ✅ Diseño responsive y mobile-friendly

### Funcionalidad
- ✅ Interfaz 100% en español
- ✅ Formularios reactivos con validación
- ✅ Servicios HTTP con manejo de errores
- ✅ Loading states y spinners
- ✅ Routing dinámico

### UI/UX
- ✅ Design system con Tailwind CSS
- ✅ Responsive design
- ✅ Loading spinners corporativos
- ✅ Status badges (online, offline, warning)
- ✅ Tarjetas con gradientes y efectos hover
- ✅ Navegación con iconos SVG

### Type Safety
- ✅ TypeScript estricto en todos los archivos
- ✅ Interfaces para System, Metric, Log
- ✅ Servicios tipados con genéricos

## 📡 Servicios Angular

### API Service (src/app/services/api.service.ts)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }
}
  return config
})
```

### Servicios Disponibles

```typescript
// SystemsService
systemsService.getAll(): Observable<System[]>
systemsService.getById(id): Observable<System>
systemsService.create(data): Observable<System>
systemsService.update(id, data): Observable<System>
systemsService.delete(id): Observable<void>

// MetricsService
metricsService.getAll(params): Observable<Metric[]>
metricsService.getLatest(): Observable<Metric[]>
metricsService.create(data): Observable<Metric>

// LogsService
logsService.getAll(params): Observable<Log[]>
logsService.getRecent(): Observable<Log[]>
logsService.create(data): Observable<Log>

// DashboardService
dashboardService.getStats(): Observable<DashboardStats>
```

## 🎨 Componentes Angular

### DashboardComponent
- Tarjetas de estadísticas con gradientes
- Tarjetas clicables por tipo de sistema
- Tabla de sistemas recientes
- Modal para agregar sistemas

### DatabaseListComponent
- Lista de bases de datos
- Filtros y búsqueda
- Estados visuales con badges

### LinuxListComponent / WindowsListComponent
- Listas específicas por tipo
- Información detallada de servidores
- Color-coded por severidad
- Auto-refresh cada 15 segundos

## 🔧 Configuración

### Variables de Entorno

Crea `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

### Desarrollo

```bash
# Instalar dependencias
npm install

# Dev server (con hot reload)
npm start
# → http://localhost:4200

# Build para producción
npm run build

# Watch mode para desarrollo
npm run watch

# Tests
npm run test
```

## 📦 Agregar Nuevos Componentes Angular

### Ejemplo: Generar componente

```bash
# Generar componente
ng generate component components/mi-componente

# Generar servicio
ng generate service services/mi-servicio

# Generar módulo
ng generate module mi-modulo
```

### Ejemplo: Componente TypeScript

```typescript
// src/app/components/metric-card/metric-card.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.css']
})
export class MetricCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle?: string;
  @Input() trend?: 'up' | 'down';
  @Input() trendValue?: string;
}
defineProps<{
  title: string
  value: string | number
  iconClass?: string
}>()
</script>
```

Uso:

```vue
<MetricCard 
  title="CPU Usage" 
  :value="`${cpuUsage}%`"
  iconClass="text-blue-500"
>
  <template #icon>
    <svg>...</svg>
  </template>
</MetricCard>
```

## 🎯 TanStack Query

### Uso en Componentes

```vue
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { dashboardApi } from '@/services/api'

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['dashboard'],
  queryFn: async () => {
    const response = await dashboardApi.getStats()
    return response.data
  },
  refetchInterval: 30000, // Refetch cada 30 segundos
  staleTime: 10000,       // Considerar fresco por 10 segundos
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <h1>Total: {{ data.total_systems }}</h1>
    <button @click="refetch">Refresh</button>
  </div>
</template>
```

## 🎨 Tailwind CSS

### Clases Útiles

```html
<!-- Containers -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

<!-- Cards -->
<div class="bg-white shadow rounded-lg p-6">

<!-- Buttons -->
<button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">

<!-- Status Badges -->
<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  Online
</span>
```

## 🔄 Auto-Refresh

Los componentes se actualizan automáticamente:

```typescript
// Dashboard: cada 30 segundos
refetchInterval: 30000

// Logs: cada 15 segundos
refetchInterval: 15000

// Systems: cada 30 segundos
refetchInterval: 30000
```

## 🐛 Debugging

### Vue DevTools
Instala la extensión de navegador: [Vue DevTools](https://devtools.vuejs.org/)

### Console Logs
```typescript
// Interceptor de Axios para debug
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.data)
    return response
  },
  error => {
    console.error('API Error:', error.response?.data)
    return Promise.reject(error)
  }
)
```

## 📚 Recursos

- [Vue 3 Docs](https://vuejs.org/)
- [TanStack Query](https://tanstack.com/query/latest/docs/vue/overview)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev/)
