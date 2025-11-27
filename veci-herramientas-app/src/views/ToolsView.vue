<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToolsStore } from '@/stores/tools'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const toolsStore = useToolsStore()
const authStore = useAuthStore()
const router = useRouter()

// --- ESTADO DEL FORMULARIO (Crear) ---
const newTool = ref({
  name: '',
  description: '',
  category: 'Carpintería',
})
const isCreating = ref(false)

// --- ESTADO DEL MODAL (Solicitar) ---
const showModal = ref(false)
const selectedTool = ref<any>(null)
const loanDates = ref({
  startDate: '',
  endDate: '',
})
const isRequesting = ref(false)

// --- NUEVO: ESTADO PARA FILTROS ---
const searchQuery = ref('')
const filterCategory = ref('')

// --- NUEVO: COMPUTADA PARA FILTRAR ---
// Esta propiedad mágica se recalcula automáticamente cuando cambian los filtros
const filteredTools = computed(() => {
  return toolsStore.tools.filter(tool => {
    // 1. Filtro por texto (Nombre o Descripción) - Insensible a mayúsculas/minúsculas
    const query = searchQuery.value.toLowerCase()
    const matchesName = tool.name.toLowerCase().includes(query) || 
                        (tool.description && tool.description.toLowerCase().includes(query))
    
    // 2. Filtro por Categoría (si hay alguna seleccionada)
    const matchesCategory = filterCategory.value ? tool.category === filterCategory.value : true

    return matchesName && matchesCategory
  })
})

