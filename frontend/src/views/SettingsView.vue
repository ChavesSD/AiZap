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
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="generalSettings.cep"
                  label="CEP"
                  variant="outlined"
                  v-mask="'#####-###'"
                  @blur="searchCep"
                  :loading="loadingCep"
                  hint="Digite o CEP para preenchimento automático"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="generalSettings.street"
                  label="Rua"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="generalSettings.number"
                  label="Número"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="generalSettings.neighborhood"
                  label="Bairro"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="generalSettings.cityState"
                  label="Cidade/Estado"
                  variant="outlined"
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
                label="Dias de Funcionamento (Segunda a Sexta)"
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

          <v-divider class="my-4" />

          <h4 class="subsection-title">Horários Especiais</h4>
          <v-row>
            <v-col cols="12" md="6">
              <v-card class="special-hours-card">
                <v-card-title class="text-subtitle-1">
                  <v-icon class="mr-2">mdi-calendar-weekend</v-icon>
                  Sábado
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="generalSettings.saturdayStartTime"
                        label="Início"
                        type="time"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="generalSettings.saturdayEndTime"
                        label="Fim"
                        type="time"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>
                  <v-switch
                    v-model="generalSettings.saturdayOpen"
                    label="Aberto aos sábados"
                    color="primary"
                    density="compact"
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="special-hours-card">
                <v-card-title class="text-subtitle-1">
                  <v-icon class="mr-2">mdi-calendar-weekend</v-icon>
                  Domingo
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="generalSettings.sundayStartTime"
                        label="Início"
                        type="time"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="generalSettings.sundayEndTime"
                        label="Fim"
                        type="time"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>
                  <v-switch
                    v-model="generalSettings.sundayOpen"
                    label="Aberto aos domingos"
                    color="primary"
                    density="compact"
                  />
                </v-card-text>
              </v-card>
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
    <v-dialog v-model="userDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">{{ editingUser ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
          {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
        </v-card-title>
        
        <v-card-text>
          <v-tabs v-model="userTab" color="primary">
            <v-tab value="basic">
              <v-icon start>mdi-account</v-icon>
              Dados Básicos
            </v-tab>
            <v-tab value="access">
              <v-icon start>mdi-shield-account</v-icon>
              Acesso
            </v-tab>
            <v-tab value="messages">
              <v-icon start>mdi-message-text</v-icon>
              Mensagens Rápidas
            </v-tab>
          </v-tabs>

          <v-window v-model="userTab">
            <v-window-item value="basic">
              <v-form ref="userFormRef" v-model="userFormValid">
              <v-row class="mt-4">
                <!-- Upload de Foto -->
                <v-col cols="12" class="text-center">
                  <v-avatar size="120" class="mb-4">
                    <v-img v-if="userForm.photo" :src="userForm.photo" />
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
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="userForm.firstName"
                    label="Nome"
                    variant="outlined"
                    :rules="[v => !!v || 'Nome é obrigatório']"
                    required
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="userForm.lastName"
                    label="Sobrenome"
                    variant="outlined"
                    :rules="[v => !!v || 'Sobrenome é obrigatório']"
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
                    v-model="userForm.sector"
                    :items="sectorOptions"
                    label="Setor"
                    variant="outlined"
                    required
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
            </v-window-item>

            <!-- Aba Acesso -->
            <v-window-item value="access">
              <v-row class="mt-4">
                <v-col cols="12">
                  <h4 class="mb-3">Acesso ao Menu Lateral</h4>
                  <v-select
                    v-model="userForm.menuAccess"
                    :items="menuOptions"
                    label="Selecione as opções de menu"
                    variant="outlined"
                    multiple
                    chips
                    hint="Selecione quais seções o usuário terá acesso"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12">
                  <v-switch
                    v-model="userForm.autoCapitalization"
                    label="Capitalização Automática"
                    color="primary"
                    hint="Ativa capitalização automática da primeira letra em mensagens"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Aba Mensagens Rápidas -->
            <v-window-item value="messages">
              <v-row class="mt-4">
                <v-col cols="12">
                  <h4 class="mb-3">Configuração de Mensagens Rápidas</h4>
                  <div v-for="(message, index) in userForm.quickMessages" :key="index" class="mb-4">
                    <v-card variant="outlined">
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="4">
                            <v-text-field
                              v-model="message.shortcut"
                              label="Atalho"
                              variant="outlined"
                              hint="Ex: /saudacao"
                              persistent-hint
                            />
                          </v-col>
                          <v-col cols="12" md="8">
                            <v-textarea
                              v-model="message.text"
                              label="Mensagem"
                              variant="outlined"
                              rows="2"
                            />
                          </v-col>
                        </v-row>
                        <v-btn
                          color="error"
                          variant="text"
                          size="small"
                          @click="removeQuickMessage(index)"
                        >
                          <v-icon>mdi-delete</v-icon>
                          Remover
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </div>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    @click="addQuickMessage"
                    prepend-icon="mdi-plus"
                  >
                    Adicionar Mensagem Rápida
                  </v-btn>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeUserDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            :loading="savingUser"
            :disabled="!userFormValid"
          >
            {{ editingUser ? 'Atualizar' : 'Criar' }}
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
    const loadingCep = ref(false)
    const userTab = ref('basic')
    const photoFile = ref(null)
    
    // General Settings
    const generalSettings = reactive({
      companyName: '',
      cnpj: '',
      email: '',
      phone: '',
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      cityState: '',
      workingDays: [],
      startTime: '08:00',
      endTime: '18:00',
      saturdayStartTime: '09:00',
      saturdayEndTime: '13:00',
      saturdayOpen: false,
      sundayStartTime: '09:00',
      sundayEndTime: '13:00',
      sundayOpen: false
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
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user',
      sector: '',
      photo: '',
      isActive: true,
      menuAccess: [],
      autoCapitalization: false,
      quickMessages: []
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
    
    const sectorOptions = [
      'Comercial',
      'Suporte Técnico',
      'Montagem',
      'Financeiro',
      'RH',
      'Logística',
      'TI',
      'Desenvolvimento',
      'Gerência',
      'Diretoria'
    ]
    
    const menuOptions = [
      { title: 'Dashboard', value: 'dashboard' },
      { title: 'Chat', value: 'chat' },
      { title: 'Contatos', value: 'contacts' },
      { title: 'Relatórios', value: 'reports' },
      { title: 'Configurações', value: 'settings' },
      { title: 'Bot', value: 'bot' },
      { title: 'Conectar', value: 'connect' }
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
    const searchCep = async () => {
      const cep = generalSettings.cep.replace(/\D/g, '') // Remove caracteres não numéricos
      
      if (cep.length !== 8) {
        return // CEP deve ter 8 dígitos
      }
      
      loadingCep.value = true
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        
        if (data.erro) {
          console.warn('CEP não encontrado')
          return
        }
        
        // Preenche os campos automaticamente
        generalSettings.street = data.logradouro || ''
        generalSettings.neighborhood = data.bairro || ''
        generalSettings.cityState = `${data.localidade || ''}/${data.uf || ''}`
        
        console.log('Endereço preenchido automaticamente:', data)
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      } finally {
        loadingCep.value = false
      }
    }
    
    const saveGeneralSettings = async () => {
      saving.value = true
      try {
        const response = await fetch('http://localhost:3001/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(generalSettings)
        })
        
        if (!response.ok) {
          throw new Error('Erro ao salvar configurações')
        }
        
        const result = await response.json()
        console.log('Configurações salvas:', result)
        
        // Mostrar notificação de sucesso
        alert('Configurações salvas com sucesso!')
      } catch (error) {
        console.error('Erro ao salvar configurações gerais:', error)
        alert('Erro ao salvar configurações. Tente novamente.')
      } finally {
        saving.value = false
      }
    }
    
    const loadGeneralSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/settings')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar configurações')
        }
        
        const settings = await response.json()
        
        // Atualizar os dados reativos
        Object.assign(generalSettings, settings)
        
        console.log('Configurações carregadas:', settings)
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
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
      userForm.firstName = ''
      userForm.lastName = ''
      userForm.email = ''
      userForm.password = ''
      userForm.role = 'user'
      userForm.sector = ''
      userForm.photo = ''
      userForm.isActive = true
      userForm.menuAccess = []
      userForm.autoCapitalization = false
      userForm.quickMessages = []
      userDialog.value = true
    }
    
    const editUser = (user) => {
      editingUser.value = user
      userForm.firstName = user.firstName || ''
      userForm.lastName = user.lastName || ''
      userForm.email = user.email
      userForm.password = ''
      userForm.role = user.role
      userForm.sector = user.sector || ''
      userForm.photo = user.photo || ''
      userForm.isActive = user.isActive
      userForm.menuAccess = user.menuAccess || []
      userForm.autoCapitalization = user.autoCapitalization || false
      userForm.quickMessages = user.quickMessages || []
      userDialog.value = true
    }
    
    const saveUser = async () => {
      savingUser.value = true
      try {
        const url = editingUser.value 
          ? `http://localhost:3001/users/${editingUser.value.id}`
          : 'http://localhost:3001/users'
        
        const method = editingUser.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userForm)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao salvar usuário')
        }
        
        const result = await response.json()
        console.log('Usuário salvo:', result)
        
        await loadUsers()
        closeUserDialog()
        alert(editingUser.value ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!')
      } catch (error) {
        console.error('Erro ao salvar usuário:', error)
        alert(`Erro ao salvar usuário: ${error.message}`)
      } finally {
        savingUser.value = false
      }
    }
    
    const deleteUser = async (user) => {
      if (confirm(`Tem certeza que deseja excluir o usuário ${user.firstName}?`)) {
        try {
          const response = await fetch(`http://localhost:3001/users/${user.id}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            throw new Error('Erro ao excluir usuário')
          }
          
          await loadUsers()
          alert('Usuário excluído com sucesso!')
        } catch (error) {
          console.error('Erro ao excluir usuário:', error)
          alert('Erro ao excluir usuário. Tente novamente.')
        }
      }
    }
    
    const handlePhotoUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          userForm.photo = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const addQuickMessage = () => {
      userForm.quickMessages.push({
        shortcut: '',
        text: ''
      })
    }
    
    const removeQuickMessage = (index) => {
      userForm.quickMessages.splice(index, 1)
    }
    
    const closeUserDialog = () => {
      userDialog.value = false
      editingUser.value = false
      userTab.value = 'basic'
      photoFile.value = null
      // Reset form
      Object.assign(userForm, {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
        sector: '',
        photo: '',
        isActive: true,
        menuAccess: [],
        autoCapitalization: false,
        quickMessages: []
      })
    }
    
    const loadUsers = async () => {
      loadingUsers.value = true
      try {
        const response = await fetch('http://localhost:3001/users')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar usuários')
        }
        
        users.value = await response.json()
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        alert('Erro ao carregar usuários. Tente novamente.')
      } finally {
        loadingUsers.value = false
      }
    }
    
    onMounted(() => {
      loadUsers()
      loadGeneralSettings()
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
      loadingCep,
      userTab,
      photoFile,
      generalSettings,
      whatsappSettings,
      backupSettings,
      userForm,
      users,
      weekDays,
      whatsappProviders,
      retentionOptions,
      roleOptions,
      sectorOptions,
      menuOptions,
      userHeaders,
      emailRules,
      passwordRules,
      searchCep,
      loadGeneralSettings,
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
      deleteUser,
      handlePhotoUpload,
      addQuickMessage,
      removeQuickMessage,
      closeUserDialog
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

.special-hours-card {
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.special-hours-card:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
}
</style>