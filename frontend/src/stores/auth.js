import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setAuth = (userData, authToken) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const login = async (credentials) => {
    try {
      loading.value = true
      
      const response = await axios.post('http://localhost:3001/auth/login', credentials)
      
      if (response.data.token && response.data.user) {
        setAuth(response.data.user, response.data.token)
        return { success: true, data: response.data }
      }
      
      throw new Error('Resposta inválida do servidor')
    } catch (error) {
      console.error('Erro no login:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer login' 
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      
      const response = await axios.post('http://localhost:3001/auth/register', userData)
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao registrar usuário' 
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      clearAuth()
      return { success: true }
    } catch (error) {
      console.error('Erro no logout:', error)
      return { success: false, error: 'Erro ao fazer logout' }
    }
  }

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        return true
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        clearAuth()
        return false
      }
    }
    
    return false
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    setAuth,
    clearAuth,
    login,
    register,
    logout,
    checkAuth,
    updateUser
  }
})
