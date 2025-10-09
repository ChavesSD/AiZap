<template>
  <v-container fluid class="login-container">
    <!-- Background Image -->
    <div class="background-image"></div>
    
    <!-- Notificações no canto superior direito -->
    <v-snackbar
      v-model="showNotification"
      :color="notificationColor"
      :timeout="4000"
      location="top right"
      class="notification-snackbar"
    >
      {{ notificationMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showNotification = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
    
    <!-- WhatsApp Floating Button -->
    <v-btn
      class="whatsapp-float"
      color="#25D366"
      size="large"
      icon="mdi-whatsapp"
      @click="openWhatsApp"
      title="Fale conosco no WhatsApp"
    />

    <!-- Layout com duas colunas -->
    <v-row class="login-row" no-gutters>
      <!-- Coluna esquerda - Formulário de Login -->
      <v-col cols="12" sm="12" md="4" lg="3" class="left-column">
        <div class="login-content">
          <!-- Logo no topo -->
          <div class="logo-container mb-4">
            <v-img
              src="/logo.png"
              alt="AiZap Logo"
              max-height="100"
              contain
              loading="lazy"
            />
          </div>
          
          <!-- Formulário de Login -->
          <v-form ref="form" @submit.prevent="handleLogin" class="login-form">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              class="custom-field"
              autocomplete="email"
              aria-label="Digite seu email"
            />
            
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Senha"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="togglePasswordVisibility"
              class="custom-field"
              autocomplete="current-password"
              aria-label="Digite sua senha"
            />
            
            <v-btn
              type="submit"
              size="small"
              class="login-button"
              :loading="loading"
            >
              Entrar
            </v-btn>
          </v-form>
          
          <!-- Direitos autorais -->
          <div class="copyright-text">
            Todos os direitos reservados Intelite Tecnologia ® 2025
          </div>
          
        </div>
      </v-col>
      
      <!-- Coluna direita - Conteúdo de marketing -->
      <v-col cols="12" sm="12" md="8" lg="9" class="right-column">
        <!-- Conteúdo de marketing será mantido pelo background -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      showNotification: false,
      notificationMessage: '',
      notificationColor: 'error'
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    showNotificationMessage(message, color = 'error') {
      this.notificationMessage = message
      this.notificationColor = color
      this.showNotification = true
    },
    openWhatsApp() {
      const phoneNumber = '558335125222' // Número sem formatação para WhatsApp
      const message = encodeURIComponent('Olá! Gostaria de saber mais sobre o AiZap.')
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
      window.open(whatsappUrl, '_blank')
    },
    async handleLogin() {
      // Validação manual
      if (!this.email) {
        this.showNotificationMessage('Email é obrigatório')
        return
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.showNotificationMessage('Email deve ser válido')
        return
      }
      
      if (!this.password) {
        this.showNotificationMessage('Senha é obrigatória')
        return
      }
      
      if (this.password.length < 6) {
        this.showNotificationMessage('Senha deve ter pelo menos 6 caracteres')
        return
      }
      
      this.loading = true
      
      try {
        const authStore = useAuthStore()
        const result = await authStore.login({
          email: this.email,
          password: this.password
        })
        
        if (result.success) {
          this.showNotificationMessage('Login realizado com sucesso!', 'success')
          // Redirecionar para chat após login
          setTimeout(() => {
            this.$router.push('/chat')
          }, 1000)
        } else {
          this.showNotificationMessage(result.error || 'Erro ao fazer login')
        }
      } catch (error) {
        console.error('Erro no login:', error)
        const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao fazer login'
        this.showNotificationMessage(errorMessage)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* Remove scrollbar globally for this page */
:deep(html), :deep(body) {
  overflow: hidden !important;
}

.login-container {
  height: 100vh;
  position: relative;
  padding: 0;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.login-row {
  position: relative;
  z-index: 2;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

.left-column {
  background-color: #d9d9d9 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 100vh;
  position: relative;
}


.right-column {
  background-color: transparent;
  min-height: 100vh;
}

.login-content {
  width: 100%;
  max-width: 400px;
  text-align: center;
  margin-top: 0;
  padding: 0 20px;
}

.logo-container {
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  width: 100%;
  box-shadow: none;
}

.login-form {
  background-color: transparent;
  border-radius: 0;
  padding: 20px 0;
  box-shadow: none;
  backdrop-filter: none;
}

.custom-field {
  width: 100% !important;
  max-width: 350px !important;
  height: 40px !important;
  margin: 0 auto 24px auto !important;
  transition: all 0.3s ease;
}

.custom-field:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.custom-field :deep(.v-field) {
  height: 40px !important;
  min-height: 40px !important;
}

.custom-field :deep(.v-field__input) {
  height: 40px !important;
  min-height: 40px !important;
  padding: 8px 12px !important;
}

.login-button {
  background-color: #0c1b23 !important;
  color: white !important;
  width: 100% !important;
  max-width: 350px !important;
  height: 40px !important;
  margin: 0 auto 24px auto !important;
  transition: all 0.3s ease;
  border-radius: 8px !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

.login-button:hover {
  background-color: #1a2f3f !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(12, 27, 35, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

/* Notificações */
.notification-snackbar {
  z-index: 9999;
}

/* Direitos autorais */
.copyright-text {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 20px;
  font-weight: 400;
  line-height: 1.4;
}

/* WhatsApp Floating Button */
.whatsapp-float {
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  z-index: 1000 !important;
  width: 60px !important;
  height: 60px !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4) !important;
  transition: all 0.3s ease !important;
  animation: pulse 2s infinite !important;
}

.whatsapp-float:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6) !important;
}

.whatsapp-float .v-icon {
  font-size: 28px !important;
  color: white !important;
}

/* Animação de pulso */
@keyframes pulse {
  0% {
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
  }
  50% {
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.8), 0 0 0 10px rgba(37, 211, 102, 0.1);
  }
  100% {
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
  }
}

/* Responsividade */

@media (max-width: 960px) {
  .left-column {
    min-height: 50vh;
    padding: 20px;
  }
  
  .right-column {
    min-height: 50vh;
  }
  
  .login-content {
    padding: 0 10px;
  }
  
  .custom-field {
    max-width: 100% !important;
  }
  
  .login-button {
    max-width: 100% !important;
  }
}

@media (max-width: 600px) {
  .left-column {
    padding: 15px;
  }
  
  .login-content {
    padding: 0 5px;
  }
  
  .logo-container {
    margin-bottom: 20px !important;
  }
  
  .login-form {
    padding: 10px 0;
  }
  
  .whatsapp-float {
    bottom: 15px !important;
    right: 15px !important;
    width: 55px !important;
    height: 55px !important;
  }
  
  .whatsapp-float .v-icon {
    font-size: 24px !important;
  }
}
</style>
