<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="true"
      permanent
      class="sidebar"
    >
      <div class="sidebar-content">
        <!-- Logo -->
        <div class="logo-container">
          <v-img
            src="/favicon.png"
            alt="AiZap Logo"
            max-height="32"
            contain
            class="logo"
          />
        </div>

        <!-- Navigation Items -->
        <div class="nav-items">
          <div
            v-for="item in menuItems"
            :key="item.title"
            :class="['nav-item', { 'active': currentRoute === item.value }]"
            @click="handleNavigation(item)"
          >
            <v-icon :icon="item.icon" class="nav-icon" />
          </div>
        </div>

        <!-- User Info -->
        <div class="user-section">
          <div class="logout-container">
            <v-btn
              icon="mdi-logout"
              variant="text"
              size="large"
              @click="handleLogout"
              class="logout-btn"
            >
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar
      :elevation="0"
      class="app-bar"
    >
      <v-toolbar-title class="app-title">
        {{ currentPageTitle }}
      </v-toolbar-title>
      
      <v-spacer />
      
      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-account-circle"
            v-bind="props"
            class="user-menu-btn"
          />
        </template>
        <v-list>
          <v-list-item
            prepend-icon="mdi-account"
            title="Perfil"
            @click="goToProfile"
          />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sair"
            @click="handleLogout"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-content">
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MainLayout',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    
    const drawer = ref(true)
    
    const user = computed(() => authStore.user || {})
    const userAvatar = computed(() => `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value.name || 'U')}&background=0c1b23&color=fff`)
    
    const currentRoute = computed(() => route.name)
    
    const currentPageTitle = computed(() => {
      const titles = {
        'dashboard': 'Dashboard',
        'connect': 'Conectar',
        'contacts': 'Contatos',
        'chat': 'Chat',
        'bot': 'Bot',
        'reports': 'Relatórios',
        'settings': 'Configurações'
      }
      return titles[route.name] || 'AiZap'
    })
    
    const allMenuItems = [
      {
        title: 'Dashboard',
        icon: 'mdi-view-dashboard',
        value: 'dashboard',
        to: '/dashboard'
      },
      {
        title: 'Conectar',
        icon: 'mdi-link-variant',
        value: 'connect',
        to: '/connect'
      },
      {
        title: 'Contatos',
        icon: 'mdi-account-group',
        value: 'contacts',
        to: '/contacts'
      },
      {
        title: 'Chat',
        icon: 'mdi-chat',
        value: 'chat',
        to: '/chat'
      },
      {
        title: 'Bot',
        icon: 'mdi-robot',
        value: 'bot',
        to: '/bot'
      },
      {
        title: 'Relatórios',
        icon: 'mdi-chart-line',
        value: 'reports',
        to: '/reports'
      },
      {
        title: 'Configurações',
        icon: 'mdi-cog',
        value: 'settings',
        to: '/settings'
      }
    ]
    
    // Filter menu items based on user's menuAccess
    const menuItems = computed(() => {
      console.log('🔍 Usuário atual:', user.value)
      console.log('🔍 MenuAccess:', user.value?.menuAccess)
      console.log('🔍 Role:', user.value?.role)
      
      if (!user.value || !user.value.menuAccess || user.value.role === 'admin') {
        console.log('🔍 Retornando todos os itens (admin ou sem menuAccess)')
        return allMenuItems
      }
      
      const filteredItems = allMenuItems.filter(item => 
        user.value.menuAccess.includes(item.value)
      )
      console.log('🔍 Itens filtrados:', filteredItems)
      return filteredItems
    })
    
    const handleNavigation = (item) => {
      if (item.to) {
        router.push(item.to)
      }
    }
    
    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }
    
    const goToProfile = () => {
      router.push('/profile')
    }
    
    onMounted(() => {
      // Inicializar dados do usuário se necessário
      authStore.checkAuth()
    })
    
    return {
      drawer,
      user,
      userAvatar,
      currentRoute,
      currentPageTitle,
      menuItems,
      handleNavigation,
      handleLogout,
      goToProfile
    }
  }
}
</script>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #0c1b23 0%, #1a2f3f 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo-container {
  padding: 16px 8px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  filter: brightness(0) invert(1);
}

.nav-items {
  padding: 8px 4px;
  flex: 1;
}

.nav-item {
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-height: 48px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-icon {
  color: white !important;
  font-size: 24px !important;
  display: block !important;
}

.user-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  margin-top: auto;
}

.logout-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.logout-btn {
  color: rgba(255, 255, 255, 0.8) !important;
  background-color: transparent !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  min-width: 48px !important;
  min-height: 48px !important;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.logout-btn .v-icon {
  color: inherit !important;
  font-size: 24px !important;
}

.app-bar {
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.app-title {
  color: #0c1b23;
  font-weight: 600;
}

.user-menu-btn {
  color: #0c1b23;
}

.main-content {
  background-color: #f5f5f5;
  height: calc(100vh - 80px); /* Subtrai altura do app-bar + margem */
  overflow-y: auto;
}

</style>
