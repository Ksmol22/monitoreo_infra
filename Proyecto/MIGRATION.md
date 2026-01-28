# Guía de Migración: React → Vue.js 3

## 📋 Resumen de Cambios

Este proyecto ha sido completamente migrado de **React** a **Vue.js 3**, eliminando también todas las dependencias y referencias a Replit.

## 🔄 Cambios Principales

### 1. Dependencias Reemplazadas

#### Removidas (React):
- ❌ `react`
- ❌ `react-dom`
- ❌ `react-router-dom` / `wouter`
- ❌ `@tanstack/react-query`
- ❌ `react-hook-form`
- ❌ `react-i18next`
- ❌ `@radix-ui/*` (todos los componentes)
- ❌ `lucide-react`
- ❌ `recharts`
- ❌ `framer-motion`
- ❌ Plugins de Replit

#### Agregadas (Vue):
- ✅ `vue@^3.5.13`
- ✅ `vue-router@^4.5.0`
- ✅ `@tanstack/vue-query@^5.60.5`
- ✅ `pinia@^2.2.8`
- ✅ `primevue@^4.2.2`
- ✅ `lucide-vue-next@^0.453.0`
- ✅ `@vueuse/core@^11.0.3`
- ✅ `@vitejs/plugin-vue@^5.2.1`

### 2. Archivos Convertidos

#### Estructura de Componentes
```
React (.tsx)           →  Vue (.vue)
────────────────────────────────────
App.tsx               →  App.vue
Layout.tsx            →  Layout.vue
Dashboard.tsx         →  Dashboard.vue
DatabaseList.tsx      →  DatabaseList.vue
WindowsList.tsx       →  WindowsList.vue
LinuxList.tsx         →  LinuxList.vue
Logs.tsx              →  Logs.vue
NotFound.tsx          →  NotFound.vue
MetricCard.tsx        →  MetricCard.vue
StatusBadge.tsx       →  StatusBadge.vue
Loader.tsx            →  Loader.vue
```

#### Hooks → Composables
```
hooks/               →  composables/
────────────────────────────────────
use-systems.ts       →  useSystems.ts
use-metrics.ts       →  useMetrics.ts
use-logs.ts          →  useLogs.ts
use-toast.ts         →  (PrimeVue Toast)
```

### 3. Sintaxis: React vs Vue

#### Componentes

**React:**
```tsx
export default function Dashboard() {
  const { data, isLoading } = useSystems();
  
  if (isLoading) return <Loader />;
  
  return (
    <div className="space-y-8">
      <h1>{data.title}</h1>
    </div>
  );
}
```

**Vue:**
```vue
<template>
  <div class="space-y-8">
    <Loader v-if="isLoading" />
    <h1 v-else>{{ data.title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { useSystems } from "@/composables/useSystems";

const { data, isLoading } = useSystems();
</script>
```

#### Composables

**React Hook:**
```typescript
import { useQuery } from "@tanstack/react-query";

export function useSystems() {
  return useQuery({
    queryKey: ["systems"],
    queryFn: fetchSystems,
  });
}
```

**Vue Composable:**
```typescript
import { useQuery } from "@tanstack/vue-query";

export function useSystems() {
  return useQuery({
    queryKey: ["systems"],
    queryFn: fetchSystems,
  });
}
```

#### Routing

**React (Wouter):**
```tsx
<Switch>
  <Route path="/" component={Dashboard} />
  <Route path="/databases" component={DatabaseList} />
</Switch>
```

**Vue Router:**
```vue
<router-view v-slot="{ Component }">
  <component :is="Component" />
</router-view>
```

### 4. Componentes UI

#### Antes (Radix UI + React)
```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    Content
  </DialogContent>
</Dialog>
```

#### Después (PrimeVue)
```vue
<Dialog v-model:visible="showDialog" header="Title">
  Content
</Dialog>
```

### 5. Configuración

#### vite.config.ts
```typescript
// Antes
import react from "@vitejs/plugin-react";
plugins: [react()]

// Después
import vue from "@vitejs/plugin-vue";
plugins: [vue()]
```

#### main.ts
```typescript
// Antes (React)
import { createRoot } from "react-dom/client";
import App from "./App";
createRoot(document.getElementById("root")!).render(<App />);

// Después (Vue)
import { createApp } from "vue";
import App from "./App.vue";
createApp(App).mount("#root");
```

## 🎯 Ventajas de la Migración

1. **Menos Código**: Vue es más conciso
2. **Mejor TypeScript**: Soporte nativo mejorado
3. **PrimeVue**: Componentes empresariales robustos
4. **Sin Replit**: Sin dependencias externas innecesarias
5. **Rendimiento**: Vue 3 Composition API es muy eficiente

## ⚠️ Notas Importantes

### Pendientes
- [ ] Implementar formulario AddSystemDialog completo
- [ ] Agregar gráficos (alternativa a Recharts)
- [ ] Configurar i18n con vue-i18n
- [ ] Implementar tema oscuro con VueUse

### Componentes UI Faltantes
Algunos componentes de Radix UI necesitan equivalentes en PrimeVue:
- Accordion → Accordion (PrimeVue)
- Tabs → TabView (PrimeVue)
- Select → Dropdown (PrimeVue)
- Checkbox → Checkbox (PrimeVue)

## 🚀 Próximos Pasos

1. **Probar la aplicación**: `npm run dev`
2. **Completar componentes faltantes**
3. **Implementar seguridad** (Helmet, CORS, Rate Limiting)
4. **Agregar tests** (Vitest + Vue Test Utils)
5. **Configurar CI/CD**

## 📚 Recursos

- [Vue 3 Docs](https://vuejs.org/)
- [PrimeVue Docs](https://primevue.org/)
- [Vue Router](https://router.vuejs.org/)
- [TanStack Query Vue](https://tanstack.com/query/latest/docs/vue/overview)
- [VueUse](https://vueuse.org/)

## 🆘 Problemas Comunes

### Error: "Cannot find module .vue"
Asegúrate de tener `env.d.ts` con las declaraciones de tipos.

### Error: Vite peer dependencies
Instala con: `npm install --legacy-peer-deps`

### Error: PrimeVue styles
Importa el tema en `main.ts`:
```typescript
import "primevue/resources/themes/aura-light-blue/theme.css";
```
