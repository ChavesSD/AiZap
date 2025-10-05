<template>
  <div class="chat-container">
    <!-- Conversations Sidebar - Always Visible -->
    <div class="conversations-sidebar">
      <div class="conversations-header">
        <v-tabs
          v-model="activeTab"
          color="primary"
          align-tabs="center"
          class="conversation-tabs"
        >
          <v-tab value="atendimento">
            <v-icon>mdi-account-check</v-icon>
            <v-chip size="small" color="primary" class="ml-1">
              {{ getContactCount('atendimento') }}
            </v-chip>
          </v-tab>
          <v-tab value="aguardando">
            <v-icon>mdi-clock-outline</v-icon>
            <v-chip size="small" color="warning" class="ml-1">
              {{ getContactCount('aguardando') }}
            </v-chip>
          </v-tab>
          <v-tab value="finalizado">
            <v-icon>mdi-check-circle</v-icon>
            <v-chip size="small" color="success" class="ml-1">
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
import { ref, computed, onMounted, nextTick } from 'vue'

export default {
  name: 'ChatView',
  setup() {
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
      
      const message = {
        id: Date.now(),
        text: newMessage.value.trim(),
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
    
    onMounted(() => {
      scrollToBottom()
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
      formatTime
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 80px); /* Subtrai altura do app-bar + margem */
  background: white;
  overflow: hidden;
  max-height: calc(100vh - 80px);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  flex-shrink: 0; /* Não encolhe */
  height: 60px; /* Altura menor */
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
  background: #f5f5f5;
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
  align-items: flex-end;
  gap: 12px;
  padding: 12px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0; /* Não encolhe */
  min-height: 60px; /* Altura menor */
  position: relative;
}

.input-actions {
  display: flex;
  gap: 4px;
  margin-right: 8px;
}

.action-btn {
  min-width: 40px !important;
  height: 40px !important;
}

.message-input-container {
  flex: 1;
}

.message-input {
  flex: 1;
}

.send-actions {
  display: flex;
  gap: 8px;
  margin-left: 8px;
}

.record-btn {
  min-width: 40px !important;
  height: 40px !important;
}

.send-btn {
  margin-bottom: 4px;
}

/* Conversations Sidebar - Always Visible */
.conversations-sidebar {
  width: 380px;
  height: 100%;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.conversations-header {
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.conversation-tabs {
  width: 100%;
}

.conversation-tabs .v-tab {
  font-size: 11px;
  min-width: 0;
  padding: 8px 6px;
  text-transform: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-direction: column;
  height: auto;
  min-height: 50px;
}

.conversation-tabs .v-tab .v-icon {
  font-size: 20px;
}

.conversation-tabs .v-tab .v-chip {
  font-size: 10px;
  height: 18px;
  min-width: 18px;
}

.conversations-list {
  padding: 8px;
  flex: 1;
  overflow-y: auto;
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
