<template>
  <div class="settings-page">
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" md="11" lg="10">
          <!-- Settings Header -->
          <div class="settings-header">
            <h2 class="settings-title">
              <v-icon class="mr-3">mdi-cog</v-icon>
              Configurações
            </h2>
            <p class="settings-subtitle">Gerencie as configurações do sistema</p>
          </div>

          <!-- Settings Content -->
          <v-card class="settings-content" elevation="4">
            <!-- Settings Tabs -->
            <v-tabs
              v-model="activeTab"
              color="primary"
              class="settings-tabs"
              align-tabs="center"
              variant="elevated"
              grow
            >
              <v-tab value="geral" class="settings-tab">
                <v-icon start>mdi-information</v-icon>
                Geral
              </v-tab>
              <v-tab value="usuarios" class="settings-tab">
                <v-icon start>mdi-account-group</v-icon>
                Usuários
              </v-tab>
              <v-tab value="whatsapp" class="settings-tab">
                <v-icon start>mdi-whatsapp</v-icon>
                WhatsApp
              </v-tab>
              <v-tab value="manutencao" class="settings-tab">
                <v-icon start>mdi-wrench</v-icon>
                Manutenção
              </v-tab>
              <v-tab value="backup" class="settings-tab">
                <v-icon start>mdi-backup-restore</v-icon>
                Backup
              </v-tab>
            </v-tabs>

            <v-card-text class="settings-tab-content">
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
            <template v-slot:item.photo="{ item }">
              <v-avatar size="40">
                <v-img v-if="item.photo" :src="item.photo" />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
            </template>
            <template v-slot:item.fullName="{ item }">
              {{ `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Nome não informado' }}
            </template>
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
          
          <!-- API Mode Selector -->
          <v-card class="mb-6" variant="outlined">
            <v-card-title>
              <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
              Modo de API
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-card 
                    :color="apiMode === 'primary' ? 'primary' : 'grey-lighten-1'"
                    :variant="apiMode === 'primary' ? 'elevated' : 'outlined'"
                    class="api-mode-card"
                    @click="setApiMode('primary')"
                  >
                    <v-card-text class="text-center">
                      <v-icon size="48" :color="apiMode === 'primary' ? 'white' : 'primary'">
                        mdi-api
                      </v-icon>
                      <h4 class="mt-2" :style="{ color: apiMode === 'primary' ? 'white' : 'inherit' }">
                        API Principal
                      </h4>
                      <p :style="{ color: apiMode === 'primary' ? 'rgba(255,255,255,0.8)' : '#666' }">
                        API oficial do WhatsApp (Meta, Twilio, etc.)
                      </p>
                      <v-chip 
                        v-if="apiMode === 'primary'"
                        color="white"
                        text-color="primary"
                        size="small"
                      >
                        Ativa
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card 
                    :color="apiMode === 'secondary' ? 'success' : 'grey-lighten-1'"
                    :variant="apiMode === 'secondary' ? 'elevated' : 'outlined'"
                    class="api-mode-card"
                    @click="setApiMode('secondary')"
                  >
                    <v-card-text class="text-center">
                      <v-icon size="48" :color="apiMode === 'secondary' ? 'white' : 'success'">
                        mdi-whatsapp
                      </v-icon>
                      <h4 class="mt-2" :style="{ color: apiMode === 'secondary' ? 'white' : 'inherit' }">
                        API Secundária
                      </h4>
                      <p :style="{ color: apiMode === 'secondary' ? 'rgba(255,255,255,0.8)' : '#666' }">
                        WhatsApp Web.js (Temporário)
                      </p>
                      <v-chip 
                        v-if="apiMode === 'secondary'"
                        color="white"
                        text-color="success"
                        size="small"
                      >
                        Ativa
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <v-alert 
                v-if="apiMode === 'secondary'"
                type="info" 
                variant="tonal" 
                class="mt-4"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-information</v-icon>
                </template>
                <div>
                  <strong>API Secundária Ativa:</strong> Usando WhatsApp Web.js como solução temporária.
                  <br>
                  <strong>Para conectar:</strong> Acesse a página <router-link to="/connect" class="text-decoration-none">Conectar</router-link> e escaneie o QR Code.
                </div>
              </v-alert>
            </v-card-text>
          </v-card>
          
          <!-- Primary API Configuration -->
          <v-card v-if="apiMode === 'primary'" variant="outlined">
            <v-card-title>
              <v-icon class="mr-2">mdi-cog</v-icon>
              Configurações da API Principal
            </v-card-title>
            <v-card-text>
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
            </v-card-text>
          </v-card>
          
          <!-- Secondary API Status -->
          <v-card v-if="apiMode === 'secondary'" variant="outlined">
            <v-card-title>
              <v-icon class="mr-2">mdi-whatsapp</v-icon>
              Status da API Secundária (WhatsApp Web.js)
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-chip 
                    :color="secondaryApiStatus.isConnected ? 'success' : 'warning'"
                    variant="tonal"
                    size="large"
                    class="mb-2"
                  >
                    <v-icon start>{{ secondaryApiStatus.isConnected ? 'mdi-check-circle' : 'mdi-clock' }}</v-icon>
                    {{ secondaryApiStatus.isConnected ? 'Conectado' : 'Aguardando Conexão' }}
                  </v-chip>
                </v-col>
                <v-col cols="12" md="6">
                  <v-chip 
                    :color="getStatusColor(secondaryApiStatus.status)"
                    variant="tonal"
                    size="large"
                  >
                    <v-icon start>{{ getStatusIcon(secondaryApiStatus.status) }}</v-icon>
                    {{ getStatusText(secondaryApiStatus.status) }}
                  </v-chip>
                </v-col>
              </v-row>
              
              <div class="mt-4">
                <v-btn
                  color="primary"
                  @click="goToConnect"
                  class="mr-2"
                >
                  <v-icon start>mdi-link</v-icon>
                  Ir para Página de Conexão
                </v-btn>
                <v-btn
                  color="info"
                  @click="refreshSecondaryStatus"
                  :loading="refreshingSecondary"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  Atualizar Status
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

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
                    @click="openDataCleanupModal"
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
                    @click="openLogsDownloadModal"
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

          <div class="action-buttons">
            <v-btn
              color="primary"
              @click="saveBackupSettings"
              :loading="saving"
            >
              Salvar Configurações
            </v-btn>
          </div>

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
    </v-col>
  </v-row>
</v-container>
</div>

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
          >
            {{ editingUser ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Limpeza de Dados -->
    <v-dialog v-model="dataCleanupModal" max-width="500px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-database</v-icon>
          Limpeza de Dados Antigos
        </v-card-title>
        
        <v-card-text>
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-alert</v-icon>
            </template>
            <div>
              <strong>Atenção:</strong> Esta ação irá remover permanentemente todos os dados anteriores à data selecionada. 
              Esta ação não pode ser desfeita.
            </div>
          </v-alert>
          
          <v-form ref="dataCleanupForm" v-model="dataCleanupFormValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="dataCleanupDate"
                  label="Data Limite"
                  type="date"
                  variant="outlined"
                  :rules="[v => !!v || 'Data é obrigatória']"
                  required
                  hint="Todos os dados anteriores a esta data serão removidos"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="dataCleanupType"
                  :items="dataCleanupTypes"
                  label="Tipo de Dados"
                  variant="outlined"
                  :rules="[v => !!v || 'Tipo é obrigatório']"
                  required
                  hint="Selecione quais tipos de dados devem ser removidos"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeDataCleanupModal">Cancelar</v-btn>
          <v-btn
            color="warning"
            @click="confirmDataCleanup"
            :loading="cleaning"
            :disabled="!dataCleanupFormValid"
          >
            Confirmar Limpeza
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Download de Logs -->
    <v-dialog v-model="logsDownloadModal" max-width="500px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-log</v-icon>
          Download de Logs
        </v-card-title>
        
        <v-card-text>
          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <div>
              Selecione o período dos logs que deseja baixar. Os logs serão compactados em um arquivo ZIP.
            </div>
          </v-alert>
          
          <v-form ref="logsDownloadForm" v-model="logsDownloadFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="logsStartDate"
                  label="Data Inicial"
                  type="date"
                  variant="outlined"
                  :rules="[v => !!v || 'Data inicial é obrigatória']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="logsEndDate"
                  label="Data Final"
                  type="date"
                  variant="outlined"
                  :rules="[v => !!v || 'Data final é obrigatória']"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="logsLevel"
                  :items="logsLevels"
                  label="Nível de Log"
                  variant="outlined"
                  hint="Selecione o nível mínimo de log a ser incluído"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="logsFormat"
                  :items="logsFormats"
                  label="Formato do Arquivo"
                  variant="outlined"
                  hint="Escolha o formato de saída dos logs"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeLogsDownloadModal">Cancelar</v-btn>
          <v-btn
            color="secondary"
            @click="confirmLogsDownload"
            :loading="downloadingLogs"
            :disabled="!logsDownloadFormValid"
          >
            Baixar Logs
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    
    // Modais de manutenção
    const dataCleanupModal = ref(false)
    const logsDownloadModal = ref(false)
    const dataCleanupFormValid = ref(false)
    const logsDownloadFormValid = ref(false)
    
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
    
    // API Mode
    const apiMode = ref('secondary') // Default to secondary since it's the only one working
    const secondaryApiStatus = ref({
      isConnected: false,
      status: 'disconnected'
    })
    const refreshingSecondary = ref(false)
    
    
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
    
    // Data Cleanup Form
    const dataCleanupDate = ref('')
    const dataCleanupType = ref('')
    
    // Logs Download Form
    const logsStartDate = ref('')
    const logsEndDate = ref('')
    const logsLevel = ref('info')
    const logsFormat = ref('txt')
    
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
    
    const dataCleanupTypes = [
      { title: 'Todas as Mensagens', value: 'messages' },
      { title: 'Logs do Sistema', value: 'logs' },
      { title: 'Dados de Usuários Inativos', value: 'inactive_users' },
      { title: 'Arquivos Temporários', value: 'temp_files' },
      { title: 'Cache e Sessões', value: 'cache_sessions' },
      { title: 'Todos os Dados Antigos', value: 'all' }
    ]
    
    const logsLevels = [
      { title: 'Debug (Todos)', value: 'debug' },
      { title: 'Info (Info, Warn, Error)', value: 'info' },
      { title: 'Warn (Warn, Error)', value: 'warn' },
      { title: 'Error (Apenas Erros)', value: 'error' }
    ]
    
    const logsFormats = [
      { title: 'Texto (.txt)', value: 'txt' },
      { title: 'JSON (.json)', value: 'json' },
      { title: 'CSV (.csv)', value: 'csv' }
    ]
    
    const userHeaders = [
      { title: 'Foto', key: 'photo', sortable: false },
      { title: 'Nome', key: 'fullName' },
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
        const response = await fetch('http://localhost:3001/settings/whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(whatsappSettings)
        })
        
        if (!response.ok) {
          throw new Error('Erro ao salvar configurações')
        }
        
        const result = await response.json()
        console.log('✅ Configurações WhatsApp salvas:', result)
        alert('Configurações salvas com sucesso!')
      } catch (error) {
        console.error('Erro ao salvar configurações WhatsApp:', error)
        alert('Erro ao salvar configurações: ' + error.message)
      } finally {
        saving.value = false
      }
    }
    
    const testConnection = async () => {
      testing.value = true
      try {
        const response = await fetch('http://localhost:3001/whatsapp/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            provider: whatsappSettings.provider,
            apiUrl: whatsappSettings.apiUrl,
            apiKey: whatsappSettings.apiKey
          })
        })
        
        if (!response.ok) {
          throw new Error('Erro no teste de conexão')
        }
        
        const result = await response.json()
        console.log('🧪 Resultado do teste:', result)
        
        if (result.success) {
          alert(`✅ Teste de conexão bem-sucedido!\nStatus: ${result.status}\nMensagem: ${result.message}`)
        } else {
          alert(`❌ Falha no teste de conexão!\nErro: ${result.message}`)
        }
      } catch (error) {
        console.error('Erro no teste de conexão:', error)
        alert('Erro no teste de conexão: ' + error.message)
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
    
    const openDataCleanupModal = () => {
      // Definir data padrão como 30 dias atrás
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() - 30)
      dataCleanupDate.value = defaultDate.toISOString().split('T')[0]
      dataCleanupType.value = 'all'
      dataCleanupModal.value = true
    }
    
    const closeDataCleanupModal = () => {
      dataCleanupModal.value = false
      dataCleanupDate.value = ''
      dataCleanupType.value = ''
    }
    
    const confirmDataCleanup = async () => {
      cleaning.value = true
      try {
        const response = await fetch('http://localhost:3001/maintenance/cleanup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: dataCleanupDate.value,
            type: dataCleanupType.value
          })
        })
        
        if (!response.ok) {
          throw new Error('Erro na limpeza de dados')
        }
        
        const result = await response.json()
        console.log('Limpeza de dados realizada:', result)
        alert('Limpeza de dados realizada com sucesso!')
        closeDataCleanupModal()
      } catch (error) {
        console.error('Erro na limpeza de dados:', error)
        alert('Erro na limpeza de dados: ' + error.message)
      } finally {
        cleaning.value = false
      }
    }
    
    const cleanOldData = async () => {
      // Função mantida para compatibilidade, mas agora redireciona para o modal
      openDataCleanupModal()
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
    
    const openLogsDownloadModal = () => {
      // Definir datas padrão (últimos 7 dias)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      
      logsStartDate.value = startDate.toISOString().split('T')[0]
      logsEndDate.value = endDate.toISOString().split('T')[0]
      logsLevel.value = 'info'
      logsFormat.value = 'txt'
      logsDownloadModal.value = true
    }
    
    const closeLogsDownloadModal = () => {
      logsDownloadModal.value = false
      logsStartDate.value = ''
      logsEndDate.value = ''
      logsLevel.value = 'info'
      logsFormat.value = 'txt'
    }
    
    const confirmLogsDownload = async () => {
      downloadingLogs.value = true
      try {
        const response = await fetch('http://localhost:3001/maintenance/logs/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            startDate: logsStartDate.value,
            endDate: logsEndDate.value,
            level: logsLevel.value,
            format: logsFormat.value
          })
        })
        
        if (!response.ok) {
          throw new Error('Erro ao baixar logs')
        }
        
        // Criar blob e fazer download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `logs_${logsStartDate.value}_to_${logsEndDate.value}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        console.log('Logs baixados com sucesso')
        alert('Download dos logs iniciado!')
        closeLogsDownloadModal()
      } catch (error) {
        console.error('Erro ao baixar logs:', error)
        alert('Erro ao baixar logs: ' + error.message)
      } finally {
        downloadingLogs.value = false
      }
    }
    
    const downloadLogs = async () => {
      // Função mantida para compatibilidade, mas agora redireciona para o modal
      openLogsDownloadModal()
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
        const response = await fetch('http://localhost:3001/backup/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            frequency: backupSettings.frequency,
            retention: backupSettings.retention,
            startDate: backupSettings.startDate,
            endDate: backupSettings.endDate
          })
        })
        
        if (!response.ok) {
          throw new Error('Erro ao exportar backup')
        }
        
        // Criar blob e fazer download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `aizap_backup_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        console.log('Backup exportado com sucesso')
        alert('Backup exportado com sucesso!')
      } catch (error) {
        console.error('Erro ao exportar backup:', error)
        alert('Erro ao exportar backup: ' + error.message)
      } finally {
        exporting.value = false
      }
    }
    
    const importBackup = async () => {
      if (!importFile.value) {
        alert('Por favor, selecione um arquivo de backup')
        return
      }
      
      importing.value = true
      try {
        const fileContent = await readFileContent(importFile.value)
        const backupData = JSON.parse(fileContent)
        
        const response = await fetch('http://localhost:3001/backup/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backupData)
        })
        
        if (!response.ok) {
          throw new Error('Erro ao importar backup')
        }
        
        const result = await response.json()
        console.log('Backup importado:', result)
        alert(`Backup importado com sucesso! ${result.importedCount} registros importados.`)
        importFile.value = null
      } catch (error) {
        console.error('Erro ao importar backup:', error)
        alert('Erro ao importar backup: ' + error.message)
      } finally {
        importing.value = false
      }
    }
    
    const readFileContent = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsText(file)
      })
    }
    
    const viewBackupHistory = async () => {
      try {
        const response = await fetch('http://localhost:3001/backup/history')
        
        if (!response.ok) {
          throw new Error('Erro ao buscar histórico de backups')
        }
        
        const history = await response.json()
        
        if (history.length === 0) {
          alert('Nenhum backup encontrado no histórico.')
          return
        }
        
        // Criar uma string com o histórico
        let historyText = 'Histórico de Backups:\n\n'
        history.forEach((item, index) => {
          historyText += `${index + 1}. ${item.type === 'export' ? 'Exportação' : 'Importação'}\n`
          historyText += `   Data: ${new Date(item.createdAt || item.importedAt).toLocaleString()}\n`
          if (item.filename) historyText += `   Arquivo: ${item.filename}\n`
          if (item.recordsCount) historyText += `   Registros: ${item.recordsCount}\n`
          historyText += '\n'
        })
        
        alert(historyText)
      } catch (error) {
        console.error('Erro ao buscar histórico de backups:', error)
        alert('Erro ao buscar histórico de backups: ' + error.message)
      }
    }
    
    const saveBackupSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/backup/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backupSettings)
        })
        
        if (!response.ok) {
          throw new Error('Erro ao salvar configurações de backup')
        }
        
        console.log('Configurações de backup salvas')
        alert('Configurações de backup salvas com sucesso!')
      } catch (error) {
        console.error('Erro ao salvar configurações de backup:', error)
        alert('Erro ao salvar configurações: ' + error.message)
      }
    }
    
    const loadBackupSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/backup/settings')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar configurações de backup')
        }
        
        const settings = await response.json()
        
        // Atualizar os dados reativos
        Object.assign(backupSettings, settings)
        
        console.log('Configurações de backup carregadas:', settings)
      } catch (error) {
        console.error('Erro ao carregar configurações de backup:', error)
      }
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
    
    const loadWhatsAppSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/settings/whatsapp')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar configurações WhatsApp')
        }
        
        const settings = await response.json()
        
        // Atualizar os dados reativos
        Object.assign(whatsappSettings, settings)
        
        console.log('📱 Configurações WhatsApp carregadas:', settings)
      } catch (error) {
        console.error('Erro ao carregar configurações WhatsApp:', error)
      }
    }
    
    // API Mode Functions
    const setApiMode = (mode) => {
      apiMode.value = mode
      console.log('🔄 Modo de API alterado para:', mode)
      
      if (mode === 'secondary') {
        refreshSecondaryStatus()
      }
    }
    
    const refreshSecondaryStatus = async () => {
      refreshingSecondary.value = true
      
      try {
        const response = await fetch('http://localhost:3001/whatsapp/status')
        
        if (!response.ok) {
          throw new Error('Erro ao obter status da API secundária')
        }
        
        const status = await response.json()
        secondaryApiStatus.value = status
        
        console.log('📊 Status da API secundária atualizado:', status)
        
      } catch (error) {
        console.error('Erro ao atualizar status da API secundária:', error)
      } finally {
        refreshingSecondary.value = false
      }
    }
    
    const goToConnect = () => {
      // Navigate to connect page
      window.location.href = '/connect'
    }
    
    // Helper functions for status
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
    

    onMounted(() => {
      loadUsers()
      loadGeneralSettings()
      loadWhatsAppSettings()
      loadBackupSettings()
      refreshSecondaryStatus() // Load secondary API status
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
      dataCleanupFormValid,
      logsDownloadFormValid,
      userDialog,
      editingUser,
      importFile,
      loadingCep,
      userTab,
      photoFile,
      dataCleanupModal,
      logsDownloadModal,
      dataCleanupDate,
      dataCleanupType,
      logsStartDate,
      logsEndDate,
      logsLevel,
      logsFormat,
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
      dataCleanupTypes,
      logsLevels,
      logsFormats,
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
      openDataCleanupModal,
      closeDataCleanupModal,
      confirmDataCleanup,
      clearCache,
      downloadLogs,
      openLogsDownloadModal,
      closeLogsDownloadModal,
      confirmLogsDownload,
      restartServices,
      exportBackup,
      importBackup,
      viewBackupHistory,
      saveBackupSettings,
      loadBackupSettings,
      readFileContent,
      openUserDialog,
      editUser,
      saveUser,
      deleteUser,
      handlePhotoUpload,
      addQuickMessage,
      removeQuickMessage,
      closeUserDialog,
      // API Mode
      apiMode,
      secondaryApiStatus,
      refreshingSecondary,
      setApiMode,
      refreshSecondaryStatus,
      goToConnect,
      getStatusColor,
      getStatusIcon,
      getStatusText
    }
  }
}
</script>

