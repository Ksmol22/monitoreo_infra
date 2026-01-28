<template>
  <div class="flex flex-col items-center justify-center min-h-[600px] text-center">
    <div class="rounded-full bg-gray-100 p-6 mb-4">
      <FileQuestion class="h-24 w-24 text-gray-400" />
    </div>
    <h1 class="text-4xl font-bold text-gray-900 mb-2">404</h1>
    <p class="text-xl text-gray-600 mb-8">Page not found</p>
    <Button label="Go to Dashboard" @click="router.push('/')" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { FileQuestion } from "lucide-vue-next";
import Button from "primevue/button";

const router = useRouter();
</script>
