import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Dashboard",
      component: () => import("./pages/Dashboard.vue"),
    },
    {
      path: "/databases",
      name: "DatabaseList",
      component: () => import("./pages/DatabaseList.vue"),
    },
    {
      path: "/windows",
      name: "WindowsList",
      component: () => import("./pages/WindowsList.vue"),
    },
    {
      path: "/linux",
      name: "LinuxList",
      component: () => import("./pages/LinuxList.vue"),
    },
    {
      path: "/logs",
      name: "Logs",
      component: () => import("./pages/Logs.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("./pages/NotFound.vue"),
    },
  ],
});

export default router;
