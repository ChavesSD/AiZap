import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import ChatView from '../views/ChatView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView
      }
    ]
  },
  {
    path: '/chat',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'chat',
        component: ChatView
      }
    ]
  },
  {
    path: '/connect',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'connect',
        component: () => import('../views/ConnectView.vue')
      }
    ]
  },
  {
    path: '/contacts',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'contacts',
        component: () => import('../views/ContactsView.vue')
      }
    ]
  },
  {
    path: '/bot',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'bot',
        component: () => import('../views/BotView.vue')
      }
    ]
  },
  {
    path: '/reports',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'reports',
        component: () => import('../views/ReportsView.vue')
      }
    ]
  },
  {
    path: '/settings',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'settings',
        component: () => import('../views/SettingsView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Router guard para verificar autenticação
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Se está indo para login, permitir
  if (to.name === 'login') {
    next()
    return
  }
  
  // Verificar se está autenticado
  if (authStore.checkAuth()) {
    next()
  } else {
    next('/login')
  }
})

export default router
