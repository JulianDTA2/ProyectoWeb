<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const user = ref<any>(null)
const reviews = ref<any[]>([])
const isLoading = ref(true)

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { Authorization: `Bearer ${authStore.token}` }
})

// Cargar datos
onMounted(async () => {
  const userId = route.params.id as string
  try {
    const userRes = await api.get(`/users/${userId}`)
    user.value = userRes.data

    const reviewsRes = await api.get(`/reviews/user/${userId}`)
    reviews.value = reviewsRes.data
  } catch (e) {
    alert('Error al cargar el perfil')
    router.push({ name: 'dashboard' })
  } finally {
    isLoading.value = false
  }
})

const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div v-if="isLoading" class="text-center text-gray-500">Cargando perfil...</div>
    
    <div v-else class="mx-auto max-w-4xl">
      <button @click="router.back()" class="mb-4 text-blue-600 hover:underline">&larr; Volver</button>

      <div class="mb-6 overflow-hidden rounded-lg bg-white shadow-md">
        <div class="bg-blue-600 p-6 text-white">
          <div class="flex items-center gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-blue-600">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h1 class="text-3xl font-bold">{{ user.name }}</h1>
              <p class="text-blue-100">Miembro desde {{ new Date(user.createdAt).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <div class="flex items-center gap-2 text-xl">
            <span class="font-bold text-gray-800">Reputación:</span>
            <span class="text-yellow-500 text-2xl">★</span>
            <span class="font-bold">{{ averageRating }}</span>
            <span class="text-gray-500 text-sm">({{ reviews.length }} reseñas)</span>
          </div>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <h2 class="mb-4 text-xl font-bold text-gray-800">Lo que dicen sus vecinos</h2>
          <div v-if="reviews.length === 0" class="rounded-lg bg-white p-6 text-gray-500 shadow-sm">
            Aún no tiene reseñas.
          </div>
          <div v-else class="space-y-4">
            <div v-for="review in reviews" :key="review.id" class="rounded-lg bg-white p-4 shadow-sm border-l-4 border-blue-500">
              <div class="flex justify-between items-start">
                <span class="font-bold text-gray-700">{{ review.reviewer?.name || 'Usuario' }}</span>
                <div class="text-yellow-500">
                  {{ '★'.repeat(review.rating) }}<span class="text-gray-300">{{ '★'.repeat(5 - review.rating) }}</span>
                </div>
              </div>
              <p class="mt-2 text-gray-600 italic">"{{ review.comment }}"</p>
              <p class="mt-2 text-xs text-gray-400">{{ new Date(review.createdAt).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 class="mb-4 text-xl font-bold text-gray-800">Sus Herramientas</h2>
          <div v-if="user.tools.length === 0" class="rounded-lg bg-white p-6 text-gray-500 shadow-sm">
            No tiene herramientas publicadas.
          </div>
          <div v-else class="space-y-4">
            <div v-for="tool in user.tools" :key="tool.id" class="rounded-lg bg-white p-4 shadow-sm flex justify-between items-center">
              <div>
                <h3 class="font-bold text-gray-800">{{ tool.name }}</h3>
                <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{{ tool.category }}</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>