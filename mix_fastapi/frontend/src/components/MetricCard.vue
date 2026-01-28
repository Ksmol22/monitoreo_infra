<template>
  <Card class="hover:shadow-lg transition-shadow">
    <template #header>
      <div class="flex items-start justify-between p-6 pb-2">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ title }}</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ value }}</p>
        </div>
        <div class="rounded-lg bg-blue-50 p-3">
          <component :is="icon" class="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </template>
    <template #content>
      <div v-if="subtitle" class="text-xs text-gray-500 pb-2">
        {{ subtitle }}
      </div>
      <div v-if="trend" class="flex items-center text-sm">
        <span :class="trend === 'up' ? 'text-green-600' : 'text-red-600'">
          {{ trendValue }}
        </span>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from "primevue/card";

defineProps<{
  title: string;
  value: string | number;
  icon: any;
  trend?: "up" | "down";
  trendValue?: string;
  subtitle?: string;
  className?: string;
}>();
</script>
