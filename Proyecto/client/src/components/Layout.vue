<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar -->
    <aside class="hidden w-64 overflow-y-auto bg-white shadow-sm lg:block">
      <div class="flex h-full flex-col">
        <div class="flex h-16 items-center px-6 border-b">
          <Activity class="h-6 w-6 text-blue-600 mr-2" />
          <span class="text-xl font-bold text-gray-900">Monitoreo Infra</span>
        </div>
        <nav class="flex-1 space-y-1 px-3 py-4">
          <router-link 
            v-for="item in navigation" 
            :key="item.name"
            :to="item.path"
            class="nav-link group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            :class="isActive(item.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5" />
            {{ item.name }}
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <header class="bg-white shadow-sm lg:hidden">
        <div class="flex h-16 items-center justify-between px-4">
          <Activity class="h-6 w-6 text-blue-600" />
          <span class="text-lg font-bold">Monitoreo Infra</span>
        </div>
      </header>
      
      <main class="flex-1 overflow-y-auto overflow-x-hidden">
        <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { Activity, LayoutDashboard, Database, Server, Monitor, FileText } from "lucide-vue-next";

const route = useRoute();

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Databases", path: "/databases", icon: Database },
  { name: "Windows Servers", path: "/windows", icon: Server },
  { name: "Linux Servers", path: "/linux", icon: Monitor },
  { name: "Logs", path: "/logs", icon: FileText },
];

const isActive = (path: string) => {
  return route.path === path;
};
</script>

<style scoped>
.nav-link {
  @apply transition-all duration-200;
}
</style>
