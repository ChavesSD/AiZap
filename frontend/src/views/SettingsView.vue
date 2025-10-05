<template>
  <div class="settings-container">
    <!-- Settings Header -->
    <div class="settings-header">
      <h2 class="settings-title">
        <v-icon class="mr-3">mdi-cog</v-icon>
        Configurações
      </h2>
      <p class="settings-subtitle">Gerencie as configurações do sistema</p>
    </div>

    <!-- Settings Tabs -->
    <v-tabs
      v-model="activeTab"
      color="primary"
      class="settings-tabs"
    >
      <v-tab value="geral">
        <v-icon start>mdi-information</v-icon>
        Geral
      </v-tab>
      <v-tab value="usuarios">
        <v-icon start>mdi-account-group</v-icon>
        Usuários
      </v-tab>
      <v-tab value="whatsapp">
        <v-icon start>mdi-whatsapp</v-icon>
        WhatsApp
      </v-tab>
      <v-tab value="manutencao">
        <v-icon start>mdi-wrench</v-icon>
        Manutenção
      </v-tab>
      <v-tab value="backup">
        <v-icon start>mdi-backup-restore</v-icon>
        Backup
      </v-tab>
    </v-tabs>

    <!-- Settings Content -->
    <v-card class="settings-content">
      <v-card-text>
        <!-- Aba Geral -->
        <div v-if="activeTab === 'geral'">
          <h3 class="section-title">Informações Gerais da Empresa</h3>
          <v-form ref="generalForm" v-model="generalFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="generalSettings.companyName"
                  label="Nome da Empresa"
                  variant="outlined"
                  :rules="[v => !!v || 'Nome é obrigatório']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="generalSettings.cnpj"
                  label="CNPJ"
                  variant="outlined"
                  v-mask="'##.###.###/####-##'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="generalSettings.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  :rules="emailRules"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="generalSettings.phone"
                  label="Telefone"
                  variant="outlined"
                  v-mask="'(##) #####-####'"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="generalSettings.address"
                  label="Endereço"
                  variant="outlined"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-6" />

          <h3 class="section-title">Horários de Funcionamento</h3>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="generalSettings.workingDays"
                :items="weekDays"
                label="Dias de Funcionamento"
                variant="outlined"
                multiple
                chips
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="generalSettings.startTime"
                label="Horário de Início"
                type="time"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="generalSettings.endTime"
                label="Horário de Fim"
                type="time"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <div class="action-buttons">
            <v-btn
              color="primary"
              @click="saveGeneralSettings"
              :loading="saving"
            >
              Salvar Configurações
            </v-btn>
          </div>
        </div>

        <!-- Aba Usuários -->
        <div v-if="activeTab === 'usuarios'">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="section-title">Gerenciamento de Usuários</h3>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openUserDialog"
            >
              Novo Usuário
            </v-btn>
          </div>

          <v-data-table
            :headers="userHeaders"
            :items="users"
            :loading="loadingUsers"
            class="elevation-1"
          >
            <template v-slot:item.role="{ item }">
              <v-chip
                :color="item.role === 'admin' ? 'error' : 'primary'"
                size="small"
              >
                {{ item.role === 'admin' ? 'Administrador' : 'Usuário' }}
              </v-chip>
            </template>
            <template v-slot:item.isActive="{ item }">
              <v-chip
                :color="item.isActive ? 'success' : 'error'"
                size="small"
              >
                {{ item.isActive ? 'Ativo' : 'Inativo' }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editUser(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteUser(item)"
              />
            </template>
          </v-data-table>
        </div>

        <!-- Aba WhatsApp -->
        <div v-if="activeTab === 'whatsapp'">
          <h3 class="section-title">Configurações da API WhatsApp</h3>
          
          <v-form ref="whatsappForm" v-model="whatsappFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="whatsappSettings.provider"
                  :items="whatsappProviders"
                  label="Provedor da API"
                  variant="outlined"
                  @update:model-value="onProviderChange"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="whatsappSettings.apiUrl"
                  label="URL da API"
                  variant="outlined"
                  :rules="[v => !!v || 'URL é obrigatória']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="whatsappSettings.apiKey"
                  label="API Key"
                  variant="outlined"
                  type="password"
                  :rules="[v => !!v || 'API Key é obrigatória']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="whatsappSettings.webhookUrl"
                  label="Webhook URL"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="whatsappSettings.webhookSecret"
                  label="Webhook Secret"
                  variant="outlined"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-6" />

          <h4 class="subsection-title">Configurações Avançadas</h4>
          <v-row>
            <v-col cols="12" md="4">
              <v-switch
                v-model="whatsappSettings.autoReply"
                label="Resposta Automática"
                color="primary"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-switch
                v-model="whatsappSettings.readReceipts"
                label="Confirmação de Leitura"
                color="primary"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-switch
                v-model="whatsappSettings.typingIndicator"
                label="Indicador de Digitação"
                color="primary"
              />
            </v-col>
          </v-row>

          <div class="action-buttons">
            <v-btn
              color="primary"
              @click="saveWhatsAppSettings"
              :loading="saving"
            >
              Salvar Configurações
            </v-btn>
            <v-btn
              color="success"
              @click="testConnection"
              :loading="testing"
              class="ml-2"
            >
              Testar Conexão
            </v-btn>
          </div>
        </div>

        <!-- Aba Manutenção -->
        <div v-if="activeTab === 'manutencao'">
          <h3 class="section-title">Manutenção do Sistema</h3>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-card class="maintenance-card">
                <v-card-title>
                  <v-icon class="mr-2">mdi-database</v-icon>
                  Limpeza de Dados
                </v-card-title>
                <v-card-text>
                  <p>Remover dados antigos e otimizar o banco de dados</p>
                  <v-btn
                    color="warning"
                    @click="cleanOldData"
                    :loading="cleaning"
                  >
                    Limpar Dados Antigos
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="maintenance-card">
                <v-card-title>
                  <v-icon class="mr-2">mdi-cache</v-icon>
                  Cache
                </v-card-title>
                <v-card-text>
                  <p>Limpar cache do sistema</p>
                  <v-btn
                    color="info"
                    @click="clearCache"
                    :loading="clearingCache"
                  >
                    Limpar Cache
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="maintenance-card">
                <v-card-title>
                  <v-icon class="mr-2">mdi-log</v-icon>
                  Logs
                </v-card-title>
                <v-card-text>
                  <p>Gerenciar logs do sistema</p>
                  <v-btn
                    color="secondary"
                    @click="downloadLogs"
                    :loading="downloadingLogs"
                  >
                    Baixar Logs
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="maintenance-card">
                <v-card-title>
                  <v-icon class="mr-2">mdi-restart</v-icon>
                  Reinicialização
                </v-card-title>
                <v-card-text>
                  <p>Reiniciar serviços do sistema</p>
                  <v-btn
                    color="error"
                    @click="restartServices"
                    :loading="restarting"
                  >
                    Reiniciar Serviços
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Aba Backup -->
        <div v-if="activeTab === 'backup'">
          <h3 class="section-title">Configurações de Backup</h3>
          
          <v-form ref="backupForm" v-model="backupFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="backupSettings.frequency"
                  label="Frequência do Backup"
                  variant="outlined"
                  type="number"
                  suffix="dias"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="backupSettings.retention"
                  :items="retentionOptions"
                  label="Retenção"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="backupSettings.startDate"
                  label="Data Inicial"
                  type="date"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="backupSettings.endDate"
                  label="Data Final"
                  type="date"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-6" />

          <h4 class="subsection-title">Ações de Backup</h4>
          <v-row>
            <v-col cols="12" md="4">
              <v-card class="backup-action-card">
                <v-card-title>
                  <v-icon class="mr-2">mdi-export</v-icon>
                  Exportar
                </v-card-title>
                <v-card-text>
                  <p>Exportar dados do sistema</p>
                  <v-btn
                    color="primary"
                    @click="exportBackup"
                    :loading="exporting"
                    block
                  >
                    Exportar Backup
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="backup-action-card">
                <v-card-title>
                  <v-icon class="mr-2">mdi-import</v-icon>
                  Importar
                </v-card-title>
                <v-card-text>
                  <p>Importar dados para o sistema</p>
                  <v-file-input
                    v-model="importFile"
                    label="Selecionar Arquivo"
                    accept=".json,.zip"
                    variant="outlined"
                    prepend-icon="mdi-file"
                  />
                  <v-btn
                    color="success"
                    @click="importBackup"
                    :loading="importing"
                    :disabled="!importFile"
                    block
                    class="mt-2"
                  >
                    Importar Backup
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="backup-action-card">
                <v-card-title>
                  <v-icon class="mr-2">mdi-history</v-icon>
                  Histórico
                </v-card-title>
                <v-card-text>
                  <p>Ver histórico de backups</p>
                  <v-btn
                    color="info"
                    @click="viewBackupHistory"
                    block
                  >
                    Ver Histórico
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- User Dialog -->
    <v-dialog v-model="userDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="userForm" v-model="userFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userForm.name"
                  label="Nome"
                  variant="outlined"
                  :rules="[v => !!v || 'Nome é obrigatório']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userForm.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  :rules="emailRules"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userForm.password"
                  label="Senha"
                  type="password"
                  variant="outlined"
                  :rules="passwordRules"
                  :required="!editingUser"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userForm.role"
                  :items="roleOptions"
                  label="Função"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="userForm.isActive"
                  label="Usuário Ativo"
                  color="primary"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="userDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            :loading="savingUser"
            :disabled="!userFormValid"
          >
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'SettingsView',
  setup() {
    const activeTab = ref('geral')
    const saving = ref(false)
    const loadingUsers = ref(false)
    const testing = ref(false)
    const cleaning = ref(false)
    const clearingCache = ref(false)
    const downloadingLogs = ref(false)
    const restarting = ref(false)
    const exporting = ref(false)
    const importing = ref(false)
    const savingUser = ref(false)
    
    const generalFormValid = ref(false)
    const whatsappFormValid = ref(false)
    const backupFormValid = ref(false)
    const userFormValid = ref(false)
    
    const userDialog = ref(false)
    const editingUser = ref(false)
    const importFile = ref(null)
    
    // General Settings
    const generalSettings = reactive({
      companyName: '',
      cnpj: '',
      email: '',
      phone: '',
      address: '',
      workingDays: [],
      startTime: '08:00',
      endTime: '18:00'
    })
    
    // WhatsApp Settings
    const whatsappSettings = reactive({
      provider: '',
      apiUrl: '',
      apiKey: '',
      webhookUrl: '',
      webhookSecret: '',
      autoReply: false,
      readReceipts: true,
      typingIndicator: true
    })
    
    // Backup Settings
    const backupSettings = reactive({
      frequency: 7,
      retention: '30dias',
      startDate: '',
      endDate: ''
    })
    
    // User Form
    const userForm = reactive({
      name: '',
      email: '',
      password: '',
      role: 'user',
      isActive: true
    })
    
    // Data
    const users = ref([])
    const weekDays = [
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
      'Domingo'
    ]
    
    const whatsappProviders = [
      'WhatsApp Business API',
      'Twilio',
      'Meta for Developers',
      '360Dialog',
      'MessageBird',
      'Outro'
    ]
    
    const retentionOptions = [
      { title: '7 dias', value: '7dias' },
      { title: '30 dias', value: '30dias' },
      { title: '90 dias', value: '90dias' },
      { title: '1 ano', value: '1ano' },
      { title: 'Indefinido', value: 'indefinido' }
    ]
    
    const roleOptions = [
      { title: 'Administrador', value: 'admin' },
      { title: 'Usuário', value: 'user' }
    ]
    
    const userHeaders = [
      { title: 'Nome', key: 'name' },
      { title: 'Email', key: 'email' },
      { title: 'Função', key: 'role' },
      { title: 'Status', key: 'isActive' },
      { title: 'Ações', key: 'actions', sortable: false }
    ]
    
    // Rules
    const emailRules = [
      v => !!v || 'Email é obrigatório',
      v => /.+@.+\..+/.test(v) || 'Email deve ser válido'
    ]
    
    const passwordRules = [
      v => !!v || 'Senha é obrigatória',
      v => (v && v.length >= 6) || 'Senha deve ter pelo menos 6 caracteres'
    ]
    
    // Methods
    const saveGeneralSettings = async () => {
      saving.value = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Configurações gerais salvas:', generalSettings)
      } catch (error) {
        console.error('Erro ao salvar configurações gerais:', error)
      } finally {
        saving.value = false
      }
    }
    
    const saveWhatsAppSettings = async () => {
      saving.value = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Configurações WhatsApp salvas:', whatsappSettings)
      } catch (error) {
        console.error('Erro ao salvar configurações WhatsApp:', error)
      } finally {
        saving.value = false
      }
    }
    
    const testConnection = async () => {
      testing.value = true
      try {
        // Simulate API test
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('Teste de conexão realizado')
      } catch (error) {
        console.error('Erro no teste de conexão:', error)
      } finally {
        testing.value = false
      }
    }
    
    const onProviderChange = (provider) => {
      // Set default URLs based on provider
      const defaultUrls = {
        'WhatsApp Business API': 'https://graph.facebook.com/v17.0',
        'Twilio': 'https://api.twilio.com',
        'Meta for Developers': 'https://graph.facebook.com',
        '360Dialog': 'https://api.360dialog.com',
        'MessageBird': 'https://conversations.messagebird.com'
      }
      
      if (defaultUrls[provider]) {
        whatsappSettings.apiUrl = defaultUrls[provider]
      }
    }
    
    const cleanOldData = async () => {
      cleaning.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('Limpeza de dados realizada')
      } catch (error) {
        console.error('Erro na limpeza de dados:', error)
      } finally {
        cleaning.value = false
      }
    }
    
    const clearCache = async () => {
      clearingCache.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Cache limpo')
      } catch (error) {
        console.error('Erro ao limpar cache:', error)
      } finally {
        clearingCache.value = false
      }
    }
    
    const downloadLogs = async () => {
      downloadingLogs.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('Logs baixados')
      } catch (error) {
        console.error('Erro ao baixar logs:', error)
      } finally {
        downloadingLogs.value = false
      }
    }
    
    const restartServices = async () => {
      restarting.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 3000))
        console.log('Serviços reiniciados')
      } catch (error) {
        console.error('Erro ao reiniciar serviços:', error)
      } finally {
        restarting.value = false
      }
    }
    
    const exportBackup = async () => {
      exporting.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('Backup exportado')
      } catch (error) {
        console.error('Erro ao exportar backup:', error)
      } finally {
        exporting.value = false
      }
    }
    
    const importBackup = async () => {
      importing.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('Backup importado')
        importFile.value = null
      } catch (error) {
        console.error('Erro ao importar backup:', error)
      } finally {
        importing.value = false
      }
    }
    
    const viewBackupHistory = () => {
      console.log('Visualizando histórico de backups')
    }
    
    const openUserDialog = () => {
      editingUser.value = false
      userForm.name = ''
      userForm.email = ''
      userForm.password = ''
      userForm.role = 'user'
      userForm.isActive = true
      userDialog.value = true
    }
    
    const editUser = (user) => {
      editingUser.value = true
      userForm.name = user.name
      userForm.email = user.email
      userForm.password = ''
      userForm.role = user.role
      userForm.isActive = user.isActive
      userDialog.value = true
    }
    
    const saveUser = async () => {
      savingUser.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Usuário salvo:', userForm)
        userDialog.value = false
      } catch (error) {
        console.error('Erro ao salvar usuário:', error)
      } finally {
        savingUser.value = false
      }
    }
    
    const deleteUser = (user) => {
      console.log('Deletar usuário:', user)
    }
    
    const loadUsers = async () => {
      loadingUsers.value = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        users.value = [
          {
            id: 1,
            name: 'Administrador',
            email: 'admin@aizap.com.br',
            role: 'admin',
            isActive: true
          },
          {
            id: 2,
            name: 'João Silva',
            email: 'joao@empresa.com',
            role: 'user',
            isActive: true
          }
        ]
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
      } finally {
        loadingUsers.value = false
      }
    }
    
    onMounted(() => {
      loadUsers()
    })
    
    return {
      activeTab,
      saving,
      loadingUsers,
      testing,
      cleaning,
      clearingCache,
      downloadingLogs,
      restarting,
      exporting,
      importing,
      savingUser,
      generalFormValid,
      whatsappFormValid,
      backupFormValid,
      userFormValid,
      userDialog,
      editingUser,
      importFile,
      generalSettings,
      whatsappSettings,
      backupSettings,
      userForm,
      users,
      weekDays,
      whatsappProviders,
      retentionOptions,
      roleOptions,
      userHeaders,
      emailRules,
      passwordRules,
      saveGeneralSettings,
      saveWhatsAppSettings,
      testConnection,
      onProviderChange,
      cleanOldData,
      clearCache,
      downloadLogs,
      restartServices,
      exportBackup,
      importBackup,
      viewBackupHistory,
      openUserDialog,
      editUser,
      saveUser,
      deleteUser
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 80px);
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* Scrollbar styling */
.settings-container::-webkit-scrollbar {
  width: 8px;
}

.settings-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.settings-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.settings-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-title {
  color: #0c1b23;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.settings-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.settings-tabs {
  margin-bottom: 24px;
}

.settings-content {
  min-height: 600px;
  max-height: none;
}

.section-title {
  color: #0c1b23;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.subsection-title {
  color: #0c1b23;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.action-buttons {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.maintenance-card {
  height: 100%;
}

.backup-action-card {
  height: 100%;
}

.backup-action-card .v-card-text {
  padding-bottom: 16px;
}
</style>