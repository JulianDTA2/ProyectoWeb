import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from './../views/HomeView.vue'
import LoginView from './../views/LoginView.vue'
import DashboardView from './../views/DashboardView.vue' 
import ToolsView from './../views/ToolsView.vue'
import MyLoansView from '../views/MyLoansView.vue'
import UserProfileView from '../views/UserProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LoginView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
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
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router