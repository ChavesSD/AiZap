const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Usar serviço mock temporariamente devido a problemas com whatsapp-web.js
const whatsappService = require('./services/whatsappServiceMock');
const whatsappMultiService = require('./services/whatsappMultiService');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// MongoDB Atlas connection
const uri = process.env.MONGODB_URI || "mongodb+srv://deyvisonintelite_db_user:mzD7zOX8P152DjVn@cluster0.jipgc3u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let client;
let db;

// MongoDB Connection
const connectDB = async () => {
  try {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    // Connect the client to the server
    await client.connect();
    
    // Get database reference
    db = client.db('aizap');
    
    console.log('✅ MongoDB Atlas conectado com sucesso!');
    console.log(`📊 Database: aizap`);
    
    // Test connection
    await client.db("admin").command({ ping: 1 });
    console.log('🏓 Ping MongoDB Atlas: OK');
    
    // Create admin user if not exists
    await createAdminUser();
    
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

// Create Admin User
const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@aizap.com.br';
    const adminPassword = 'admin!';
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('👤 Usuário admin já existe');
      return;
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    // Create admin user
    const adminUser = {
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador AiZap',
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    };
    
    await db.collection('users').insertOne(adminUser);
    console.log('✅ Usuário admin criado com sucesso!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Senha: ${adminPassword}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
  }
};

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/ping', (req, res) => {
  res.json({
    message: 'AiZap Backend API está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: client && client.topology && client.topology.isConnected() ? 'Conectado' : 'Desconectado'
  });
});

// Test endpoint
app.post('/test', (req, res) => {
  console.log('🧪 Endpoint de teste chamado');
  res.json({ message: 'Teste funcionando', body: req.body });
});

