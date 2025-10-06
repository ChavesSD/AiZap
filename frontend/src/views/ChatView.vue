<template>
  <div class="chat-container">
    <!-- Conversations Sidebar - Always Visible -->
    <div class="conversations-sidebar">
      <div class="conversations-header">
        <v-tabs
          v-model="activeTab"
          color="primary"
          class="conversation-tabs"
          align-tabs="center"
          variant="elevated"
          grow
        >
          <v-tab value="atendimento" class="conversation-tab">
            <v-icon>mdi-account-check</v-icon>
            <v-chip size="small" color="primary" class="ml-2 tab-count">
              {{ getContactCount('atendimento') }}
            </v-chip>
          </v-tab>
          <v-tab value="aguardando" class="conversation-tab">
            <v-icon>mdi-clock-outline</v-icon>
            <v-chip size="small" color="warning" class="ml-2 tab-count">
              {{ getContactCount('aguardando') }}
            </v-chip>
          </v-tab>
          <v-tab value="finalizado" class="conversation-tab">
            <v-icon>mdi-check-circle</v-icon>
            <v-chip size="small" color="success" class="ml-2 tab-count">
              {{ getContactCount('finalizado') }}
            </v-chip>
          </v-tab>
        </v-tabs>
      </div>
      <div class="conversations-list">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          :class="['conversation-item', { 'active': selectedContact.id === contact.id }]"
          @click="selectContact(contact)"
        >
          <v-avatar :color="contact.color" size="40">
            <span class="text-white">{{ contact.name.charAt(0) }}</span>
          </v-avatar>
          <div class="conversation-info">
            <div class="contact-name">{{ contact.name }}</div>
            <div class="last-message">{{ contact.lastMessage }}</div>
          </div>
          <div class="conversation-meta">
            <div class="message-time">{{ formatTime(contact.lastMessageTime) }}</div>
            <v-chip v-if="contact.unreadCount > 0" color="primary" size="small">
              {{ contact.unreadCount }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="chat-area">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="chat-info">
          <v-avatar :color="selectedContact.color" size="40">
            <span class="text-white">{{ selectedContact.name.charAt(0) }}</span>
          </v-avatar>
          <div class="chat-details">
            <h3 class="chat-title">{{ selectedContact.name }}</h3>
            <span class="chat-status">{{ selectedContact.status }}</span>
          </div>
        </div>
        <div class="chat-actions">
          <v-btn icon="mdi-phone" variant="text" />
          <v-btn icon="mdi-video" variant="text" />
          <v-btn 
            icon="mdi-account-switch"
            variant="text"
            @click="transferChat"
            class="action-btn"
          />
          <v-btn 
            icon="mdi-close"
            variant="text"
            color="error"
            @click="endChat"
            class="action-btn"
          />
        </div>
      </div>

    <!-- Chat Messages -->
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', 
          message.sender === 'user' ? 'user-message' : 
          message.sender === 'system' ? 'system-message' : 
          'bot-message'
        ]"
      >
        <div class="message-content">
          <div class="message-text">{{ message.text }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="chat-input">
      <!-- Input Actions -->
      <div class="input-actions">
        <v-btn
          icon="mdi-emoticon-happy"
          variant="text"
          @click="showEmojis = !showEmojis"
          class="action-btn"
        />
        <v-btn
          icon="mdi-paperclip"
          variant="text"
          @click="showAttachments = !showAttachments"
          class="action-btn"
        />
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <v-textarea
          v-model="newMessage"
          placeholder="Digite sua mensagem..."
          variant="outlined"
          rows="1"
          auto-grow
          hide-details
          class="message-input"
          @keydown.enter.prevent="sendMessage"
          @input="handleInput"
        />
      </div>

      <!-- Send Actions -->
      <div class="send-actions">
        <v-btn
          v-if="!isRecording"
          icon="mdi-microphone"
          variant="text"
          @mousedown="startRecording"
          @mouseup="stopRecording"
          @mouseleave="stopRecording"
          class="record-btn"
        />
        <v-btn
          v-else
          icon="mdi-stop"
          variant="text"
          color="error"
          @click="stopRecording"
          class="record-btn"
        />
        <v-btn
          icon="mdi-send"
          color="primary"
          variant="flat"
          :disabled="!newMessage.trim() && !isRecording"
          @click="sendMessage"
          class="send-btn"
        />
      </div>
    </div>

    <!-- Emojis Panel -->
    <div v-if="showEmojis" class="emojis-panel">
      <div class="emojis-grid">
        <span
          v-for="emoji in emojis"
          :key="emoji"
          class="emoji-item"
          @click="addEmoji(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>

    <!-- Attachments Panel -->
    <div v-if="showAttachments" class="attachments-panel">
      <div class="attachment-options">
        <v-btn prepend-icon="mdi-image" variant="text" @click="selectFile('image')">
          Foto
        </v-btn>
        <v-btn prepend-icon="mdi-file" variant="text" @click="selectFile('document')">
          Documento
        </v-btn>
        <v-btn prepend-icon="mdi-video" variant="text" @click="selectFile('video')">
          Vídeo
        </v-btn>
        <v-btn prepend-icon="mdi-map-marker" variant="text" @click="sendLocation">
          Localização
        </v-btn>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ChatView',
  setup() {
    const authStore = useAuthStore()
    const messages = ref([
      {
        id: 1,
        text: 'Olá! Bem-vindo ao AiZap. Como posso ajudá-lo hoje?',
        sender: 'bot',
        timestamp: new Date()
      }
    ])
    
    const newMessage = ref('')
    const messagesContainer = ref(null)
    
    // Conversations
    const activeTab = ref('atendimento')
    const selectedContact = ref({
      id: 1,
      name: 'Chat Principal',
      status: 'Conectado',
      color: 'primary'
    })
    
    const allContacts = ref([
      {
        id: 1,
        name: 'Chat Principal',
        status: 'Conectado',
        color: 'primary',
        lastMessage: 'Olá! Bem-vindo ao AiZap.',
        lastMessageTime: new Date(),
        unreadCount: 0,
        category: 'atendimento'
      },
      {
        id: 2,
        name: 'João Silva',
        status: 'Online',
        color: 'success',
        lastMessage: 'Tudo bem?',
        lastMessageTime: new Date(Date.now() - 300000),
        unreadCount: 2,
        category: 'atendimento'
      },
      {
        id: 3,
        name: 'Maria Santos',
        status: 'Offline',
        color: 'warning',
        lastMessage: 'Até logo!',
        lastMessageTime: new Date(Date.now() - 600000),
        unreadCount: 0,
        category: 'aguardando'
      },
      {
        id: 4,
        name: 'Pedro Costa',
        status: 'Offline',
        color: 'info',
        lastMessage: 'Obrigado pelo atendimento!',
        lastMessageTime: new Date(Date.now() - 900000),
        unreadCount: 0,
        category: 'finalizado'
      },
      {
        id: 5,
        name: 'Ana Lima',
        status: 'Offline',
        color: 'error',
        lastMessage: 'Problema resolvido',
        lastMessageTime: new Date(Date.now() - 1200000),
        unreadCount: 0,
        category: 'finalizado'
      }
    ])
    
    // Computed para filtrar contatos por aba
    const contacts = computed(() => {
      return allContacts.value.filter(contact => contact.category === activeTab.value)
    })
    
    // Função para contar contatos por categoria
    const getContactCount = (category) => {
      return allContacts.value.filter(contact => contact.category === category).length
    }
    
    // Emojis and Attachments
    const showEmojis = ref(false)
    const showAttachments = ref(false)
    const isRecording = ref(false)
    
    const emojis = ref(['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'])
    
    const sendMessage = () => {
      if (!newMessage.value.trim()) return
      
      // Processar mensagens rápidas primeiro
      let messageText = processQuickMessages(newMessage.value.trim())
      
      // Aplicar capitalização automática se habilitada
      if (authStore.user?.autoCapitalization) {
        messageText = capitalizeFirstLetter(messageText)
      }
      
      const message = {
        id: Date.now(),
        text: messageText,
        sender: 'user',
        timestamp: new Date()
      }
      
      messages.value.push(message)
      newMessage.value = ''
      showEmojis.value = false
      showAttachments.value = false
      
      // Scroll to bottom
      nextTick(() => {
        scrollToBottom()
      })
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: 'Obrigado pela sua mensagem! Estou aqui para ajudar.',
          sender: 'bot',
          timestamp: new Date()
        }
        messages.value.push(botResponse)
        nextTick(() => {
          scrollToBottom()
        })
      }, 1000)
    }
    
    const selectContact = (contact) => {
      selectedContact.value = contact
      // Reset messages for new contact
      messages.value = [
        {
          id: 1,
          text: `Conversa iniciada com ${contact.name}`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]
    }
    
    
    const transferChat = () => {
      // Simulate chat transfer
      const message = {
        id: Date.now(),
        text: '[SISTEMA] Atendimento transferido para outro agente',
        sender: 'system',
        timestamp: new Date(),
        type: 'system'
      }
      messages.value.push(message)
      nextTick(() => {
        scrollToBottom()
      })
    }
    
    const endChat = () => {
      // Simulate chat end
      const message = {
        id: Date.now(),
        text: '[SISTEMA] Atendimento finalizado',
        sender: 'system',
        timestamp: new Date(),
        type: 'system'
      }
      messages.value.push(message)
      nextTick(() => {
        scrollToBottom()
      })
    }
    
    const addEmoji = (emoji) => {
      newMessage.value += emoji
      showEmojis.value = false
    }
    
    const selectFile = (type) => {
      showAttachments.value = false
      // Simulate file selection
      const message = {
        id: Date.now(),
        text: `[${type.toUpperCase()}] Arquivo anexado`,
        sender: 'user',
        timestamp: new Date(),
        type: 'attachment'
      }
      messages.value.push(message)
      nextTick(() => {
        scrollToBottom()
      })
    }
    
    const sendLocation = () => {
      showAttachments.value = false
      const message = {
        id: Date.now(),
        text: '[LOCALIZAÇÃO] Localização compartilhada',
        sender: 'user',
        timestamp: new Date(),
        type: 'location'
      }
      messages.value.push(message)
      nextTick(() => {
        scrollToBottom()
      })
    }
    
    const startRecording = () => {
      isRecording.value = true
      // Simulate recording start
      console.log('Recording started...')
    }
    
    const stopRecording = () => {
      if (isRecording.value) {
        isRecording.value = false
        // Simulate recording stop and send
        const message = {
          id: Date.now(),
          text: '[ÁUDIO] Mensagem de voz enviada',
          sender: 'user',
          timestamp: new Date(),
          type: 'audio'
        }
        messages.value.push(message)
        nextTick(() => {
          scrollToBottom()
        })
      }
    }
    
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }
    
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const capitalizeFirstLetter = (text) => {
      if (!text || text.length === 0) return text
      return text.charAt(0).toUpperCase() + text.slice(1)
    }
    
    // Função para detectar e substituir atalhos de mensagens rápidas
    const processQuickMessages = (text) => {
      if (!authStore.user?.quickMessages || authStore.user.quickMessages.length === 0) {
        return text
      }
      
      let processedText = text
      
      // Procurar por atalhos no texto
      authStore.user.quickMessages.forEach(quickMessage => {
        if (quickMessage.shortcut && quickMessage.text) {
          // Criar regex para encontrar o atalho no início da linha ou após espaço
          const shortcutRegex = new RegExp(`(^|\\s)${quickMessage.shortcut}(?=\\s|$)`, 'g')
          processedText = processedText.replace(shortcutRegex, `$1${quickMessage.text}`)
        }
      })
      
      return processedText
    }
    
    // Função para lidar com input em tempo real
    const handleInput = (event) => {
      const inputValue = event.target.value
      console.log('🔍 Input detectado:', inputValue)
      console.log('👤 Usuário atual:', authStore.user)
      console.log('📋 Mensagens rápidas disponíveis:', authStore.user?.quickMessages)
      console.log('📊 Quantidade de mensagens rápidas:', authStore.user?.quickMessages?.length || 0)
      
      if (inputValue && authStore.user?.quickMessages && authStore.user.quickMessages.length > 0) {
        console.log('🔍 Verificando atalhos no texto:', inputValue)
        
        // Verificar cada mensagem rápida individualmente
        authStore.user.quickMessages.forEach((qm, index) => {
          console.log(`   ${index + 1}. Atalho: "${qm.shortcut}", Texto: "${qm.text}"`)
          if (qm.shortcut && qm.text && inputValue.includes(qm.shortcut)) {
            console.log(`   ✅ Atalho "${qm.shortcut}" encontrado no texto!`)
          }
        })
        
        // Verificar se há atalhos no texto
        const hasShortcut = authStore.user.quickMessages.some(qm => 
          qm.shortcut && qm.text && inputValue.includes(qm.shortcut)
        )
        
        console.log('🎯 Tem atalho?', hasShortcut)
        
        if (hasShortcut) {
          console.log('✅ Atalho detectado, aplicando substituição...')
          // Aplicar substituição
          const processedText = processQuickMessages(inputValue)
          console.log('🔄 Texto original:', inputValue)
          console.log('🔄 Texto processado:', processedText)
          console.log('🔄 Textos são diferentes?', processedText !== inputValue)
          
          if (processedText !== inputValue) {
            console.log('🔄 Substituindo:', inputValue, '->', processedText)
            newMessage.value = processedText
          } else {
            console.log('⚠️ Nenhuma substituição foi feita')
          }
        } else {
          console.log('❌ Nenhum atalho detectado')
        }
      } else {
        console.log('❌ Condições não atendidas:')
        console.log('   - InputValue existe?', !!inputValue)
        console.log('   - Usuário existe?', !!authStore.user)
        console.log('   - QuickMessages existe?', !!authStore.user?.quickMessages)
        console.log('   - QuickMessages tem itens?', authStore.user?.quickMessages?.length > 0)
      }
    }
    
    // Função para recarregar dados do usuário
    const reloadUserData = async () => {
      try {
        console.log('🔄 Iniciando recarregamento de dados do usuário...')
        console.log('👤 Usuário atual no store:', authStore.user)
        
        const response = await fetch('http://localhost:3001/users')
        console.log('📡 Resposta da API:', response.status, response.ok)
        
        if (response.ok) {
          const users = await response.json()
          console.log('📋 Todos os usuários da API:', users)
          
          const currentUser = users.find(u => u.email === authStore.user?.email)
          console.log('🔍 Usuário encontrado na API:', currentUser)
          
          if (currentUser) {
            console.log('📝 Mensagens rápidas do usuário encontrado:', currentUser.quickMessages)
            authStore.updateUser(currentUser)
            console.log('✅ Dados do usuário atualizados no store')
            console.log('👤 Usuário atualizado no store:', authStore.user)
          } else {
            console.log('❌ Usuário não encontrado na API')
          }
        } else {
          console.log('❌ Erro na resposta da API:', response.status)
        }
      } catch (error) {
        console.error('❌ Erro ao recarregar dados do usuário:', error)
      }
    }
    
    onMounted(() => {
      scrollToBottom()
      reloadUserData() // Recarregar dados do usuário ao montar o componente
    })
    
    return {
      messages,
      newMessage,
      messagesContainer,
      selectedContact,
      contacts,
      showEmojis,
      showAttachments,
      isRecording,
      emojis,
      sendMessage,
      activeTab,
      allContacts,
      getContactCount,
      selectContact,
      transferChat,
      endChat,
      addEmoji,
      selectFile,
      sendLocation,
      startRecording,
      stopRecording,
      scrollToBottom,
      formatTime,
      capitalizeFirstLetter,
      processQuickMessages,
      reloadUserData,
      handleInput
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 80px); /* Subtrai altura do app-bar + margem */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  max-height: calc(100vh - 80px);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(224, 224, 224, 0.3);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  flex-shrink: 0; /* Não encolhe */
  height: 60px; /* Altura menor */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-details {
  display: flex;
  flex-direction: column;
}

