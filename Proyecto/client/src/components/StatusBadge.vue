<template>
  <span 
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="statusClasses"
  >
    <component :is="statusIcon" class="mr-1 h-3 w-3" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CheckCircle, AlertCircle, XCircle } from "lucide-vue-next";

const props = defineProps<{
  status: "online" | "warning" | "offline";
}>();

const statusConfig = {
  online: {
    label: "Online",
    classes: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  warning: {
    label: "Warning",
    classes: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  offline: {
    label: "Offline",
    classes: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const config = computed(() => statusConfig[props.status]);
const label = computed(() => config.value.label);
const statusClasses = computed(() => config.value.classes);
const statusIcon = computed(() => config.value.icon);
</script>
