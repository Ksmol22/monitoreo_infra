<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p class="text-gray-500 mt-1">Infrastructure monitoring overview</p>
      </div>
      <Button icon="pi pi-plus" label="Add System" @click="showAddDialog = true" />
    </div>

    <!-- Loader -->
    <Loader v-if="isLoading" />

    <!-- Dashboard Content -->
    <template v-else>
      <!-- Top Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Health Score" 
          :value="`${healthScore}%`" 
          :icon="Activity"
          trend="up"
          trendValue="2.5%"
          subtitle="Aggregate uptime score"
        />
        <MetricCard 
          title="Active Systems" 
          :value="online" 
          :icon="CheckCircle"
          :subtitle="`${total} total nodes monitored`"
        />
        <MetricCard 
          title="Warnings" 
          :value="warnings" 
          :icon="AlertCircle"
          subtitle="Requires attention"
        />
        <MetricCard 
          title="Critical Alerts" 
          :value="offline" 
          :icon="Clock"
          subtitle="Services down"
        />
      </div>

      <!-- System Types Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <template #header>
            <div class="p-6 pb-2">
              <h3 class="text-lg font-semibold flex items-center">
                <Database class="mr-2 h-5 w-5" />
                Databases
              </h3>
            </div>
          </template>
          <template #content>
            <p class="text-3xl font-bold">{{ dbCount }}</p>
            <p class="text-sm text-gray-500">Active database nodes</p>
          </template>
        </Card>

        <Card>
          <template #header>
            <div class="p-6 pb-2">
              <h3 class="text-lg font-semibold flex items-center">
                <Server class="mr-2 h-5 w-5" />
                Windows Servers
              </h3>
            </div>
          </template>
          <template #content>
            <p class="text-3xl font-bold">{{ winCount }}</p>
            <p class="text-sm text-gray-500">Active Windows servers</p>
          </template>
        </Card>

        <Card>
          <template #header>
            <div class="p-6 pb-2">
              <h3 class="text-lg font-semibold flex items-center">
                <Monitor class="mr-2 h-5 w-5" />
                Linux Servers
              </h3>
            </div>
          </template>
          <template #content>
            <p class="text-3xl font-bold">{{ linCount }}</p>
            <p class="text-sm text-gray-500">Active Linux servers</p>
          </template>
        </Card>
      </div>

      <!-- Recent Systems -->
      <Card>
        <template #header>
          <div class="p-6 pb-2">
            <h3 class="text-lg font-semibold">Recent Systems</h3>
          </div>
        </template>
        <template #content>
          <DataTable :value="recentSystems" class="p-datatable-sm">
            <Column field="name" header="Name"></Column>
            <Column field="type" header="Type">
              <template #body="slotProps">
                <span class="capitalize">{{ slotProps.data.type }}</span>
              </template>
            </Column>
            <Column field="ipAddress" header="IP Address"></Column>
            <Column field="status" header="Status">
              <template #body="slotProps">
                <StatusBadge :status="slotProps.data.status" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </template>

    <!-- Add System Dialog -->
    <Dialog v-model:visible="showAddDialog" header="Add New System" :modal="true" class="w-full max-w-md">
      <AddSystemForm @success="showAddDialog = false" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useSystems } from "@/composables/useSystems";
import MetricCard from "@/components/MetricCard.vue";
import Loader from "@/components/Loader.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import { Activity, Database, Server, Monitor, AlertCircle, CheckCircle, Clock } from "lucide-vue-next";
import Card from "primevue/card";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const { data: systems, isLoading } = useSystems();
const showAddDialog = ref(false);

const total = computed(() => systems.value?.length || 0);
const online = computed(() => systems.value?.filter(s => s.status === 'online').length || 0);
const warnings = computed(() => systems.value?.filter(s => s.status === 'warning').length || 0);
const offline = computed(() => systems.value?.filter(s => s.status === 'offline').length || 0);

const dbCount = computed(() => systems.value?.filter(s => s.type === 'database').length || 0);
const winCount = computed(() => systems.value?.filter(s => s.type === 'windows').length || 0);
const linCount = computed(() => systems.value?.filter(s => s.type === 'linux').length || 0);

const healthScore = computed(() => Math.round((online.value / total.value) * 100) || 0);

const recentSystems = computed(() => systems.value?.slice(0, 5) || []);

// Placeholder for AddSystemForm component
const AddSystemForm = { template: '<div>Form goes here</div>' };
</script>
