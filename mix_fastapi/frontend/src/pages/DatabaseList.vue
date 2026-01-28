<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">Database Systems</h1>
      <p class="text-gray-500 mt-1">Monitor database performance and health</p>
    </div>

    <Loader v-if="isLoading" />

    <Card v-else>
      <template #content>
        <DataTable :value="databases" :paginator="true" :rows="10" class="p-datatable-sm">
          <Column field="name" header="Name" :sortable="true"></Column>
          <Column field="ipAddress" header="IP Address"></Column>
          <Column field="version" header="Version"></Column>
          <Column field="status" header="Status">
            <template #body="slotProps">
              <StatusBadge :status="slotProps.data.status" />
            </template>
          </Column>
          <Column header="Actions">
            <template #body="slotProps">
              <Button icon="pi pi-eye" text @click="viewDetails(slotProps.data.id)" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useSystems } from "@/composables/useSystems";
import Loader from "@/components/Loader.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";

const router = useRouter();
const { data: systems, isLoading } = useSystems();

const databases = computed(() => 
  systems.value?.filter(s => s.type === 'database') || []
);

const viewDetails = (id: number) => {
  console.log('View details for system', id);
};
</script>