.chat-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0c1b23;
}

.chat-status {
  font-size: 14px;
  color: #4caf50;
}

.chat-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-actions .action-btn {
  min-width: 40px !important;
  height: 40px !important;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 0; /* Permite que o flex funcione corretamente */
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.bot-message {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.user-message .message-content {
  background: #0c1b23;
  color: white;
  border-bottom-right-radius: 4px;
}

.bot-message .message-content {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.system-message .message-content {
  background: #f0f0f0;
  color: #666;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-style: italic;
  text-align: center;
  max-width: 100%;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
}

.chat-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(224, 224, 224, 0.3);
  flex-shrink: 0; /* Não encolhe */
  min-height: 60px; /* Altura menor */
  position: relative;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.input-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.action-btn {
  min-width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.message-input-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.message-input {
  flex: 1;
  align-self: center;
}

.send-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.record-btn {
  min-width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.send-btn {
  min-width: 40px !important;
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Conversations Sidebar - Always Visible */
.conversations-sidebar {
  width: 380px;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(224, 224, 224, 0.3);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.conversations-header {
  padding: 0;
  border-bottom: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.conversation-tabs {
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px 12px 0 0;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
}

.conversation-tab {
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
  border-radius: 16px 16px 0 0; /* rounded top corners like settings tabs */
  margin: 8px 4px 0 4px;
}

.conversation-tab:hover {
  background: rgba(25, 118, 210, 0.08);
  transform: translateY(-1px);
}

.conversation-tab.v-tab--selected {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2 !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
  transform: translateY(-2px);
  border: 2px solid #1976d2;
  border-radius: 16px 16px 0 0; /* rounded top corners for selected state */
}

.conversation-tab.v-tab--selected .v-icon {
  color: #1976d2 !important;
}

.conversation-tab.v-tab--selected .tab-label {
  color: #1976d2 !important;
  font-weight: 700;
}

.conversation-tab .tab-label {
  font-size: 14px;
  font-weight: 600;
}

.conversation-tab .tab-count {
  font-size: 12px;
  height: 20px;
  min-width: 20px;
}

.conversation-tab .v-icon {
  font-size: 20px;
}

/* Hide the default tab slider */
.conversation-tabs .v-tabs-slider {
  display: none;
}

.conversation-tabs .v-tab {
  border-radius: 16px 16px 0 0;
  margin: 8px 4px 0 4px;
  position: relative;
}

.conversations-list {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 4px;
}

.conversation-item:hover {
  background-color: #f5f5f5;
}

.conversation-item.active {
  background-color: #e3f2fd;
}

.conversation-info {
  flex: 1;
  margin-left: 12px;
}

.contact-name {
  font-weight: 600;
  color: #0c1b23;
  margin-bottom: 4px;
}

.last-message {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.message-time {
  font-size: 12px;
  color: #999;
}

/* Emojis Panel */
.emojis-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.emojis-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 12px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 18px;
  transition: background-color 0.2s ease;
}

.emoji-item:hover {
  background-color: #f5f5f5;
}

/* Attachments Panel */
.attachments-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
  padding: 16px;
  z-index: 100;
}

.attachment-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.attachment-options .v-btn {
  justify-content: flex-start;
  text-transform: none;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
