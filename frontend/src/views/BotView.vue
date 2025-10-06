<template>
  <div class="bot-page">
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" md="11" lg="10">
          <!-- Bot Header -->
          <div class="bot-header">
            <h2 class="bot-title">
              <v-icon class="mr-3">mdi-robot</v-icon>
              Bot
            </h2>
            <p class="bot-subtitle">Gerencie o atendimento automático e configure fluxos de conversação</p>
          </div>

          <!-- Bot Content -->
          <v-card class="bot-content" elevation="4">
            <!-- Bot Tabs -->
            <v-tabs
              v-model="activeTab"
              color="primary"
              class="bot-tabs"
              align-tabs="center"
              variant="elevated"
              grow
            >
              <v-tab value="leads" class="bot-tab">
                <v-icon start>mdi-account-group</v-icon>
                Leads no Fluxo
              </v-tab>
              <v-tab value="fluxograma" class="bot-tab">
                <v-icon start>mdi-sitemap</v-icon>
                Fluxograma
              </v-tab>
            </v-tabs>

            <v-card-text class="bot-tab-content">
              <!-- Aba Leads no Fluxo -->
              <div v-if="activeTab === 'leads'">
                <div class="leads-header">
                  <h3 class="section-title">
                    <v-icon class="mr-2">mdi-account-group</v-icon>
                    Leads em Conversação
                  </h3>
                  <p class="section-subtitle">Acompanhe todos os leads que estão interagindo com o bot</p>
                </div>

                <!-- Filtros e Estatísticas -->
                <div class="leads-stats">
                  <v-row>
                    <v-col cols="12" md="3">
                      <v-card class="stat-card" elevation="2">
                        <v-card-text class="text-center">
                          <v-icon size="32" color="primary" class="mb-2">mdi-account-multiple</v-icon>
                          <div class="stat-number">{{ totalLeads }}</div>
                          <div class="stat-label">Total de Leads</div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-card class="stat-card" elevation="2">
                        <v-card-text class="text-center">
                          <v-icon size="32" color="success" class="mb-2">mdi-chat-processing</v-icon>
                          <div class="stat-number">{{ activeConversations }}</div>
                          <div class="stat-label">Conversas Ativas</div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-card class="stat-card" elevation="2">
                        <v-card-text class="text-center">
                          <v-icon size="32" color="warning" class="mb-2">mdi-clock-outline</v-icon>
                          <div class="stat-number">{{ waitingLeads }}</div>
                          <div class="stat-label">Aguardando Resposta</div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-card class="stat-card" elevation="2">
                        <v-card-text class="text-center">
                          <v-icon size="32" color="info" class="mb-2">mdi-chart-line</v-icon>
                          <div class="stat-number">{{ conversionRate }}%</div>
                          <div class="stat-label">Taxa de Conversão</div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>

                <!-- Lista de Leads -->
                <div class="leads-list">
                  <v-card elevation="2">
                    <v-card-title>
                      <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
                      Lista de Leads
                      <v-spacer></v-spacer>
                      <v-text-field
                        v-model="searchLeads"
                        prepend-inner-icon="mdi-magnify"
                        label="Buscar leads..."
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="search-field"
                      />
                    </v-card-title>
                    <v-card-text>
                      <v-data-table
                        :headers="leadsHeaders"
                        :items="filteredLeads"
                        :search="searchLeads"
                        class="leads-table"
                        no-data-text="Nenhum lead encontrado"
                        loading-text="Carregando leads..."
                      >
                        <template v-slot:item.status="{ item }">
                          <v-chip
                            :color="getStatusColor(item.status)"
                            size="small"
                            variant="flat"
                          >
                            {{ getStatusText(item.status) }}
                          </v-chip>
                        </template>
                        <template v-slot:item.lastMessage="{ item }">
                          <div class="last-message-cell">
                            <div class="message-text">{{ item.lastMessage }}</div>
                            <div class="message-time">{{ formatTime(item.lastMessageTime) }}</div>
                          </div>
                        </template>
                        <template v-slot:item.actions="{ item }">
                          <v-btn
                            icon="mdi-eye"
                            size="small"
                            variant="text"
                            @click="viewLead(item)"
                          />
                          <v-btn
                            icon="mdi-chat"
                            size="small"
                            variant="text"
                            @click="chatWithLead(item)"
                          />
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </div>
              </div>

              <!-- Aba Fluxograma -->
              <div v-if="activeTab === 'fluxograma'">
                <div class="flowchart-header">
                  <h3 class="section-title">
                    <v-icon class="mr-2">mdi-sitemap</v-icon>
                    Configuração do Fluxograma
                  </h3>
                  <p class="section-subtitle">Configure o fluxo de perguntas e respostas para atendimento automático</p>
                </div>

                <!-- Controles do Fluxograma -->
                <div class="flowchart-controls">
                  <v-row>
                    <v-col cols="12" md="8">
                      <v-card elevation="2">
                        <v-card-title>
                          <v-icon class="mr-2">mdi-vector-square</v-icon>
                          Editor de Fluxograma
                        </v-card-title>
                        <v-card-text>
                          <div class="flowchart-placeholder">
                            <v-icon size="64" color="grey-lighten-1">mdi-sitemap</v-icon>
                            <h4 class="placeholder-title">Editor de Fluxograma</h4>
                            <p class="placeholder-text">
                              Aqui será implementado o editor visual de fluxograma para configurar
                              o fluxo de conversação do bot.
                            </p>
                            <v-btn color="primary" variant="outlined" class="mt-4">
                              <v-icon start>mdi-plus</v-icon>
                              Criar Novo Fluxo
                            </v-btn>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-card elevation="2">
                        <v-card-title>
                          <v-icon class="mr-2">mdi-cog</v-icon>
                          Configurações
                        </v-card-title>
                        <v-card-text>
                          <v-form>
                            <v-switch
                              v-model="botSettings.enabled"
                              label="Bot Ativo"
                              color="primary"
                              hide-details
                            />
                            <v-switch
                              v-model="botSettings.autoResponse"
                              label="Resposta Automática"
                              color="primary"
                              hide-details
                              class="mt-2"
                            />
                            <v-text-field
                              v-model="botSettings.welcomeMessage"
                              label="Mensagem de Boas-vindas"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mt-4"
                            />
                            <v-text-field
                              v-model="botSettings.timeoutMinutes"
                              label="Timeout (minutos)"
                              type="number"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mt-2"
                            />
                          </v-form>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>

                <!-- Fluxos Salvos -->
                <div class="saved-flows">
                  <v-card elevation="2">
                    <v-card-title>
                      <v-icon class="mr-2">mdi-content-save</v-icon>
                      Fluxos Salvos
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col
                          v-for="flow in savedFlows"
                          :key="flow.id"
                          cols="12"
                          md="6"
                          lg="4"
                        >
                          <v-card
                            class="flow-card"
                            elevation="1"
                            @click="editFlow(flow)"
                          >
                            <v-card-text>
                              <div class="flow-info">
                                <h4 class="flow-name">{{ flow.name }}</h4>
                                <p class="flow-description">{{ flow.description }}</p>
                                <div class="flow-meta">
                                  <v-chip size="small" :color="flow.active ? 'success' : 'grey'">
                                    {{ flow.active ? 'Ativo' : 'Inativo' }}
                                  </v-chip>
                                  <span class="flow-steps">{{ flow.steps }} etapas</span>
                                </div>
                              </div>
                            </v-card-text>
                            <v-card-actions>
                              <v-btn
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                @click.stop="editFlow(flow)"
                              />
                              <v-btn
                                icon="mdi-content-copy"
                                size="small"
                                variant="text"
                                @click.stop="duplicateFlow(flow)"
                              />
                              <v-spacer></v-spacer>
                              <v-btn
                                icon="mdi-delete"
                                size="small"
                                variant="text"
                                color="error"
                                @click.stop="deleteFlow(flow)"
                              />
                            </v-card-actions>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'BotView',
  setup() {
    // Estado das abas
    const activeTab = ref('leads')
    
    // Dados dos leads
    const searchLeads = ref('')
    const leads = ref([
      {
        id: 1,
        name: 'João Silva',
        phone: '+55 11 99999-9999',
        email: 'joao@email.com',
        status: 'active',
        lastMessage: 'Olá, gostaria de saber mais sobre os produtos',
        lastMessageTime: new Date(),
        flowStep: 'apresentacao',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        name: 'Maria Santos',
        phone: '+55 11 88888-8888',
        email: 'maria@email.com',
        status: 'waiting',
        lastMessage: 'Qual o preço do produto X?',
        lastMessageTime: new Date(Date.now() - 1800000),
        flowStep: 'precos',
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        id: 3,
        name: 'Pedro Costa',
        phone: '+55 11 77777-7777',
        email: 'pedro@email.com',
        status: 'completed',
        lastMessage: 'Obrigado pelas informações!',
        lastMessageTime: new Date(Date.now() - 900000),
        flowStep: 'finalizacao',
        createdAt: new Date(Date.now() - 10800000)
      },
      {
        id: 4,
        name: 'Ana Lima',
        phone: '+55 11 66666-6666',
        email: 'ana@email.com',
        status: 'active',
        lastMessage: 'Preciso de mais detalhes técnicos',
        lastMessageTime: new Date(Date.now() - 300000),
        flowStep: 'detalhes',
        createdAt: new Date(Date.now() - 1800000)
      }
    ])

    // Headers da tabela de leads
    const leadsHeaders = ref([
      { title: 'Nome', key: 'name', sortable: true, width: '15%' },
      { title: 'Telefone', key: 'phone', sortable: true, width: '15%' },
      { title: 'Status', key: 'status', sortable: true, width: '12%' },
      { title: 'Última Mensagem', key: 'lastMessage', sortable: false, width: '35%' },
      { title: 'Etapa do Fluxo', key: 'flowStep', sortable: true, width: '15%' },
      { title: 'Ações', key: 'actions', sortable: false, align: 'center', width: '8%' }
    ])

    // Configurações do bot
    const botSettings = ref({
      enabled: true,
      autoResponse: true,
      welcomeMessage: 'Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo?',
      timeoutMinutes: 30
    })

    // Fluxos salvos
    const savedFlows = ref([
      {
        id: 1,
        name: 'Fluxo de Vendas',
        description: 'Fluxo completo para captação e conversão de leads',
        active: true,
        steps: 8,
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        id: 2,
        name: 'Suporte Técnico',
        description: 'Fluxo para atendimento de suporte técnico',
        active: false,
        steps: 5,
        createdAt: new Date(Date.now() - 172800000)
      },
      {
        id: 3,
        name: 'Qualificação de Leads',
        description: 'Fluxo para qualificar leads qualificados',
        active: true,
        steps: 6,
        createdAt: new Date(Date.now() - 259200000)
      }
    ])

    // Computed properties
    const filteredLeads = computed(() => {
      if (!searchLeads.value) return leads.value
      return leads.value.filter(lead =>
        lead.name.toLowerCase().includes(searchLeads.value.toLowerCase()) ||
        lead.phone.includes(searchLeads.value) ||
        lead.email.toLowerCase().includes(searchLeads.value.toLowerCase())
      )
    })

    const totalLeads = computed(() => leads.value.length)
    const activeConversations = computed(() => 
      leads.value.filter(lead => lead.status === 'active').length
    )
    const waitingLeads = computed(() => 
      leads.value.filter(lead => lead.status === 'waiting').length
    )
    const conversionRate = computed(() => {
      const completed = leads.value.filter(lead => lead.status === 'completed').length
      return totalLeads.value > 0 ? Math.round((completed / totalLeads.value) * 100) : 0
    })

    // Métodos
    const getStatusColor = (status) => {
      const colors = {
        active: 'success',
        waiting: 'warning',
        completed: 'info',
        inactive: 'grey'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        active: 'Ativo',
        waiting: 'Aguardando',
        completed: 'Finalizado',
        inactive: 'Inativo'
      }
      return texts[status] || 'Desconhecido'
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const viewLead = (lead) => {
      console.log('Visualizar lead:', lead)
      // Implementar visualização detalhada do lead
    }

    const chatWithLead = (lead) => {
      console.log('Iniciar chat com lead:', lead)
      // Implementar redirecionamento para chat
    }

    const editFlow = (flow) => {
      console.log('Editar fluxo:', flow)
      // Implementar edição do fluxo
    }

    const duplicateFlow = (flow) => {
      console.log('Duplicar fluxo:', flow)
      // Implementar duplicação do fluxo
    }

    const deleteFlow = (flow) => {
      console.log('Deletar fluxo:', flow)
      // Implementar confirmação e exclusão do fluxo
    }

    return {
      activeTab,
      searchLeads,
      leads,
      leadsHeaders,
      filteredLeads,
      totalLeads,
      activeConversations,
      waitingLeads,
      conversionRate,
      botSettings,
      savedFlows,
      getStatusColor,
      getStatusText,
      formatTime,
      viewLead,
      chatWithLead,
      editFlow,
      duplicateFlow,
      deleteFlow
    }
  }
}
</script>

