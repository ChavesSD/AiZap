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
            v-bind="props"
            class="user-menu-btn"
            variant="text"
          >
            <v-avatar size="32">
              <v-img v-if="userAvatar" :src="userAvatar" />
              <v-icon v-else>mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            prepend-avatar="userAvatar"
            :title="user?.firstName || user?.name || 'Usuário'"
            :subtitle="user?.email || ''"
            disabled
          />
          <v-divider />
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

    <!-- Profile Modal -->
    <v-dialog v-model="profileDialog" max-width="600px" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-account-edit</v-icon>
          Meu Perfil
        </v-card-title>
        
        <v-card-text>
          <v-form ref="profileFormRef" v-model="profileFormValid">
            <v-row class="mt-4">
              <!-- Upload de Foto -->
              <v-col cols="12" class="text-center">
                <v-avatar size="120" class="mb-4">
                  <v-img v-if="profileForm.photo" :src="profileForm.photo" />
                  <v-icon v-else size="60">mdi-account</v-icon>
                </v-avatar>
                <v-file-input
                  v-model="photoFile"
                  label="Selecionar Foto"
                  accept="image/*"
                  variant="outlined"
                  prepend-icon="mdi-camera"
                  @change="handlePhotoUpload"
                  class="mt-2"
                />
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  <div class="text-caption">
                    <strong>Dimensões recomendadas:</strong> 400x400 pixels<br>
                    <strong>Formatos aceitos:</strong> JPG, PNG, WebP<br>
                    <strong>Tamanho máximo:</strong> 2MB
                  </div>
                </v-alert>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profileForm.firstName"
                  label="Nome"
                  variant="outlined"
                  :rules="[v => !!v || 'Nome é obrigatório']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profileForm.lastName"
                  label="Sobrenome"
                  variant="outlined"
                  :rules="[v => !!v || 'Sobrenome é obrigatório']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profileForm.email"
                  label="Email"
                  variant="outlined"
                  type="email"
                  :rules="[v => !!v || 'Email é obrigatório', v => /.+@.+\..+/.test(v) || 'Email deve ser válido']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="profileForm.sector"
                  label="Setor"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="profileForm.password"
                  label="Nova Senha (deixe em branco para manter a atual)"
                  variant="outlined"
                  type="password"
                  :rules="[v => !v || v.length >= 6 || 'Senha deve ter pelo menos 6 caracteres']"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="closeProfileDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveProfile"
            :loading="savingProfile"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    
    // Profile modal state
    const profileDialog = ref(false)
    const profileFormValid = ref(false)
    const savingProfile = ref(false)
    const photoFile = ref(null)
    
    const user = computed(() => authStore.user || {})
    const userAvatar = computed(() => {
      if (user.value?.photo) {
        return user.value.photo
      }
      const name = user.value?.firstName || user.value?.name || 'U'
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0c1b23&color=fff`
    })
    
    // Profile form
    const profileForm = ref({
      firstName: '',
      lastName: '',
      email: '',
      sector: '',
      photo: '',
      password: ''
    })
    
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
      // Carregar dados do usuário atual no formulário
      profileForm.value = {
        firstName: user.value?.firstName || '',
        lastName: user.value?.lastName || '',
        email: user.value?.email || '',
        sector: user.value?.sector || '',
        photo: user.value?.photo || '',
        password: ''
      }
      profileDialog.value = true
    }
    
    const closeProfileDialog = () => {
      profileDialog.value = false
      photoFile.value = null
    }
    
    const handlePhotoUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          profileForm.value.photo = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const saveProfile = async () => {
      savingProfile.value = true
      try {
        const updateData = {
          firstName: profileForm.value.firstName,
          lastName: profileForm.value.lastName,
          email: profileForm.value.email,
          sector: profileForm.value.sector,
          photo: profileForm.value.photo
        }
        
        // Incluir senha apenas se fornecida
        if (profileForm.value.password) {
          updateData.password = profileForm.value.password
        }
        
        const response = await fetch(`http://localhost:3001/users/${user.value.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao atualizar perfil')
        }
        
        // Atualizar dados do usuário no store
        authStore.updateUser(updateData)
        
        closeProfileDialog()
        alert('Perfil atualizado com sucesso!')
      } catch (error) {
        console.error('Erro ao salvar perfil:', error)
        alert(`Erro ao salvar perfil: ${error.message}`)
      } finally {
        savingProfile.value = false
      }
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
      goToProfile,
      // Profile modal
      profileDialog,
      profileForm,
      profileFormValid,
      savingProfile,
      photoFile,
      closeProfileDialog,
      handlePhotoUpload,
      saveProfile
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