<style scoped>
.settings-page {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}


.settings-header {
  margin-bottom: 24px;
  text-align: center;
}

.settings-title {
  color: #0c1b23;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.settings-tabs {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px 12px 0 0;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.settings-tab {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  min-height: 56px;
  padding: 0 16px;
  transition: all 0.3s ease;
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-tab:hover {
  background: rgba(25, 118, 210, 0.08);
  transform: translateY(-1px);
}

.settings-tab.v-tab--selected {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2 !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
  transform: translateY(-2px);
  border: 2px solid #1976d2;
}

.settings-tab.v-tab--selected .v-icon {
  color: #1976d2 !important;
}

.settings-tab.v-tab--selected .v-tab__text {
  color: #1976d2 !important;
}

.settings-tab-content {
  padding: 24px;
  background: white;
  border-radius: 0 0 12px 12px;
  min-height: 500px;
}

.settings-content {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  min-height: 600px;
  max-height: none;
  overflow: hidden;
}

/* Estilos específicos para as abas */
.settings-tabs .v-tabs-slider {
  display: none;
}

.settings-tabs .v-tab {
  border-radius: 8px 8px 0 0;
  margin: 8px 2px 0 2px;
  position: relative;
  overflow: hidden;
  flex: 1;
  max-width: none;
}

.settings-tabs .v-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.settings-tabs .v-tab:hover::before {
  opacity: 1;
}

.settings-tabs .v-tab--selected::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
}

