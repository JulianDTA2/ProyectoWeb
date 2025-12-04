<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { Authorization: `Bearer ${authStore.token}` }
})

// Estado
const contacts = ref<any[]>([])
const messages = ref<any[]>([])
const activeChat = ref<any>(null) // Usuario seleccionado
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// Cargar contactos
const fetchContacts = async () => {
  const res = await api.get('/messages/contacts')
  contacts.value = res.data
}

// Cargar conversación
const selectContact = async (contact: any) => {
  activeChat.value = contact
  const res = await api.get(`/messages/conversation/${contact.id}`)
  messages.value = res.data
  scrollToBottom()
}

// Enviar mensaje
const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeChat.value) return
  
  const content = newMessage.value
  newMessage.value = '' // Limpiar input inmediatamente

  // Optimistic UI: Añadirlo localmente antes de confirmar
  messages.value.push({
    id: Date.now(),
    content,
    senderId: authStore.user?.userId,
    createdAt: new Date()
  })
  scrollToBottom()

  try {
    await api.post('/messages', {
      receiverId: activeChat.value.id,
      content
    })
    // Recargar contactos para actualizar "último mensaje"
    fetchContacts()
  } catch (e) {
    alert('Error al enviar')
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(async () => {
  await fetchContacts()
  
  // Si venimos de "Comprar" con un usuario preseleccionado en la URL
  if (route.query.userId) {
    const targetId = route.query.userId as string
    // Buscamos si ya está en contactos
    let contact = contacts.value.find(c => c.id === targetId)
    
    // Si no está (es chat nuevo), cargamos info básica (necesitaríamos un endpoint de getProfile, o asumimos)
    if (!contact) {
      // Truco: Cargamos el perfil público para obtener el nombre
      try {
        const res = await api.get(`/users/${targetId}`)
        contact = res.data
        contacts.value.unshift(contact) // Lo añadimos temporalmente al inicio
      } catch (e) { console.error(e) }
    }
    
    if (contact) selectContact(contact)
  }
})
</script>

<template>
  <div class="h-[calc(100vh-4rem)] bg-gray-100 p-4 flex gap-4">
    <!-- BARRA LATERAL (CONTACTOS) -->
    <div class="w-1/3 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
      <div class="p-4 border-b bg-gray-50">
        <h2 class="font-bold text-gray-700 text-lg">Mensajes</h2>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div v-if="contacts.length === 0" class="p-4 text-center text-gray-400 text-sm">
          No tienes chats recientes.
        </div>
        <div 
          v-for="contact in contacts" 
          :key="contact.id"
          @click="selectContact(contact)"
          class="p-4 border-b hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3"
          :class="{ 'bg-blue-100': activeChat?.id === contact.id }"
        >
          <div class="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
            {{ contact.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-800 truncate">{{ contact.name }}</h3>
            <p class="text-sm text-gray-500 truncate">{{ contact.lastMessage || 'Haz clic para chatear' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ÁREA DE CHAT -->
    <div class="flex-1 bg-white rounded-xl shadow-md overflow-hidden flex flex-col relative">
      <div v-if="!activeChat" class="flex-1 flex flex-col items-center justify-center text-gray-400">
        <span class="text-6xl mb-4">💬</span>
        <p>Selecciona un contacto para comenzar</p>
      </div>

      <template v-else>
        <!-- Header Chat -->
        <div class="p-4 border-b bg-gray-50 flex items-center gap-3">
          <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
            {{ activeChat.name.charAt(0) }}
          </div>
          <span class="font-bold text-gray-700">{{ activeChat.name }}</span>
        </div>

        <!-- Mensajes -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div 
            v-for="msg in messages" 
            :key="msg.id"
            class="flex"
            :class="msg.senderId === authStore.user?.userId ? 'justify-end' : 'justify-start'"
          >
            <div 
              class="max-w-[70%] p-3 rounded-xl shadow-sm text-sm"
              :class="msg.senderId === authStore.user?.userId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none'"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t bg-white">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input 
              v-model="newMessage" 
              type="text" 
              placeholder="Escribe un mensaje..." 
              class="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" class="bg-blue-600 text-white rounded-full p-2 px-4 hover:bg-blue-700 transition">
              ➤
            </button>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>