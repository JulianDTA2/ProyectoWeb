<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { RouterLink, useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-5xl">
      <!-- Bienvenida -->
      <div class="mb-8 rounded-xl bg-white p-8 shadow-lg border-l-8 border-blue-600">
        <h1 class="text-3xl font-bold text-gray-800">
          Hola, {{ authStore.user?.name || 'Vecino' }} 
        </h1>
        <p class="mt-2 text-gray-600 text-lg">Bienvenido a Veci-Herramientas. ¿Qué quieres hacer hoy?</p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        
        <RouterLink
          to="/tools"
          class="group flex flex-col items-center justify-center rounded-xl bg-white p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-transparent hover:border-blue-100"
        >
          <h2 class="text-xl font-bold text-gray-800 group-hover:text-blue-600">Catálogo</h2>
          <p class="mt-2 text-center text-sm text-gray-500">Busca herramientas o publica las tuyas para prestar.</p>
        </RouterLink>

        <RouterLink
          to="/my-loans"
          class="group flex flex-col items-center justify-center rounded-xl bg-white p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-transparent hover:border-purple-100"
        >
          <h2 class="text-xl font-bold text-gray-800 group-hover:text-purple-600">Mis Préstamos</h2>
          <p class="mt-2 text-center text-sm text-gray-500">Gestiona tus solicitudes enviadas y recibidas.</p>
        </RouterLink>

        <RouterLink
          v-if="authStore.user"
          :to="{ name: 'user-profile', params: { id: authStore.user.userId } }"
          class="group flex flex-col items-center justify-center rounded-xl bg-white p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-transparent hover:border-yellow-100"
        >
          <h2 class="text-xl font-bold text-gray-800 group-hover:text-yellow-600">Mi Perfil</h2>
          <p class="mt-2 text-center text-sm text-gray-500">Consulta tu reputación pública y tus herramientas.</p>
        </RouterLink>
      </div>

      <div class="mt-12 text-center">
        <button
          @click="handleLogout"
          class="rounded-lg bg-white px-6 py-2 text-red-600 shadow-sm hover:bg-red-50 hover:shadow font-medium transition-all border border-red-100"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
</template>