// Auth routes
app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Endpoint de login chamado');
    const { email, password } = req.body;
    
    console.log('🔐 Tentativa de login:', { email, password: password ? '***' : 'undefined' });
    
    if (!email || !password) {
      console.log('❌ Email ou senha não fornecidos');
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Find user
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não');
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Usuário inativo'
      });
    }

    // Verify password
    console.log('🔑 Verificando senha...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔑 Senha válida:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Senha inválida');
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'aizap-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        role: user.role,
        sector: user.sector || '',
        photo: user.photo || '',
        isActive: user.isActive,
        menuAccess: user.menuAccess || [],
        autoCapitalization: user.autoCapitalization || false,
        quickMessages: user.quickMessages || []
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios'
      });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'Usuário já existe'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: 'user',
      isActive: true,
      createdAt: new Date()
    };

    await db.collection('users').insertOne(user);

    res.json({
      message: 'Usuário registrado com sucesso'
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// User Management Routes
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    
    // Remove passwords from response
    const safeUsers = users.map(user => ({
      id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role,
      sector: user.sector || '',
      photo: user.photo || '',
      isActive: user.isActive,
      menuAccess: user.menuAccess || [],
      autoCapitalization: user.autoCapitalization || false,
      quickMessages: user.quickMessages || [],
      createdAt: user.createdAt
    }));
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, sector, photo, menuAccess, autoCapitalization, quickMessages } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Nome, sobrenome, email e senha são obrigatórios'
      });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'Usuário já existe'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      sector: sector || '',
      photo: photo || '',
      isActive: true,
      menuAccess: menuAccess || [],
      autoCapitalization: autoCapitalization || false,
      quickMessages: quickMessages || [],
      createdAt: new Date()
    };

    await db.collection('users').insertOne(user);

    res.json({
      message: 'Usuário criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, role, sector, photo, menuAccess, autoCapitalization, quickMessages, isActive } = req.body;
    
    const updateData = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: email?.toLowerCase(),
      role,
      sector,
      photo,
      menuAccess: menuAccess || [],
      autoCapitalization: autoCapitalization || false,
      quickMessages: quickMessages || [],
      isActive,
      updatedAt: new Date()
    };

    // If password is provided, hash it
    if (password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      message: 'Usuário excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Settings routes
app.get('/settings', async (req, res) => {
  try {
    // Buscar configurações do banco de dados
    const settings = await db.collection('settings').findOne({ type: 'general' });
    
    if (!settings) {
      // Retornar configurações padrão se não existirem
      return res.json({
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
      });
    }
    
    res.json(settings.data);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

app.post('/settings', async (req, res) => {
  try {
    const settingsData = req.body;
    
    // Salvar ou atualizar configurações
    await db.collection('settings').updateOne(
      { type: 'general' },
      { 
        $set: { 
          type: 'general',
          data: settingsData,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    res.json({
      message: 'Configurações salvas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// WhatsApp Settings routes
app.post('/settings/whatsapp', async (req, res) => {
  try {
    const whatsappData = req.body;
    
    await db.collection('settings').updateOne(
      { type: 'whatsapp' },
      { 
        $set: { 
          type: 'whatsapp',
          data: whatsappData,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    res.json({ message: 'Configurações WhatsApp salvas com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar configurações WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/settings/whatsapp', async (req, res) => {
  try {
    const settings = await db.collection('settings').findOne({ type: 'whatsapp' });
    
    if (!settings) {
      return res.json({
        provider: '',
        apiUrl: '',
        apiKey: '',
        webhookUrl: '',
        webhookSecret: '',
        autoReply: false,
        readReceipts: true,
        typingIndicator: true
      });
    }
    
    res.json(settings.data);
  } catch (error) {
    console.error('Erro ao buscar configurações WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// WhatsApp webhook endpoint
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { body } = req;
    
    console.log('📱 Webhook WhatsApp recebido:', JSON.stringify(body, null, 2));
    
    // Verificar se é uma mensagem válida
    if (body.object === 'whatsapp_business_account') {
      // Processar mensagens recebidas
      if (body.entry && body.entry[0] && body.entry[0].changes) {
        const changes = body.entry[0].changes[0];
        
        if (changes.field === 'messages') {
          const messages = changes.value.messages;
          
          if (messages) {
            for (const message of messages) {
              await processIncomingMessage(message);
            }
          }
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para processar mensagens recebidas
const processIncomingMessage = async (message) => {
  try {
    // Salvar mensagem no banco de dados
    await db.collection('messages').insertOne({
      messageId: message.id,
      from: message.from,
      timestamp: message.timestamp,
      type: message.type,
      text: message.text?.body || '',
      receivedAt: new Date()
    });
    
    console.log('💬 Mensagem processada:', message);
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
  }
};

// Teste de conexão WhatsApp
app.post('/whatsapp/test', async (req, res) => {
  try {
    const { provider, apiUrl, apiKey } = req.body;
    
    console.log('🧪 Testando conexão WhatsApp:', { provider, apiUrl });
    
    // Testar conexão baseada no provedor
    let testUrl = '';
    let headers = {};
    
    switch (provider) {
      case 'Meta for Developers':
      case 'WhatsApp Business API':
        testUrl = `${apiUrl}/me`;
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
        break;
      case 'Twilio':
        testUrl = `${apiUrl}/2010-04-01/Accounts/${apiKey.split(':')[0]}.json`;
        headers = {
          'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`,
          'Content-Type': 'application/json'
        };
        break;
      default:
        testUrl = `${apiUrl}/health`;
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
    }
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: headers
    });
    
    const result = await response.json();
    console.log('📡 Resposta do teste:', result);
    
    res.json({ 
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Conexão bem-sucedida' : 'Falha na conexão',
      details: result
    });
  } catch (error) {
    console.error('Erro no teste de conexão:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Enviar mensagem WhatsApp
app.post('/whatsapp/send', async (req, res) => {
  try {
    const { to, message, type = 'text' } = req.body;
    
    // Buscar configurações WhatsApp
    const settings = await db.collection('settings').findOne({ type: 'whatsapp' });
    
    if (!settings) {
      return res.status(400).json({ error: 'Configurações WhatsApp não encontradas' });
    }
    
    // Enviar mensagem via API do WhatsApp
    const result = await sendWhatsAppMessage(settings.data, to, message, type);
    
    res.json({ success: true, messageId: result.id });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para enviar mensagem via API
const sendWhatsAppMessage = async (settings, to, message, type) => {
  const url = `${settings.apiUrl}/${settings.phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: type,
    [type]: {
      body: message
    }
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
};

// WhatsApp Web.js endpoints
app.get('/whatsapp/status', async (req, res) => {
  try {
    const status = whatsappService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Erro ao obter status WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/whatsapp/qr', async (req, res) => {
  try {
    const qrCode = whatsappService.getQRCode();
    if (qrCode) {
      res.json({ qrCode: qrCode });
    } else {
      res.json({ message: 'QR Code não disponível. Aguarde a geração.' });
    }
  } catch (error) {
    console.error('Erro ao obter QR Code:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/whatsapp/initialize', async (req, res) => {
  try {
    console.log('🔄 Iniciando WhatsApp via API...');
    await whatsappService.initialize();
    res.json({ message: 'WhatsApp Web.js inicializado com sucesso' });
  } catch (error) {
    console.error('Erro ao inicializar WhatsApp:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Endpoint para reinicializar WhatsApp
app.post('/whatsapp/restart', async (req, res) => {
  try {
    console.log('🔄 Reiniciando WhatsApp...');
    
    // Desconectar primeiro
    await whatsappService.disconnect();
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reinicializar
    await whatsappService.initialize();
    
    res.json({ message: 'WhatsApp reiniciado com sucesso' });
  } catch (error) {
    console.error('Erro ao reiniciar WhatsApp:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Endpoint para simular conexão (apenas para modo mock)
app.post('/whatsapp/simulate-connection', async (req, res) => {
  try {
    console.log('🔄 Simulando conexão WhatsApp...');
    
    const connected = await whatsappService.simulateConnection();
    
    if (connected) {
      res.json({ message: 'WhatsApp conectado com sucesso (Simulação)' });
    } else {
      res.status(400).json({ error: 'QR Code não disponível para conexão' });
    }
  } catch (error) {
    console.error('Erro ao simular conexão WhatsApp:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// ===== ENDPOINTS PARA MÚLTIPLAS INSTÂNCIAS =====

// Criar nova instância
app.post('/whatsapp/instances', async (req, res) => {
  try {
    const { instanceId, config } = req.body;
    
    if (!instanceId) {
      return res.status(400).json({ error: 'instanceId é obrigatório' });
    }

    await whatsappMultiService.createInstance(instanceId, config);
    res.json({ 
      message: 'Instância criada com sucesso', 
      instanceId,
      status: 'created'
    });
  } catch (error) {
    console.error('Erro ao criar instância:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Listar todas as instâncias
app.get('/whatsapp/instances', async (req, res) => {
  try {
    const instances = whatsappMultiService.getAllInstancesStatus();
    res.json(instances);
  } catch (error) {
    console.error('Erro ao listar instâncias:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Obter status de uma instância específica
app.get('/whatsapp/instances/:instanceId', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const status = whatsappMultiService.getInstanceStatus(instanceId);
    
    if (!status) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }
    
    res.json(status);
  } catch (error) {
    console.error('Erro ao obter status da instância:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Inicializar instância específica
app.post('/whatsapp/instances/:instanceId/initialize', async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    await whatsappMultiService.initializeInstance(instanceId);
    res.json({ 
      message: `Instância ${instanceId} inicializada com sucesso`,
      instanceId
    });
  } catch (error) {
    console.error('Erro ao inicializar instância:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Simular conexão de uma instância específica
app.post('/whatsapp/instances/:instanceId/simulate-connection', async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    const connected = await whatsappMultiService.simulateConnection(instanceId);
    
    if (connected) {
      res.json({ 
        message: `Instância ${instanceId} conectada com sucesso (Simulação)`,
        instanceId
      });
    } else {
      res.status(400).json({ 
        error: 'QR Code não disponível para conexão',
        instanceId
      });
    }
  } catch (error) {
    console.error('Erro ao simular conexão da instância:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Desconectar instância específica
app.post('/whatsapp/instances/:instanceId/disconnect', async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    await whatsappMultiService.disconnectInstance(instanceId);
    res.json({ 
      message: `Instância ${instanceId} desconectada com sucesso`,
      instanceId
    });
  } catch (error) {
    console.error('Erro ao desconectar instância:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Remover instância
app.delete('/whatsapp/instances/:instanceId', async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    await whatsappMultiService.removeInstance(instanceId);
    res.json({ 
      message: `Instância ${instanceId} removida com sucesso`,
      instanceId
    });
  } catch (error) {
    console.error('Erro ao remover instância:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Enviar mensagem de uma instância específica
app.post('/whatsapp/instances/:instanceId/send', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { to, message, media } = req.body;
    
    const result = await whatsappMultiService.sendMessage(instanceId, to, message, media);
    res.json(result);
  } catch (error) {
    console.error('Erro ao enviar mensagem da instância:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

app.post('/whatsapp/send-message', async (req, res) => {
  try {
    const { to, message, media } = req.body;
    
    if (!whatsappService.isReady()) {
      return res.status(400).json({ error: 'WhatsApp não está conectado' });
    }
    
    const result = await whatsappService.sendMessage(to, message, media);
    res.json(result);
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/whatsapp/disconnect', async (req, res) => {
  try {
    await whatsappService.disconnect();
    res.json({ message: 'WhatsApp desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para obter mensagens
app.get('/whatsapp/messages', async (req, res) => {
  try {
    const messages = await db.collection('messages').find({}).sort({ receivedAt: -1 }).limit(50).toArray();
    res.json(messages);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo deu errado!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado'
  });
});

app.listen(port, () => {
  console.log(`🚀 AiZap Backend rodando na porta ${port}`);
  console.log(`📡 API disponível em: http://localhost:${port}`);
  console.log(`🔍 Health check: http://localhost:${port}/ping`);
});
