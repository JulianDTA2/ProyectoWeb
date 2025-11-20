<!-- src/views/DashboardView.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'
const authStore = useAuthStore()
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold">Dashboard</h1>
    <p class="mt-4">¡Has iniciado sesión con éxito!</p>

    <RouterLink
      to="/tools"
      class="mt-6 inline-block rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
    >
      Ver Catálogo de Herramientas
    </RouterLink>

    <br />

    <button
      @click="authStore.logout"
      class="mt-6 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
    >
      Cerrar Sesión
    </button>
  </div>
</template>