<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">System Logs</h1>
        <p class="text-gray-500 mt-1">View and filter system logs</p>
      </div>
      <Select v-model="selectedLevel" :options="levels" placeholder="Filter by level" class="w-48" />
    </div>

    <Loader v-if="isLoading" />

    <Card v-else>
      <template #content>
        <DataTable :value="logs" :paginator="true" :rows="20" class="p-datatable-sm">
          <Column field="timestamp" header="Timestamp" :sortable="true">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.timestamp) }}
            </template>
          </Column>
          <Column field="level" header="Level">
            <template #body="slotProps">
              <span 
                class="px-2 py-1 text-xs font-semibold rounded"
                :class="getLevelClass(slotProps.data.level)"
              >
                {{ slotProps.data.level }}
              </span>
            </template>
          </Column>
          <Column field="message" header="Message"></Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useLogs } from "@/composables/useLogs";
import Loader from "@/components/Loader.vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Select from "primevue/select";
import { format } from "date-fns";

const selectedLevel = ref<string | null>(null);
const levels = ["info", "warning", "error", "critical"];

const { data: logs, isLoading } = useLogs(undefined, selectedLevel.value || undefined);

const formatDate = (date: Date) => {
  return format(new Date(date), "MMM dd, yyyy HH:mm:ss");
};

const getLevelClass = (level: string) => {
  const classes: Record<string, string> = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    critical: "bg-purple-100 text-purple-800",
  };
  return classes[level] || "bg-gray-100 text-gray-800";
};
</script>
