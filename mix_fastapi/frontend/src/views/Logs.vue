<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900">Logs</h2>
      <p class="mt-2 text-sm text-gray-600">Registro de eventos del sistema</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Logs List -->
    <div v-else-if="logs" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul class="divide-y divide-gray-200">
        <li v-for="log in logs" :key="log.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <span 
                :class="{
                  'bg-red-100 text-red-800': log.level === 'error' || log.level === 'critical',
                  'bg-yellow-100 text-yellow-800': log.level === 'warning',
                  'bg-blue-100 text-blue-800': log.level === 'info'
                }"
                class="px-2 py-1 text-xs font-semibold rounded"
              >
                {{ log.level.toUpperCase() }}
              </span>
              <span class="ml-3 text-sm text-gray-900">{{ log.message }}</span>
            </div>
            <span class="text-sm text-gray-500">{{ formatDate(log.timestamp) }}</span>
          </div>
          <div class="text-sm text-gray-500">
            {{ log.system_name }} <span v-if="log.source">- {{ log.source }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { logsApi } from '@/services/api'
import type { Log } from '@/types'

const { data: logs, isLoading } = useQuery<Log[]>({
  queryKey: ['logs'],
  queryFn: async () => {
    const response = await logsApi.getAll()
    return response.data
  },
  refetchInterval: 15000,
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-MX')
}
</script>