/* Ícones das abas */
.settings-tab .v-icon {
  margin-right: 8px;
  transition: all 0.3s ease;
}

.settings-tab:hover .v-icon {
  transform: scale(1.1);
}

.settings-tab.v-tab--selected .v-icon {
  transform: scale(1.15);
  filter: drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3));
  color: #1976d2 !important;
}

/* Garantir que o texto seja sempre visível */
.settings-tab.v-tab--selected * {
  color: #1976d2 !important;
}

.settings-tab.v-tab--selected .v-tab__content {
  color: #1976d2 !important;
}

.settings-tab.v-tab--selected .v-tab__wrapper {
  color: #1976d2 !important;
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

/* API Mode Cards */
.api-mode-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.api-mode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.api-mode-card[data-selected="true"] {
  border-color: #1976d2;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.2);
}

/* Responsividade das abas */
@media (max-width: 768px) {
  .settings-tabs {
    padding: 0;
  }
  
  .settings-tab {
    min-height: 48px;
    padding: 0 8px;
    font-size: 14px;
    flex: 1;
  }
  
  .settings-tab .v-icon {
    margin-right: 4px;
    font-size: 16px;
  }
}

@media (max-width: 600px) {
  .settings-tabs {
    flex-wrap: nowrap;
    justify-content: space-between;
  }
  
  .settings-tab {
    flex: 1;
    min-width: 0;
    margin: 4px 1px 0 1px;
    padding: 0 4px;
    font-size: 12px;
  }
  
  .settings-tab .v-icon {
    margin-right: 2px;
    font-size: 14px;
  }
  
  .settings-tab-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .settings-tab {
    font-size: 11px;
    padding: 0 2px;
  }
  
  .settings-tab .v-icon {
    font-size: 12px;
    margin-right: 1px;
  }
}
</style>