<style scoped>
.bot-page {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.bot-header {
  margin-bottom: 24px;
  text-align: center;
}

.bot-title {
  color: #0c1b23;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bot-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.bot-tabs {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px 16px 0 0;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
}

.bot-tab {
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
  gap: 8px;
  border-radius: 16px 16px 0 0;
  margin: 8px 4px 0 4px;
}

.bot-tab:hover {
  background: rgba(25, 118, 210, 0.08);
  transform: translateY(-1px);
}

.bot-tab.v-tab--selected {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2 !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
  transform: translateY(-2px);
  border: 2px solid #1976d2;
  border-radius: 16px 16px 0 0;
}

.bot-tab.v-tab--selected .v-icon {
  color: #1976d2 !important;
}

.bot-tab.v-tab--selected .v-tab__text {
  color: #1976d2 !important;
}

.bot-tab-content {
  padding: 24px;
  background: white;
  border-radius: 0 0 16px 16px;
  min-height: 500px;
}

.bot-content {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  min-height: 600px;
  max-height: none;
  overflow: hidden;
}

/* Hide the default tab slider */
.bot-tabs .v-tabs-slider {
  display: none;
}

.bot-tabs .v-tab {
  border-radius: 16px 16px 0 0;
  margin: 8px 4px 0 4px;
  position: relative;
}

/* Section Styles */
.section-title {
  color: #0c1b23;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.section-subtitle {
  color: #666;
  font-size: 14px;
  margin: 0 0 24px 0;
}

/* Leads Stats */
.leads-stats {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #0c1b23;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Leads List */
.leads-list {
  margin-top: 24px;
}

.search-field {
  max-width: 300px;
}

.leads-table {
  margin-top: 16px;
}

.last-message-cell {
  max-width: none;
  min-width: 250px;
}

.message-text {
  font-size: 14px;
  color: #333;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.4;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* Flowchart Styles */
.flowchart-controls {
  margin-bottom: 24px;
}

.flowchart-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.placeholder-title {
  color: #0c1b23;
  font-size: 18px;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.placeholder-text {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

/* Saved Flows */
.saved-flows {
  margin-top: 24px;
}

.flow-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.flow-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.flow-info {
  margin-bottom: 16px;
}

.flow-name {
  color: #0c1b23;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.flow-description {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.flow-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.flow-steps {
  font-size: 12px;
  color: #999;
}

/* Responsive Design */
@media (max-width: 768px) {
  .bot-page {
    padding: 16px;
  }
  
  .bot-tab-content {
    padding: 16px;
  }
  
  .leads-stats .v-col {
    margin-bottom: 16px;
  }
  
  .search-field {
    max-width: 100%;
    margin-top: 16px;
  }
}
</style>
