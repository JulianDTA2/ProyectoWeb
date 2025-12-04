import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Importar todas las vistas
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ToolsView from '../views/ToolsView.vue'
import MyLoansView from '../views/MyLoansView.vue'
import UserProfileView from '../views/UserProfileView.vue'
import AdminView from '../views/AdminView.vue'
import NotificationsView from '../views/NotificationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 1. Redirección inteligente: La raíz intenta llevar al dashboard
      // El guardia de navegación se encargará de mandarte al login si no estás autenticado
      path: '/',
      redirect: '/dashboard', 
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      // 2. Meta 'guest': Marca esta ruta solo para invitados (NO logueados)
      meta: { guest: true }, 
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      // 3. Meta 'requiresAuth': Solo para usuarios logueados
      meta: { requiresAuth: true },
    },
    {
      path: '/tools',
      name: 'tools',
      component: ToolsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-loans',
      name: 'my-loans',
      component: MyLoansView,
      meta: { requiresAuth: true },
    },
    {
      path: '/user/:id',
      name: 'user-profile',
      component: UserProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationsView,
      meta: { requiresAuth: true },
    },
    // 4. Catch-all: Cualquier ruta desconocida (ej. /asdf) redirige a la raíz
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// --- GUARDIA DE NAVEGACIÓN GLOBAL ---
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Caso A: La ruta requiere autenticación y el usuario NO está logueado
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // Redirigir al login
    return next({ name: 'login' })
  }

  // Caso B: La ruta es para invitados (Login) y el usuario SÍ está logueado
  // (Evita que veas el login si ya estás dentro, te manda al dashboard)
  if (to.meta.guest && auth.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  // Caso C: Todo en orden, continuar navegación
  next()
})

export default router