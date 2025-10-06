<template>
  <v-container fluid class="login-container">
    <!-- Background Image -->
    <div class="background-image"></div>
    
    <!-- Login Modal -->
    <v-row justify="end" class="login-row">
      <v-col cols="12" md="4" lg="3" class="login-col">
        <v-card class="login-card" elevation="10">
          <!-- Logo no topo -->
          <v-card-text class="text-center pa-8">
            <div class="logo-container mb-6">
              <v-img
                src="/logo.png"
                alt="AiZap Logo"
                max-height="80"
                contain
              />
            </div>
            
            <!-- Formulário de Login -->
            <v-form ref="form" @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                class="mb-4"
                :rules="emailRules"
                required
              />
              
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="Senha"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="togglePasswordVisibility"
                class="mb-4"
                :rules="passwordRules"
                required
              />
              
              <!-- Error Message -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="error = ''"
              >
                {{ error }}
              </v-alert>
              
              <v-btn
                type="submit"
                size="large"
                block
                class="mb-4 login-button"
                :loading="loading"
              >
                Entrar
              </v-btn>
            </v-form>
            
            <!-- Logo Intelite -->
            <div class="text-center">
              <v-img
                src="/logo-intelite.png"
                alt="Intelite Logo"
                max-height="30"
                contain
                class="mx-auto"
              />
            </div>
          </v-card-text>
        </v-card>
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
      error: '',
      emailRules: [
        v => !!v || 'Email é obrigatório',
        v => /.+@.+\..+/.test(v) || 'Email deve ser válido'
      ],
      passwordRules: [
        v => !!v || 'Senha é obrigatória',
        v => (v && v.length >= 6) || 'Senha deve ter pelo menos 6 caracteres'
      ]
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
    async handleLogin() {
      if (this.$refs.form.validate()) {
        this.loading = true
        this.error = ''
        
        try {
          const authStore = useAuthStore()
          const result = await authStore.login({
            email: this.email,
            password: this.password
          })
          
          if (result.success) {
            // Redirecionar para chat após login
            this.$router.push('/chat')
          } else {
            this.error = result.error
          }
        } catch (error) {
          console.error('Erro no login:', error)
          this.error = 'Erro ao fazer login'
        } finally {
          this.loading = false
        }
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  position: relative;
  padding: 0;
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
}

.login-col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}

.login-card .v-card-text {
  padding: 32px !important;
}

.logo-container {
  background-color: #0c1b23;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  box-shadow: 0 4px 8px rgba(12, 27, 35, 0.3);
}

.login-button {
  background-color: #0c1b23 !important;
  color: white !important;
}

.login-button:hover {
  background-color: #1a2f3f !important;
}
</style>
