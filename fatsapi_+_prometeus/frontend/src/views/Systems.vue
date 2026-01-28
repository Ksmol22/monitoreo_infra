<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900">Sistemas</h2>
      <p class="mt-2 text-sm text-gray-600">Lista de servidores monitoreados</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Systems Table -->
    <div v-else-if="systems" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sistema</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Vez</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="system in systems" :key="system.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ system.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span v-if="system.type === 'linux'">🐧 Linux</span>
              <span v-else-if="system.type === 'windows'">🪟 Windows</span>
              <span v-else>🗄️ Database</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ system.ip_address }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="{
                  'bg-green-100 text-green-800': system.status === 'online',
                  'bg-yellow-100 text-yellow-800': system.status === 'warning',
                  'bg-red-100 text-red-800': system.status === 'offline'
                }"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ system.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(system.last_seen) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { systemsApi } from '@/services/api'
import type { System } from '@/types'

const { data: systems, isLoading } = useQuery<System[]>({
  queryKey: ['systems'],
  queryFn: async () => {
    const response = await systemsApi.getAll()
    return response.data
  },
  refetchInterval: 30000,
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-MX')
}
</script>
