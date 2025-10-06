const qrcode = require('qrcode-terminal');

class WhatsAppServiceMock {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.qrCode = null;
    this.connectionStatus = 'disconnected';
    this.isInitializing = false;
  }

  // Inicializar cliente WhatsApp (simulado)
  async initialize() {
    try {
      if (this.isInitializing) {
        console.log('⚠️ WhatsApp já está sendo inicializado...');
        return;
      }

      if (this.isConnected) {
        console.log('⚠️ WhatsApp já está conectado');
        return;
      }

      this.isInitializing = true;
      console.log('🚀 Inicializando WhatsApp Web.js (Modo Simulação)...');
      
      // Simular inicialização
      setTimeout(() => {
        console.log('📱 QR Code gerado para autenticação (Simulação)');
        this.qrCode = '2@test_qr_code_simulation@test_data@whatsapp_web_js@aizap@2024@mock_mode';
        this.connectionStatus = 'qr_ready';
        this.isInitializing = false;
        qrcode.generate(this.qrCode, { small: true });
      }, 3000);
      
      console.log('✅ WhatsApp Web.js inicialização iniciada (Simulação)');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp Web.js:', error);
      this.isInitializing = false;
      throw error;
    }
  }

  // Simular conexão após escaneamento do QR
  async simulateConnection() {
    if (this.qrCode && !this.isConnected) {
      console.log('✅ Simulando conexão WhatsApp...');
      this.isConnected = true;
      this.connectionStatus = 'connected';
      this.qrCode = null;
      return true;
    }
    return false;
  }

  // Obter status da conexão
  getStatus() {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus,
      qrCode: this.qrCode,
      isInitializing: this.isInitializing
    };
  }

  // Obter QR Code
  getQRCode() {
    return this.qrCode;
  }

  // Verificar se está pronto
  isReady() {
    return this.isConnected;
  }

  // Enviar mensagem (simulado)
  async sendMessage(to, message, media) {
    if (!this.isConnected) {
      throw new Error('WhatsApp não está conectado');
    }

    console.log(`📤 Enviando mensagem simulada para ${to}: ${message}`);
    
    // Simular envio
    return {
      success: true,
      message: 'Mensagem enviada com sucesso (Simulação)',
      messageId: `mock_${Date.now()}`
    };
  }

  // Desconectar
  async disconnect() {
    console.log('🔌 Desconectando WhatsApp (Simulação)...');
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.qrCode = null;
    this.isInitializing = false;
  }

  // Processar mensagem recebida (simulado)
  async handleIncomingMessage(message) {
    console.log('💬 Mensagem recebida (Simulação):', {
      from: message.from,
      body: message.body,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new WhatsAppServiceMock();
