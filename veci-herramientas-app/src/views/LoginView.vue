<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// --- ESTADO LOCAL ---
const isRegistering = ref(false) 
const isLoading = ref(false)

// Campos del formulario (compartidos)
const name = ref('')
const email = ref('')
const password = ref('')

// --- MANEJADORES ---
const handleLogin = async () => {
  if (!email.value || !password.value) return

  isLoading.value = true
  const success = await authStore.login({
    email: email.value,
    password: password.value,
  })
  isLoading.value = false

  if (success) {
    router.push({ name: 'dashboard' })
  }
}

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) return

  isLoading.value = true
  const success = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
  })
  isLoading.value = false

  if (success) {
    router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
      <h1 class="mb-6 text-center text-3xl font-bold text-gray-800">
        Veci-Herramientas
      </h1>

      <h2 class="mb-6 text-center text-xl text-gray-600">
        {{ isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión' }}
      </h2>

      <form v-if="!isRegistering" @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="mb-2 block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="tu@correo.com"
          />
        </div>

        <div class="mb-6">
          <label
            for="password"
            class="mb-2 block text-sm font-medium text-gray-700"
            >Contraseña</label
          >
          <input
            type="password"
            id="password"
            v-model="password"
            class="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded-md bg-blue-600 p-3 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :class="{ 'cursor-not-allowed opacity-50': isLoading }"
        >
          {{ isLoading ? 'Cargando...' : 'Entrar' }}
        </button>
      </form>

      <form v-else @submit.prevent="handleRegister">
        <div class="mb-4">
          <label for="name" class="mb-2 block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            id="name"
            v-model="name"
            class="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="Tu Nombre"
          />
        </div>

        <div class="mb-4">
          <label for="email-register" class="mb-2 block text-sm font-medium text-gray-700">Correo</label>
          <input
            type="email"
            id="email-register"
            v-model="email"
            class="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="tu@correo.com"
          />
        </div>

        <div class="mb-6">
          <label
            for="password-register"
            class="mb-2 block text-sm font-medium text-gray-700"
            >Contraseña</label
          >
          <input
            type="password"
            id="password-register"
            v-model="password"
            class="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded-md bg-green-600 p-3 text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          :class="{ 'cursor-not-allowed opacity-50': isLoading }"
        >
          {{ isLoading ? 'Registrando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <div
        v-if="authStore.error"
        class="mt-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700"
      >
        {{ authStore.error }}
      </div>

      <div class="mt-6 text-center">
        <button
          @click="isRegistering = !isRegistering; authStore.error = null; email = ''; password = ''; name = ''"
          class="cursor-pointer text-sm text-blue-600 hover:underline"
        >
          {{ isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate' }}
        </button>
      </div>
    </div>
  </div>
</template>