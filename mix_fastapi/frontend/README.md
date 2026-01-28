# Frontend Vue 3 - SPA

Frontend moderno con Vue 3, TypeScript y Tailwind CSS.

## 📁 Estructura

```
frontend/src/
├── components/         # Componentes reutilizables (futuro)
├── views/              # Páginas/vistas principales
│   ├── Dashboard.vue   # Dashboard principal
│   ├── Systems.vue     # Lista de sistemas
│   └── Logs.vue        # Vista de logs
├── services/           # Servicios de API
│   └── api.ts          # Cliente Axios + endpoints
├── types/              # TypeScript types
│   └── index.ts        # Interfaces y types
├── router.ts           # Vue Router configuración
├── App.vue             # Componente raíz
├── main.ts             # Entry point
└── style.css           # Estilos globales (Tailwind)
```

## 🚀 Stack Tecnológico

- **Vue 3** - Framework reactivo
- **TypeScript** - Type safety
- **Vue Router** - Routing
- **TanStack Query** - Data fetching y caching
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **Vite** - Build tool y dev server

## 🎯 Características

### Data Fetching
- ✅ TanStack Query para caching inteligente
- ✅ Refetch automático cada 30 segundos
- ✅ Loading states
- ✅ Error handling

### UI/UX
- ✅ Design system con Tailwind CSS
- ✅ Responsive design
- ✅ Loading spinners
- ✅ Status badges (online, offline, warning)
- ✅ Log level indicators (info, warning, error)

### Type Safety
- ✅ TypeScript en todos los archivos
- ✅ Interfaces para System, Metric, Log
- ✅ Type-safe API calls

## 📡 Servicios de API

### API Client (src/services/api.ts)

```typescript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptores para JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Endpoints Disponibles

```typescript
// Systems
systemsApi.getAll()
systemsApi.getById(id)
systemsApi.create(data)
systemsApi.update(id, data)
systemsApi.delete(id)

// Metrics
metricsApi.getAll(params)
metricsApi.getLatest()
metricsApi.create(data)
metricsApi.bulkCreate(data)

// Logs
logsApi.getAll(params)
logsApi.getRecent()
logsApi.create(data)

// Dashboard
dashboardApi.getStats()
```

## 🎨 Componentes

### Dashboard.vue
- Stats cards (total, online, warnings, offline)
- Recent logs table
- Auto-refresh cada 30 segundos

### Systems.vue
- Lista de todos los sistemas
- Filtros por tipo
- Status badges
- Links a detalles

### Logs.vue
- Lista de logs
- Filtros por level
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
npm run dev
# → http://localhost:3000

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 📦 Agregar Nuevos Componentes

### Ejemplo: MetricCard Component

```vue
<!-- src/components/MetricCard.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
      </div>
      <div :class="iconClass">
        <slot name="icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
