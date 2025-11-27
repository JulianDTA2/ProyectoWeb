<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToolsStore } from '@/stores/tools'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const toolsStore = useToolsStore()
const authStore = useAuthStore()
const router = useRouter()

const newTool = ref({
  name: '',
  description: '',
  category: 'Carpintería',
})
const isCreating = ref(false)

const showModal = ref(false)
const selectedTool = ref<any>(null)
const loanDates = ref({
  startDate: '',
  endDate: '',
})
const isRequesting = ref(false)

onMounted(() => {
  toolsStore.fetchTools()
})

const handleSubmitTool = async () => {
  if (!newTool.value.name || !newTool.value.category) return
  isCreating.value = true
  const success = await toolsStore.createTool(newTool.value)
  if (success) {
    newTool.value = { name: '', description: '', category: 'Carpintería' }
  }
  isCreating.value = false
}

const openRequestModal = (tool: any) => {
  selectedTool.value = tool
  loanDates.value = { startDate: '', endDate: '' }
  toolsStore.error = null
  toolsStore.successMessage = null
  showModal.value = true
}

const handleRequestLoan = async () => {
  if (!loanDates.value.startDate || !loanDates.value.endDate) {
    toolsStore.error = 'Debes seleccionar ambas fechas.'
    return
  }
  isRequesting.value = true
  const success = await toolsStore.requestLoan({
    toolId: selectedTool.value.id,
    startDate: loanDates.value.startDate,
    endDate: loanDates.value.endDate,
  })
  if (success) {
    setTimeout(() => {
      showModal.value = false
    }, 2000)
  }
  isRequesting.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-4xl">
      <button @click="router.push({ name: 'dashboard' })" class="mb-4 text-sm text-blue-600 hover:underline">
        &larr; Volver al Dashboard
      </button>

      <h1 class="mb-6 text-3xl font-bold">Catálogo de Herramientas</h1>

      <form @submit.prevent="handleSubmitTool" class="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 class="mb-4 text-2xl font-semibold">Prestar una Herramienta</h2>

        <div v-if="toolsStore.error && isCreating"
          class="mb-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700">
          {{ toolsStore.error }}
        </div>
        <div v-if="toolsStore.successMessage && isCreating"
          class="mb-4 rounded-md bg-green-100 p-3 text-center text-sm text-green-700">
          {{ toolsStore.successMessage }}
        </div>

        <div class="mb-4">
          <label for="name" class="mb-2 block font-medium">Nombre</label>
          <input type="text" v-model="newTool.name" class="w-full rounded-md border p-3"
            placeholder="Ej. Taladro Percutor" required />
        </div>

        <div class="mb-4">
          <label for="category" class="mb-2 block font-medium">Categoría</label>
          <select v-model="newTool.category" class="w-full rounded-md border p-3">
            <option>Carpintería</option>
            <option>Jardinería</option>
            <option>Cocina</option>
            <option>Camping</option>
            <option>Otro</option>
          </select>
        </div>

        <div class="mb-4">
          <label for="description" class="mb-2 block font-medium">Descripción</label>
          <textarea v-model="newTool.description" class="w-full rounded-md border p-3"
            placeholder="Ej. Poco uso, viene con set de brocas."></textarea>
        </div>

        <button type="submit" :disabled="isCreating"
          class="w-full rounded-md bg-blue-600 p-3 text-white transition hover:bg-blue-700"
          :class="{ 'opacity-50': isCreating }">
          {{ isCreating ? 'Guardando...' : 'Añadir al catálogo' }}
        </button>
      </form>
      <div class="rounded-lg bg-white p-6 shadow-md">
        <h2 class="mb-4 text-2xl font-semibold">Herramientas Disponibles</h2>

        <p v-if="!toolsStore.tools.length" class="text-gray-500">
          Cargando...
        </p>

        <div v-else class="space-y-4">
          <div v-for="tool in toolsStore.tools" :key="tool.id" class="rounded-md border p-4">
            <h3 class="text-xl font-bold">{{ tool.name }}</h3>
            <p class="text-gray-700">{{ tool.description }}</p>
            <div class="mt-2 flex items-center justify-between text-sm">
              <span class="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                {{ tool.category }}
              </span>
              <span class="text-gray-500">
                Dueño: <RouterLink v-if="tool.owner" :to="{ name: 'user-profile', params: { id: tool.owner.id } }"
                  class="font-bold hover:text-blue-600 hover:underline cursor-pointer">
                  {{ tool.owner.name }}
                </RouterLink>
                <span v-else>...</span>
              </span>

              <button v-if="authStore.user?.userId !== tool.ownerId" @click="openRequestModal(tool)"
                class="rounded-md bg-green-500 px-3 py-1 text-white transition hover:bg-green-600">
                Solicitar
              </button>
              <span v-else class="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                Es tuya
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h2 class="mb-4 text-2xl font-bold">
        Solicitar: {{ selectedTool?.name }}
      </h2>

      <div v-if="toolsStore.error" class="mb-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700">
        {{ toolsStore.error }}
      </div>
      <div v-if="toolsStore.successMessage" class="mb-4 rounded-md bg-green-100 p-3 text-center text-sm text-green-700">
        {{ toolsStore.successMessage }}
      </div>

      <form @submit.prevent="handleRequestLoan">
        <div class="mb-4">
          <label class="mb-2 block font-medium">Desde:</label>
          <input type="date" v-model="loanDates.startDate" class="w-full rounded-md border p-3" required />
        </div>
        <div class="mb-4">
          <label class="mb-2 block font-medium">Hasta:</label>
          <input type="date" v-model="loanDates.endDate" class="w-full rounded-md border p-3" required />
        </div>

        <div class="mt-6 flex justify-end gap-4">
          <button type="button" @click="showModal = false"
            class="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" :disabled="isRequesting"
            class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" :class="{ 'opacity-50': isRequesting }">
            {{ isRequesting ? 'Enviando...' : 'Confirmar Solicitud' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>