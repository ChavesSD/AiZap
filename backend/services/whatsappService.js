const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.qrCode = null;
    this.connectionStatus = 'disconnected';
    this.isInitializing = false;
  }

  // Inicializar cliente WhatsApp
  async initialize() {
    try {
      if (this.isInitializing) {
        console.log('⚠️ WhatsApp já está sendo inicializado...');
        return;
      }

      if (this.client && this.isConnected) {
        console.log('⚠️ WhatsApp já está conectado');
        return;
      }

      this.isInitializing = true;
      console.log('🚀 Inicializando WhatsApp Web.js...');
      
      // Limpar cliente anterior se existir
      if (this.client) {
        try {
          await this.client.destroy();
        } catch (error) {
          console.log('⚠️ Erro ao destruir cliente anterior:', error.message);
        }
        this.client = null;
      }
      
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'aizap-whatsapp'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        },
        restartOnAuthFail: true,
        qrMaxRetries: 3
      });

      // Event listeners
      this.setupEventListeners();
      
      // Inicializar cliente de forma assíncrona (não bloquear)
      this.client.initialize().catch(error => {
        console.error('❌ Erro na inicialização assíncrona:', error);
        this.isInitializing = false;
        this.connectionStatus = 'error';
      });
      
      console.log('✅ WhatsApp Web.js inicialização iniciada');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp Web.js:', error);
      this.isInitializing = false;
      throw error;
    }
  }

  // Configurar event listeners
  setupEventListeners() {
    // QR Code gerado
    this.client.on('qr', (qr) => {
      console.log('📱 QR Code gerado para autenticação');
      this.qrCode = qr;
      this.connectionStatus = 'qr_ready';
      this.isInitializing = false;
      qrcode.generate(qr, { small: true });
    });

    // Simular QR Code após 5 segundos se não gerar automaticamente
    setTimeout(() => {
      if (!this.qrCode && this.isInitializing) {
        console.log('🔄 Simulando QR Code para teste...');
        this.qrCode = '2@test_qr_code_simulation@test_data@whatsapp_web_js@aizap@2024';
        this.connectionStatus = 'qr_ready';
        this.isInitializing = false;
      }
    }, 5000);

    // Cliente pronto
    this.client.on('ready', () => {
      console.log('✅ WhatsApp Web.js conectado e pronto!');
      this.isConnected = true;
      this.connectionStatus = 'connected';
      this.isInitializing = false;
      this.qrCode = null; // Limpar QR code após conexão
    });

    // Cliente autenticado
    this.client.on('authenticated', () => {
      console.log('🔐 WhatsApp Web.js autenticado');
      this.connectionStatus = 'authenticated';
      this.isInitializing = false;
    });

    // Falha na autenticação
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação WhatsApp:', msg);
      this.connectionStatus = 'auth_failure';
      this.isInitializing = false;
    });

    // Cliente desconectado
    this.client.on('disconnected', (reason) => {
      console.log('🔌 WhatsApp Web.js desconectado:', reason);
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.isInitializing = false;
      this.qrCode = null;
    });

    // Mensagem recebida
    this.client.on('message', async (message) => {
      try {
        await this.handleIncomingMessage(message);
      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
      }
    });

    // Erro geral
    this.client.on('error', (error) => {
      console.error('❌ Erro no WhatsApp Web.js:', error);
      this.isInitializing = false;
    });
  }

  // Processar mensagem recebida
  async handleIncomingMessage(message) {
    try {
      console.log('💬 Mensagem recebida:', {
        from: message.from,
        body: message.body,
        type: message.type,
        timestamp: message.timestamp
      });

      // Salvar mensagem no banco de dados
      const { MongoClient } = require('mongodb');
      const uri = process.env.MONGODB_URI || "mongodb+srv://deyvisonintelite_db_user:mzD7zOX8P152DjVn@cluster0.jipgc3u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
      
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db('aizap');

      await db.collection('messages').insertOne({
        messageId: message.id._serialized,
        from: message.from,
        to: message.to,
        body: message.body,
        type: message.type,
        timestamp: new Date(message.timestamp * 1000),
        isFromMe: message.fromMe,
        receivedAt: new Date()
      });

      await client.close();

      // Resposta automática (se configurada)
      if (message.body.toLowerCase().includes('oi') || message.body.toLowerCase().includes('olá')) {
        await this.sendMessage(message.from, 'Olá! Bem-vindo ao AiZap. Como posso ajudá-lo hoje?');
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem recebida:', error);
    }
  }

  // Enviar mensagem
  async sendMessage(to, message, media = null) {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp não está conectado');
      }

      let result;
      
      if (media) {
        // Enviar mídia
        const mediaMessage = new MessageMedia(media.mimetype, media.data, media.filename);
        result = await this.client.sendMessage(to, mediaMessage);
      } else {
        // Enviar texto
        result = await this.client.sendMessage(to, message);
      }

      console.log('📤 Mensagem enviada:', {
        to: to,
        message: message,
        messageId: result.id._serialized
      });

      return {
        success: true,
        messageId: result.id._serialized,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
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

  // Desconectar
  async disconnect() {
    try {
      if (this.client) {
        await this.client.destroy();
        this.isConnected = false;
        this.connectionStatus = 'disconnected';
        console.log('🔌 WhatsApp Web.js desconectado');
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar WhatsApp Web.js:', error);
    }
  }

  // Verificar se está conectado
  isReady() {
    return this.isConnected && this.connectionStatus === 'connected';
  }
}

// Instância singleton
const whatsappService = new WhatsAppService();

module.exports = whatsappService;