// --- ACCIONES ---
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
    <div class="mx-auto max-w-5xl">
      <button
        @click="router.push({ name: 'dashboard' })"
        class="mb-6 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        <span class="mr-1">&larr;</span> Volver al Dashboard
      </button>

      <h1 class="mb-8 text-4xl font-extrabold text-gray-800 tracking-tight">Catálogo de Herramientas</h1>

      <!-- 
      ===============================================
      == FORMULARIO DE NUEVA HERRAMIENTA ==
      ===============================================
      -->
      <form
        @submit.prevent="handleSubmitTool"
        class="mb-10 rounded-xl bg-white p-6 shadow-lg border-t-4 border-blue-500"
      >
        <h2 class="mb-6 text-2xl font-bold text-gray-700 flex items-center gap-2">
          Prestar una Herramienta
        </h2>

        <!-- Feedback -->
        <div
          v-if="toolsStore.error && isCreating"
          class="mb-4 rounded-lg bg-red-50 p-4 text-center text-sm font-medium text-red-700 border border-red-200"
        >
          {{ toolsStore.error }}
        </div>
         <div
          v-if="toolsStore.successMessage && isCreating"
          class="mb-4 rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-700 border border-green-200"
        >
          {{ toolsStore.successMessage }}
        </div>

        <div class="grid gap-6 md:grid-cols-2 mb-4">
          <div>
            <label for="name" class="mb-2 block text-sm font-semibold text-gray-600">Nombre del objeto</label>
            <input
              type="text"
              v-model="newTool.name"
              class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="Ej. Taladro Percutor Bosch"
              required
            />
          </div>

          <div>
            <label for="category" class="mb-2 block text-sm font-semibold text-gray-600">Categoría</label>
            <select v-model="newTool.category" class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all cursor-pointer">
              <option>Carpintería</option>
              <option>Jardinería</option>
              <option>Cocina</option>
              <option>Camping</option>
              <option>Electrónica</option>
              <option>Otro</option>
            </select>
          </div>
        </div>

        <div class="mb-6">
          <label for="description" class="mb-2 block text-sm font-semibold text-gray-600">Descripción</label>
          <textarea
            v-model="newTool.description"
            class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="Ej. Funciona perfectamente, incluye maletín y set de brocas para madera."
            rows="2"
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="isCreating"
          class="w-full md:w-auto md:px-8 rounded-lg bg-blue-600 py-3 text-white font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95 transition-all"
          :class="{ 'opacity-70 cursor-wait': isCreating }"
        >
          {{ isCreating ? 'Publicando...' : 'Publicar Herramienta' }}
        </button>
      </form>

      <!-- 
      ===============================================
      == BARRA DE BÚSQUEDA Y FILTROS (NUEVO) ==
      ===============================================
      -->
      <div class="mb-6 flex flex-col gap-4 md:flex-row sticky top-4 z-10">
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></span>
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Buscar herramienta por nombre o descripción..."
            class="w-full rounded-xl border border-gray-300 bg-white pl-10 p-4 shadow-md focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-shadow"
          />
        </div>
        <div class="w-full md:w-1/4">
          <select 
            v-model="filterCategory" 
            class="w-full h-full rounded-xl border border-gray-300 bg-white p-4 shadow-md focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="">Todas las Categorías</option>
            <option>Carpintería</option>
            <option>Jardinería</option>
            <option>Cocina</option>
            <option>Camping</option>
            <option>Electrónica</option>
            <option>Otro</option>
          </select>
        </div>
      </div>

      <!-- 
      ============================
      LISTA DEL CATÁLOGO
      ============================
      -->
      <div class="rounded-xl bg-white p-8 shadow-lg min-h-[300px]">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Herramientas Disponibles
          </h2>
          <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {{ filteredTools.length }} resultados
          </span>
        </div>

        <!-- Estado de carga -->
        <p v-if="!toolsStore.tools.length && !filteredTools.length" class="text-gray-500 text-center py-12 text-lg animate-pulse">
          Cargando herramientas del vecindario...
        </p>

        <!-- Estado vacío por filtro -->
        <div v-else-if="filteredTools.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🤷‍♂️</div>
          <p class="text-gray-600 text-lg">No encontramos herramientas que coincidan con tu búsqueda.</p>
          <button 
            @click="searchQuery = ''; filterCategory = ''" 
            class="mt-4 text-blue-600 font-semibold hover:underline"
          >
            Limpiar filtros y ver todo
          </button>
        </div>

        <!-- Lista de tarjetas -->
        <div v-else class="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          <div
            v-for="tool in filteredTools"
            :key="tool.id"
            class="group relative rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white"
          >
            <div class="flex flex-col md:flex-row justify-between items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{{ tool.name }}</h3>
                  <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                    {{ tool.category }}
                  </span>
                </div>
                <p class="text-gray-600 leading-relaxed">{{ tool.description }}</p>
              </div>

              <div class="flex flex-col items-end gap-3 min-w-[140px]">
                <!-- Acciones -->
                <button
                  v-if="authStore.user?.userId !== tool.ownerId"
                  @click="openRequestModal(tool)"
                  class="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-green-700 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Solicitar
                </button>
                <span
                  v-else
                  class="w-full text-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 cursor-default select-none"
                >
                  Es tuya
                </span>
              </div>
            </div>
            
            <!-- Footer de la tarjeta -->
            <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span class="text-gray-500 flex items-center gap-1">
                Dueño: 
                <RouterLink 
                  v-if="tool.owner"
                  :to="{ name: 'user-profile', params: { id: tool.owner.id } }"
                  class="font-bold text-gray-700 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                >
                  {{ tool.owner.name }}
                </RouterLink>
                <span v-else>...</span>
              </span>
              <span class="text-gray-400 text-xs">ID: {{ tool.id.slice(0, 8) }}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 
  ============================
  MODAL DE SOLICITUD
  ============================
  -->
  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
  >
    <div class="w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all scale-100">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          Solicitar Préstamo
        </h2>
        <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>

      <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p class="text-sm text-blue-800 font-medium">Herramienta:</p>
        <p class="text-lg font-bold text-blue-900">{{ selectedTool?.name }}</p>
      </div>

      <div
        v-if="toolsStore.error"
        class="mb-6 rounded-lg bg-red-50 p-4 text-center text-sm font-medium text-red-700 border border-red-200"
      >
        {{ toolsStore.error }}
      </div>
      <div
        v-if="toolsStore.successMessage"
        class="mb-6 rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-700 border border-green-200"
      >
        {{ toolsStore.successMessage }}
      </div>
      
      <form @submit.prevent="handleRequestLoan">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="mb-2 block text-sm font-bold text-gray-700">Desde</label>
            <input
              type="date"
              v-model="loanDates.startDate"
              class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              required
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-bold text-gray-700">Hasta</label>
            <input
              type="date"
              v-model="loanDates.endDate"
              class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              required
            />
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="showModal = false"
            class="rounded-lg bg-gray-100 px-5 py-3 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isRequesting"
            class="rounded-lg bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
            :class="{'opacity-70 cursor-wait': isRequesting}"
          >
            {{ isRequesting ? 'Enviando...' : 'Confirmar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>