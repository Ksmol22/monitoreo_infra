<template>
  <router-view v-slot="{ Component }">
    <Layout>
      <component :is="Component" />
    </Layout>
  </router-view>
  <Toast />
</template>

<script setup lang="ts">
import Layout from "@/components/Layout.vue";
import Toast from "primevue/toast";
</script>
