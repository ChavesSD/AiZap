<template>
  <div class="connect-page">
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" md="11" lg="10">
          <!-- WhatsApp Connection Card -->
          <v-card class="connection-card" elevation="4">
            <v-card-title class="text-center pa-6">
              <v-icon size="48" color="success" class="mb-4">mdi-whatsapp</v-icon>
              <h2 class="connection-title">
                <v-icon class="mr-3">mdi-whatsapp</v-icon>
                Conectar WhatsApp
              </h2>
              <p class="connection-subtitle">Escaneie o QR Code para conectar seu WhatsApp</p>
            </v-card-title>
            
            <v-card-text class="pa-6">
              <!-- Status Section -->
              <v-row class="mb-6" justify="center">
                <v-col cols="12" class="d-flex justify-center align-center flex-wrap ga-3">
                  <v-chip 
                    :color="whatsappStatus.isConnected ? 'success' : 'warning'"
                    variant="tonal"
                    size="large"
                  >
                    <v-icon start>{{ whatsappStatus.isConnected ? 'mdi-check-circle' : 'mdi-clock' }}</v-icon>
                    {{ whatsappStatus.isConnected ? 'Conectado' : 'Aguardando Conexão' }}
                  </v-chip>
                  
                  <v-chip 
                    :color="getStatusColor(whatsappStatus.status)"
                    variant="tonal"
                    size="large"
                  >
                    <v-icon start>{{ getStatusIcon(whatsappStatus.status) }}</v-icon>
                    {{ getStatusText(whatsappStatus.status) }}
                  </v-chip>
                </v-col>
              </v-row>

              <!-- QR Code Section -->
              <div v-if="whatsappStatus.qrCode" class="qr-section">
                <v-alert type="info" variant="tonal" class="mb-4">
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  <div>
                    <strong>Instruções:</strong>
                    <ol class="mt-2">
                      <li>Abra o WhatsApp no seu celular</li>
                      <li>Toque em "Menu" ou "Configurações"</li>
                      <li>Toque em "Dispositivos conectados"</li>
                      <li>Toque em "Conectar um dispositivo"</li>
                      <li>Escaneie o QR Code abaixo</li>
                    </ol>
                  </div>
                </v-alert>
                
                <div class="qr-container">
                  <v-img
                    :src="`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${whatsappStatus.qrCode}`"
                    max-width="300"
                    max-height="300"
                    class="mx-auto qr-image"
                    alt="QR Code para conectar WhatsApp"
                  />
                </div>
              </div>

              <!-- Loading Section -->
              <div v-else-if="loading" class="loading-section">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                  class="mb-4"
                />
                <p class="loading-text">Inicializando WhatsApp...</p>
                <p class="loading-subtext">Aguarde o QR Code aparecer</p>
              </div>

              <!-- Error Section -->
              <div v-else-if="error" class="error-section">
                <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
                <p class="error-text">{{ error }}</p>
                <v-btn
                  color="primary"
                  @click="initializeWhatsApp"
                  :loading="loading"
                  class="mt-4"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  Tentar Novamente
                </v-btn>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons mt-6 d-flex flex-column align-center ga-3">
                <div class="d-flex flex-wrap justify-center ga-3">
                  <v-btn
                    v-if="!whatsappStatus.isConnected"
                    color="primary"
                    size="large"
                    @click="initializeWhatsApp"
                    :loading="loading"
                  >
                    <v-icon start>mdi-play</v-icon>
                    Inicializar WhatsApp
                  </v-btn>
                  
                  <v-btn
                    v-if="!whatsappStatus.isConnected && !whatsappStatus.qrCode"
                    color="warning"
                    size="large"
                    @click="restartWhatsApp"
                    :loading="restarting"
                  >
                    <v-icon start>mdi-restart</v-icon>
                    Reiniciar WhatsApp
                  </v-btn>

                  <v-btn
                    v-if="whatsappStatus.qrCode && !whatsappStatus.isConnected"
                    color="success"
                    size="large"
                    @click="simulateConnection"
                    :loading="simulating"
                  >
                    <v-icon start>mdi-check-circle</v-icon>
                    Simular Conexão
                  </v-btn>
                </div>
                
                <div class="d-flex flex-wrap justify-center ga-3">
                  <v-btn
                    v-if="whatsappStatus.isConnected"
                    color="error"
                    size="large"
                    @click="disconnectWhatsApp"
                    :loading="disconnecting"
                  >
                    <v-icon start>mdi-stop</v-icon>
                    Desconectar
                  </v-btn>

                  <v-btn
                    v-if="whatsappStatus.isConnected"
                    color="secondary"
                    size="large"
                    @click="showCreateInstanceDialog = true"
                  >
                    <v-icon start>mdi-plus</v-icon>
                    Nova Instância
                  </v-btn>
                  
                  <v-btn
                    color="info"
                    size="large"
                    @click="refreshStatus"
                    :loading="refreshing"
                  >
                    <v-icon start>mdi-refresh</v-icon>
                    Atualizar Status
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Instâncias Ativas -->
          <v-card v-if="instances.length > 0" class="instances-card mt-6" elevation="4">
            <v-card-title>
              <v-icon class="mr-2">mdi-account-multiple</v-icon>
              Instâncias Ativas
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col 
                  v-for="instance in instances" 
                  :key="instance.instanceId" 
                  cols="12" 
                  md="6" 
                  lg="4"
                >
                  <v-card 
                    :color="instance.isConnected ? 'success' : 'warning'"
                    variant="tonal"
                    class="instance-card"
                  >
                    <v-card-text>
                      <div class="d-flex align-center mb-2">
                        <v-icon class="mr-2">
                          {{ instance.isConnected ? 'mdi-check-circle' : 'mdi-clock' }}
                        </v-icon>
                        <strong>{{ instance.instanceId }}</strong>
                      </div>
                      
                      <v-chip 
                        :color="getStatusColor(instance.status)"
                        size="small"
                        class="mb-2"
                      >
                        {{ getStatusText(instance.status) }}
                      </v-chip>
                      
                      <div class="d-flex gap-2">
                        <v-btn
                          v-if="instance.qrCode && !instance.isConnected"
                          color="success"
                          size="small"
                          @click="simulateInstanceConnection(instance.instanceId)"
                          :loading="simulatingInstances[instance.instanceId]"
                        >
                          <v-icon start>mdi-check</v-icon>
                          Conectar
                        </v-btn>
                        
                        <v-btn
                          v-if="instance.isConnected"
                          color="error"
                          size="small"
                          @click="disconnectInstance(instance.instanceId)"
                          :loading="disconnectingInstances[instance.instanceId]"
                        >
                          <v-icon start>mdi-stop</v-icon>
                          Desconectar
                        </v-btn>
                        
                        <v-btn
                          color="error"
                          size="small"
                          variant="outlined"
                          @click="removeInstance(instance.instanceId)"
                        >
                          <v-icon start>mdi-delete</v-icon>
                          Remover
                        </v-btn>
      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Info Card -->
          <v-card class="info-card mt-6" variant="outlined">
            <v-card-text>
              <h4 class="info-title">
                <v-icon class="mr-2">mdi-information</v-icon>
                Sobre a Conexão
              </h4>
              <ul class="info-list">
                <li>Esta é uma conexão temporária usando WhatsApp Web.js</li>
                <li>Será substituída pela API oficial quando a empresa escolher o provedor</li>
                <li>Você pode desconectar a qualquer momento</li>
                <li>As mensagens são salvas no banco de dados do sistema</li>
                <li><strong>Múltiplas instâncias:</strong> Conecte várias contas WhatsApp simultaneamente</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Modal para criar nova instância -->
    <v-dialog v-model="showCreateInstanceDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-plus</v-icon>
          Nova Instância WhatsApp
        </v-card-title>
        
        <v-card-text>
          <v-form ref="instanceForm" v-model="instanceFormValid">
            <v-text-field
              v-model="newInstanceId"
              label="ID da Instância"
              placeholder="ex: suporte, vendas, atendimento"
              variant="outlined"
              :rules="[v => !!v || 'ID é obrigatório', v => v.length >= 3 || 'Mínimo 3 caracteres']"
              required
              class="mb-4"
            />
            
            <v-textarea
              v-model="newInstanceDescription"
              label="Descrição (opcional)"
              placeholder="Descreva o propósito desta instância..."
              variant="outlined"
              rows="3"
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            @click="showCreateInstanceDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="createNewInstance"
            :loading="creatingInstance"
            :disabled="!instanceFormValid"
          >
            <v-icon start>mdi-plus</v-icon>
            Criar Instância
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ConnectView',
  setup() {
    // WhatsApp Status
    const whatsappStatus = ref({
      isConnected: false,
      status: 'disconnected',
      qrCode: null
    })
    
    // Loading States
    const loading = ref(false)
    const disconnecting = ref(false)
    const refreshing = ref(false)
    const restarting = ref(false)
    const simulating = ref(false)
    const error = ref('')

    // Multiple Instances
    const instances = ref([])
    const showCreateInstanceDialog = ref(false)
    const newInstanceId = ref('')
    const newInstanceDescription = ref('')
    const instanceFormValid = ref(false)
    const creatingInstance = ref(false)
    const simulatingInstances = ref({})
    const disconnectingInstances = ref({})
    
    // Initialize WhatsApp
    const initializeWhatsApp = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const response = await fetch('http://localhost:3001/whatsapp/initialize', {
          method: 'POST'
        })
        
        if (!response.ok) {
          throw new Error('Erro ao inicializar WhatsApp')
        }
        
        const result = await response.json()
        console.log('✅ WhatsApp inicializado:', result)
        
        // Atualizar status após inicialização
        setTimeout(() => {
          refreshStatus()
        }, 2000)
        
      } catch (err) {
        console.error('Erro ao inicializar WhatsApp:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }
    
    // Disconnect WhatsApp
    const disconnectWhatsApp = async () => {
      disconnecting.value = true
      
      try {
        const response = await fetch('http://localhost:3001/whatsapp/disconnect', {
          method: 'POST'
        })
        
        if (!response.ok) {
          throw new Error('Erro ao desconectar WhatsApp')
        }
        
        const result = await response.json()
        console.log('✅ WhatsApp desconectado:', result)
        
        // Atualizar status
        refreshStatus()
        
      } catch (err) {
        console.error('Erro ao desconectar WhatsApp:', err)
        error.value = err.message
      } finally {
        disconnecting.value = false
      }
    }

    // Restart WhatsApp
    const restartWhatsApp = async () => {
      restarting.value = true
      error.value = ''
      
      try {
        const response = await fetch('http://localhost:3001/whatsapp/restart', {
          method: 'POST'
        })
        
        if (!response.ok) {
          throw new Error('Erro ao reiniciar WhatsApp')
        }
        
        const result = await response.json()
        console.log('✅ WhatsApp reiniciado:', result)
        
        // Atualizar status após reinicialização
        setTimeout(() => {
          refreshStatus()
        }, 3000)
        
      } catch (err) {
        console.error('Erro ao reiniciar WhatsApp:', err)
        error.value = err.message
      } finally {
        restarting.value = false
      }
    }

    // Simulate Connection
    const simulateConnection = async () => {
      simulating.value = true
      error.value = ''
      
      try {
        const response = await fetch('http://localhost:3001/whatsapp/simulate-connection', {
          method: 'POST'
        })
        
        if (!response.ok) {
          throw new Error('Erro ao simular conexão WhatsApp')
        }
        
        const result = await response.json()
        console.log('✅ Conexão simulada:', result)
        
        // Atualizar status após simulação
        setTimeout(() => {
          refreshStatus()
        }, 1000)
        
      } catch (err) {
        console.error('Erro ao simular conexão WhatsApp:', err)
        error.value = err.message
      } finally {
        simulating.value = false
      }
    }

    // ===== FUNÇÕES PARA MÚLTIPLAS INSTÂNCIAS =====

    // Carregar instâncias
    const loadInstances = async () => {
      try {
        const response = await fetch('http://localhost:3001/whatsapp/instances')
        if (response.ok) {
          instances.value = await response.json()
        }
      } catch (err) {
        console.error('Erro ao carregar instâncias:', err)
      }
    }

    // Criar nova instância
    const createNewInstance = async () => {
      if (!newInstanceId.value) return

      creatingInstance.value = true
      try {
        const response = await fetch('http://localhost:3001/whatsapp/instances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            instanceId: newInstanceId.value,
            config: {
              description: newInstanceDescription.value
            }
          })
        })

        if (response.ok) {
          // Inicializar a nova instância
          await initializeInstance(newInstanceId.value)
          
          // Limpar formulário
          newInstanceId.value = ''
          newInstanceDescription.value = ''
          showCreateInstanceDialog.value = false
          
          // Recarregar lista
          await loadInstances()
        } else {
          const errorData = await response.json()
          error.value = errorData.error || 'Erro ao criar instância'
        }
      } catch (err) {
        console.error('Erro ao criar instância:', err)
        error.value = 'Erro de conexão'
      } finally {
        creatingInstance.value = false
      }
    }

    // Inicializar instância específica
    const initializeInstance = async (instanceId) => {
      try {
        const response = await fetch(`http://localhost:3001/whatsapp/instances/${instanceId}/initialize`, {
          method: 'POST'
        })
        
        if (response.ok) {
          console.log(`✅ Instância ${instanceId} inicializada`)
          // Aguardar um pouco e recarregar status
          setTimeout(() => {
            loadInstances()
          }, 3000)
        }
      } catch (err) {
        console.error(`Erro ao inicializar instância ${instanceId}:`, err)
      }
    }

    // Simular conexão de instância específica
    const simulateInstanceConnection = async (instanceId) => {
      simulatingInstances.value[instanceId] = true
      try {
        const response = await fetch(`http://localhost:3001/whatsapp/instances/${instanceId}/simulate-connection`, {
          method: 'POST'
        })
        
        if (response.ok) {
          console.log(`✅ Instância ${instanceId} conectada`)
          await loadInstances()
        } else {
          const errorData = await response.json()
          error.value = errorData.error || 'Erro ao conectar instância'
        }
      } catch (err) {
        console.error(`Erro ao conectar instância ${instanceId}:`, err)
        error.value = 'Erro de conexão'
      } finally {
        simulatingInstances.value[instanceId] = false
      }
    }

    // Desconectar instância específica
    const disconnectInstance = async (instanceId) => {
      disconnectingInstances.value[instanceId] = true
      try {
        const response = await fetch(`http://localhost:3001/whatsapp/instances/${instanceId}/disconnect`, {
          method: 'POST'
        })
        
        if (response.ok) {
          console.log(`✅ Instância ${instanceId} desconectada`)
          await loadInstances()
        } else {
          const errorData = await response.json()
          error.value = errorData.error || 'Erro ao desconectar instância'
        }
      } catch (err) {
        console.error(`Erro ao desconectar instância ${instanceId}:`, err)
        error.value = 'Erro de conexão'
      } finally {
        disconnectingInstances.value[instanceId] = false
      }
    }

    // Remover instância
    const removeInstance = async (instanceId) => {
      if (!confirm(`Tem certeza que deseja remover a instância ${instanceId}?`)) {
        return
      }

      try {
        const response = await fetch(`http://localhost:3001/whatsapp/instances/${instanceId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          console.log(`✅ Instância ${instanceId} removida`)
          await loadInstances()
        } else {
          const errorData = await response.json()
          error.value = errorData.error || 'Erro ao remover instância'
        }
      } catch (err) {
        console.error(`Erro ao remover instância ${instanceId}:`, err)
        error.value = 'Erro de conexão'
      }
    }
    
    // Refresh Status
    const refreshStatus = async () => {
      refreshing.value = true
      
      try {
        const response = await fetch('http://localhost:3001/whatsapp/status')
        
        if (!response.ok) {
          throw new Error('Erro ao obter status WhatsApp')
        }
        
        const status = await response.json()
        whatsappStatus.value = status
        
        console.log('📊 Status WhatsApp atualizado:', status)
        
      } catch (err) {
        console.error('Erro ao atualizar status WhatsApp:', err)
        error.value = err.message
      } finally {
        refreshing.value = false
      }
    }
    
    // Helper functions
    const getStatusColor = (status) => {
      const colors = {
        'connected': 'success',
        'authenticated': 'info',
        'disconnected': 'error',
        'auth_failure': 'error'
      }
      return colors[status] || 'warning'
    }
    
    const getStatusIcon = (status) => {
      const icons = {
        'connected': 'mdi-check-circle',
        'authenticated': 'mdi-shield-check',
        'disconnected': 'mdi-close-circle',
        'auth_failure': 'mdi-alert-circle'
      }
      return icons[status] || 'mdi-help-circle'
    }
    
    const getStatusText = (status) => {
      const texts = {
        'connected': 'Conectado',
        'authenticated': 'Autenticado',
        'disconnected': 'Desconectado',
        'auth_failure': 'Falha na Autenticação'
      }
      return texts[status] || 'Desconhecido'
    }
    
    // Auto-refresh status every 5 seconds
    let statusInterval = null
    
    const startStatusPolling = () => {
      statusInterval = setInterval(() => {
        if (!loading.value && !disconnecting.value) {
          refreshStatus()
        }
      }, 5000)
    }
    
    const stopStatusPolling = () => {
      if (statusInterval) {
        clearInterval(statusInterval)
        statusInterval = null
      }
    }
    
    onMounted(() => {
      refreshStatus()
      loadInstances()
      startStatusPolling()
    })
    
    return {
      whatsappStatus,
      loading,
      disconnecting,
      refreshing,
      restarting,
      simulating,
      error,
      initializeWhatsApp,
      disconnectWhatsApp,
      restartWhatsApp,
      simulateConnection,
      refreshStatus,
      getStatusColor,
      getStatusIcon,
      getStatusText,
      // Multiple Instances
      instances,
      showCreateInstanceDialog,
      newInstanceId,
      newInstanceDescription,
      instanceFormValid,
      creatingInstance,
      simulatingInstances,
      disconnectingInstances,
      createNewInstance,
      simulateInstanceConnection,
      disconnectInstance,
      removeInstance,
      loadInstances
    }
  }
}
</script>

<style scoped>
.connect-page {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.connection-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.connection-title {
  color: #0c1b23;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.connection-subtitle {
  color: #666;
  font-size: 16px;
  margin: 8px 0 0 0;
}

.qr-section {
  text-align: center;
}

.qr-container {
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
}

.qr-image {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-section {
  text-align: center;
  padding: 48px 24px;
}

.loading-text {
  font-size: 18px;
  color: #0c1b23;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.loading-subtext {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.error-section {
  text-align: center;
  padding: 48px 24px;
}

.error-text {
  font-size: 16px;
  color: #d32f2f;
  margin: 16px 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.info-card {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
}

.info-title {
  color: #0c1b23;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
}

.info-list {
  color: #666;
  line-height: 1.6;
  margin: 0;
  padding-left: 20px;
}

/* Instances Styles */
.instances-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.instance-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.instance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.gap-2 {
  gap: 8px;
}

.info-list li {
  margin-bottom: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .connect-page {
    padding: 16px;
  }
  
  .connection-title {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .v-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
