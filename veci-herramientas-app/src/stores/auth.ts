import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

// Definimos la interfaz del Usuario con el nuevo campo 'role'
interface User {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin'; // <-- Nuevo campo importante
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null as User | null,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin', // Helper para verificar si es admin
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      this.error = null
      try {
        const response = await api.post('/auth/login', credentials)
        const { access_token } = response.data
        this.token = access_token
        localStorage.setItem('token', access_token)
        // Cargar perfil inmediatamente para tener el rol
        await this.fetchProfile()
        return true
      } catch (e: any) {
        this.error = e.response?.data?.message || 'Error al iniciar sesión'
        return false
      }
    },

    async register(data: { name: string; email: string; password: string }) {
      this.error = null
      try {
        await api.post('/users/register', data)
        await this.login({ email: data.email, password: data.password })
        return true
      } catch (e: any) {
        this.error = e.response?.data?.message || 'Error al registrarse'
        return false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },

    async fetchProfile() {
      if (!this.token) return

      try {
        const response = await api.get<User>('/profile', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        this.user = response.data
      } catch (e) {
        this.logout()
      }
    },
  },
})