import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Systems from './views/Systems.vue'
import Logs from './views/Logs.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/systems',
      name: 'systems',
      component: Systems
    },
    {
      path: '/logs',
      name: 'logs',
      component: Logs
    }
  ]
})

export default router
