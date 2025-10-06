const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppMultiService {
  constructor() {
    this.instances = new Map(); // Armazenar múltiplas instâncias
    this.activeConnections = new Map();
  }

  // Criar nova instância
  async createInstance(instanceId, config = {}) {
    try {
      if (this.instances.has(instanceId)) {
        console.log(`⚠️ Instância ${instanceId} já existe`);
        return this.instances.get(instanceId);
      }

      console.log(`🚀 Criando nova instância: ${instanceId}`);
      
      const client = new Client({
        authStrategy: new LocalAuth({ 
          clientId: `aizap-${instanceId}` 
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
        qrMaxRetries: 3,
        ...config
      });

      // Configurar event listeners
      this.setupEventListeners(client, instanceId);
      
      this.instances.set(instanceId, {
        client,
        isConnected: false,
        qrCode: null,
        status: 'disconnected',
        isInitializing: false,
        createdAt: new Date()
      });

      return client;
    } catch (error) {
      console.error(`❌ Erro ao criar instância ${instanceId}:`, error);
      throw error;
    }
  }

  // Configurar event listeners para uma instância
  setupEventListeners(client, instanceId) {
    const instance = this.instances.get(instanceId);
    
    // QR Code gerado
    client.on('qr', (qr) => {
      console.log(`📱 QR Code gerado para instância ${instanceId}`);
      instance.qrCode = qr;
      instance.status = 'qr_ready';
      instance.isInitializing = false;
      qrcode.generate(qr, { small: true });
    });

    // Cliente pronto
    client.on('ready', () => {
      console.log(`✅ Instância ${instanceId} conectada e pronta!`);
      instance.isConnected = true;
      instance.status = 'connected';
      instance.isInitializing = false;
      instance.qrCode = null;
    });

    // Cliente autenticado
    client.on('authenticated', () => {
      console.log(`🔐 Instância ${instanceId} autenticada`);
      instance.status = 'authenticated';
      instance.isInitializing = false;
    });

    // Falha na autenticação
    client.on('auth_failure', (msg) => {
      console.error(`❌ Falha na autenticação da instância ${instanceId}:`, msg);
      instance.status = 'auth_failure';
      instance.isInitializing = false;
    });

    // Cliente desconectado
    client.on('disconnected', (reason) => {
      console.log(`🔌 Instância ${instanceId} desconectada:`, reason);
      instance.isConnected = false;
      instance.status = 'disconnected';
      instance.isInitializing = false;
      instance.qrCode = null;
    });

    // Mensagem recebida
    client.on('message', async (message) => {
      try {
        await this.handleIncomingMessage(instanceId, message);
      } catch (error) {
        console.error(`❌ Erro ao processar mensagem da instância ${instanceId}:`, error);
      }
    });

    // Erro geral
    client.on('error', (error) => {
      console.error(`❌ Erro na instância ${instanceId}:`, error);
      instance.isInitializing = false;
    });
  }

  // Inicializar instância específica
  async initializeInstance(instanceId) {
    try {
      const instance = this.instances.get(instanceId);
      if (!instance) {
        throw new Error(`Instância ${instanceId} não encontrada`);
      }

      if (instance.isInitializing) {
        console.log(`⚠️ Instância ${instanceId} já está sendo inicializada...`);
        return;
      }

      if (instance.isConnected) {
        console.log(`⚠️ Instância ${instanceId} já está conectada`);
        return;
      }

      instance.isInitializing = true;
      console.log(`🚀 Inicializando instância ${instanceId}...`);
      
      // Inicializar cliente de forma assíncrona
      instance.client.initialize().catch(error => {
        console.error(`❌ Erro na inicialização assíncrona da instância ${instanceId}:`, error);
        instance.isInitializing = false;
        instance.status = 'error';
      });
      
      console.log(`✅ Instância ${instanceId} inicialização iniciada`);
      
    } catch (error) {
      console.error(`❌ Erro ao inicializar instância ${instanceId}:`, error);
      throw error;
    }
  }

  // Obter status de uma instância
  getInstanceStatus(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return null;
    }

    return {
      instanceId,
      isConnected: instance.isConnected,
      status: instance.status,
      qrCode: instance.qrCode,
      isInitializing: instance.isInitializing,
      createdAt: instance.createdAt
    };
  }

  // Obter status de todas as instâncias
  getAllInstancesStatus() {
    const statuses = [];
    for (const [instanceId, instance] of this.instances) {
      statuses.push({
        instanceId,
        isConnected: instance.isConnected,
        status: instance.status,
        qrCode: instance.qrCode,
        isInitializing: instance.isInitializing,
        createdAt: instance.createdAt
      });
    }
    return statuses;
  }

  // Simular conexão de uma instância (para modo mock)
  async simulateConnection(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return false;
    }

    if (instance.qrCode && !instance.isConnected) {
      console.log(`✅ Simulando conexão da instância ${instanceId}...`);
      instance.isConnected = true;
      instance.status = 'connected';
      instance.qrCode = null;
      return true;
    }
    return false;
  }

  // Enviar mensagem de uma instância específica
  async sendMessage(instanceId, to, message, media) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instância ${instanceId} não encontrada`);
    }

    if (!instance.isConnected) {
      throw new Error(`Instância ${instanceId} não está conectada`);
    }

    try {
      const chat = await instance.client.getChatById(to);
      if (media) {
        // Handle media messages
        return { success: false, message: 'Media messages not yet implemented.' };
      } else {
        await instance.client.sendMessage(chat.id._serialized, message);
        return { success: true, message: 'Message sent.' };
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem da instância ${instanceId}:`, error);
      throw error;
    }
  }

  // Desconectar instância específica
  async disconnectInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instância ${instanceId} não encontrada`);
    }

    try {
      if (instance.client) {
        await instance.client.destroy();
      }
      
      instance.isConnected = false;
      instance.status = 'disconnected';
      instance.qrCode = null;
      instance.isInitializing = false;
      
      console.log(`🔌 Instância ${instanceId} desconectada`);
    } catch (error) {
      console.error(`❌ Erro ao desconectar instância ${instanceId}:`, error);
      throw error;
    }
  }

  // Remover instância
  async removeInstance(instanceId) {
    await this.disconnectInstance(instanceId);
    this.instances.delete(instanceId);
    console.log(`🗑️ Instância ${instanceId} removida`);
  }

  // Processar mensagem recebida
  async handleIncomingMessage(instanceId, message) {
    console.log(`💬 Mensagem recebida da instância ${instanceId}:`, {
      from: message.from,
      body: message.body,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new WhatsAppMultiService();
