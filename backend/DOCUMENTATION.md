# 📚 Documentação Completa do Backend - AiZap

## 🎯 Visão Geral
Este documento consolida toda a documentação técnica do backend do sistema AiZap, incluindo configurações, correções, funcionalidades e guias de integração.

---

## 🔧 Configuração do MongoDB Atlas

### Passos para configurar o MongoDB Atlas:

1. **Substitua a senha na string de conexão:**
   - No arquivo `index.js`, linha 15, substitua `<db_password>` pela senha real do seu usuário do MongoDB Atlas
   - Exemplo: `mongodb+srv://deyvisonintelite_db_user:SUA_SENHA_AQUI@cluster0.jipgc3u.mongodb.net/...`

2. **Ou configure via variável de ambiente:**
   - Crie um arquivo `.env` na pasta `backend/` com:
   ```
   MONGODB_URI=mongodb+srv://deyvisonintelite_db_user:SUA_SENHA_AQUI@cluster0.jipgc3u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=aizap-secret-key-2024
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Teste a conexão:**
   ```bash
   cd backend
   npm start
   ```

### Credenciais padrão do admin:
- **Email:** admin@aizap.com.br
- **Senha:** admin!

### Endpoints disponíveis:
- `GET /ping` - Health check
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de usuário

---

## 🔐 Credenciais do Sistema

### Status das Credenciais:

#### Usuário Admin Criado:
- **Email:** `admin@aizap.com.br`
- **Senha:** `admin!`
- **Role:** `admin`
- **Status:** `Ativo`

#### Usuário de Teste Criado:
- **Email:** `teste@teste.com`
- **Senha:** `123456`
- **Role:** `user`
- **Status:** `Ativo`

### Para Testar o Login:

#### Via Frontend:
1. Acesse: `http://localhost:3000/login`
2. Use as credenciais:
   - **Email:** `admin@aizap.com.br`
   - **Senha:** `admin!`

#### Via Backend (Teste Direto):
```bash
# Teste com curl
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aizap.com.br","password":"admin!"}'
```

### Status dos Serviços:
- **Frontend:** ✅ Rodando em `localhost:3000`
- **Backend:** ✅ Rodando em `localhost:3001`
- **MongoDB Atlas:** ✅ Conectado
- **Usuários:** ✅ Cadastrados no banco

### Verificação:
Para verificar se os usuários existem no banco:
```bash
curl http://localhost:3001/users
```

---

## 🛠️ Correções Implementadas

### 1. Correção do Erro 500 na Exclusão de Usuários

#### Problema Identificado:
```
DELETE http://localhost:3001/users/68e2d98... 500 (Internal Server Error)
Erro ao excluir usuário: Tente novamente.
```

#### Causa do Problema:
- **Importação incorreta:** `ObjectId` não estava importado corretamente
- **Uso incorreto:** `new require('mongodb').ObjectId(id)` dentro das funções
- **Erro de sintaxe:** Tentativa de usar `require()` dentro de funções assíncronas

#### Solução Aplicada:

**1. Importação Corrigida:**
```javascript
// Antes (Incorreto)
const { MongoClient, ServerApiVersion } = require('mongodb');

// Depois (Correto)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
```

**2. Uso Corrigido nos Endpoints:**

**Endpoint DELETE /users/:id:**
```javascript
// Antes (Incorreto)
const result = await db.collection('users').deleteOne({
  _id: new require('mongodb').ObjectId(id)
});

// Depois (Correto)
const result = await db.collection('users').deleteOne({
  _id: new ObjectId(id)
});
```

**Endpoint PUT /users/:id:**
```javascript
// Antes (Incorreto)
const result = await db.collection('users').updateOne(
  { _id: new require('mongodb').ObjectId(id) },
  { $set: updateData }
);

// Depois (Correto)
const result = await db.collection('users').updateOne(
  { _id: new ObjectId(id) },
  { $set: updateData }
);
```

### 2. Correção do Sistema de Controle de Acesso ao Menu

#### Problema Identificado:
- **Erro:** "mesmo escolhendo as opções do menu lateral que ele terá acesso ele está tendo acesso a tudo quando faz login"
- **Causa:** Endpoint de login não retornava os dados completos do usuário (menuAccess, firstName, etc.)

#### Solução Aplicada:

**1. Correção do Endpoint de Login:**
```javascript
// Antes (Incorreto)
res.json({
  token,
  user: {
    id: user._id,
    email: user.email,
    name: user.name,        // ❌ Campo incorreto
    role: user.role
    // ❌ Faltavam campos importantes
  }
});

// Depois (Correto)
res.json({
  token,
  user: {
    id: user._id,
    firstName: user.firstName || '',      // ✅ Campo correto
    lastName: user.lastName || '',        // ✅ Campo correto
    email: user.email,
    role: user.role,
    sector: user.sector || '',
    photo: user.photo || '',
    isActive: user.isActive,
    menuAccess: user.menuAccess || [],    // ✅ Campo essencial
    autoCapitalization: user.autoCapitalization || false,
    quickMessages: user.quickMessages || []
  }
});
```

---

## 📊 Persistência de Dados - Configurações

### Problema Resolvido:
- **Antes:** Dados resetavam ao atualizar a página
- **Depois:** Dados persistem no MongoDB Atlas

### Implementações Realizadas:

#### 1. Backend - Novos Endpoints:

**GET /settings**
- Busca configurações do banco de dados
- Retorna configurações padrão se não existirem
- Estrutura: `{ type: 'general', data: {...}, updatedAt: Date }`

**POST /settings**
- Salva/atualiza configurações no MongoDB
- Usa `upsert: true` para criar ou atualizar
- Retorna confirmação de sucesso

#### 2. Estrutura no Banco:
```javascript
// Collection: settings
{
  _id: ObjectId,
  type: 'general',
  data: {
    companyName: '...',
    cnpj: '...',
    email: '...',
    phone: '...',
    cep: '...',
    street: '...',
    number: '...',
    neighborhood: '...',
    cityState: '...',
    workingDays: [...],
    startTime: '08:00',
    endTime: '18:00',
    saturdayStartTime: '09:00',
    saturdayEndTime: '13:00',
    saturdayOpen: false,
    sundayStartTime: '09:00',
    sundayEndTime: '13:00',
    sundayOpen: false
  },
  updatedAt: Date
}
```

---

## 📱 Guia Completo de Integração com WhatsApp API

### Visão Geral
Este documento explica como integrar o AiZap com APIs do WhatsApp para enviar e receber mensagens automaticamente.

### Status Atual da Implementação

#### ✅ Funcionalidades Implementadas:
- Interface de configuração da API WhatsApp
- Campos para provedor, URL, API Key, Webhook URL e Secret
- Configurações avançadas (resposta automática, confirmação de leitura, indicador de digitação)
- Botões para salvar e testar conexão

#### ❌ Funcionalidades Pendentes:
- Endpoints no backend para salvar configurações WhatsApp
- Implementação de webhook para receber mensagens
- Integração real com APIs do WhatsApp
- Teste de conexão funcional

### Tipos de APIs do WhatsApp

#### 1. WhatsApp Business Platform (Oficial da Meta)

**Cloud API (Recomendada)**
- **URL Base:** `https://graph.facebook.com/v17.0`
- **Autenticação:** Bearer Token
- **Recursos:** Mensagens, mídia, templates, webhooks
- **Limitações:** 1.000 mensagens/dia (gratuito)

**On-Premises API**
- **URL Base:** Configurável
- **Autenticação:** Bearer Token + certificados
- **Recursos:** Todos os recursos da Cloud API
- **Limitações:** Depende da infraestrutura

#### 2. Provedores de Soluções de Negócios (BSPs)

**Twilio**
- **URL Base:** `https://api.twilio.com`
- **Autenticação:** Basic Auth (Account SID + Auth Token)
- **Recursos:** Mensagens, mídia, webhooks
- **Preço:** $0.005 por mensagem

**360Dialog**
- **URL Base:** `https://api.360dialog.com`
- **Autenticação:** API Key
- **Recursos:** Mensagens, templates, webhooks
- **Preço:** Variável

**MessageBird**
- **URL Base:** `https://conversations.messagebird.com`
- **Autenticação:** API Key
- **Recursos:** Mensagens, mídia, webhooks
- **Preço:** $0.005 por mensagem

### Como Obter os Dados para Integração

#### 1. WhatsApp Business Platform (Meta)

**Passo a Passo:**
1. **Criar Conta de Desenvolvedor:**
   - Acesse [developers.facebook.com](https://developers.facebook.com)
   - Crie uma conta e confirme o email

2. **Criar Aplicativo:**
   - Clique em "Meus Apps" → "Criar App"
   - Escolha "Negócios" como tipo
   - Adicione o produto "WhatsApp"

3. **Configurar WhatsApp Business Account (WABA):**
   - No painel do app, vá em "WhatsApp" → "Configuração"
   - Clique em "Configurar" ao lado de "WhatsApp Business Account"
   - Siga o processo de verificação

4. **Obter Credenciais:**
   - **API Key:** Token de acesso temporário (teste) ou permanente (produção)
   - **Phone Number ID:** ID do número de telefone
   - **Webhook URL:** `https://seudominio.com/webhook/whatsapp`
   - **Webhook Secret:** Token de verificação (você define)

**Configuração no AiZap:**
```
Provedor: Meta for Developers
URL da API: https://graph.facebook.com/v17.0
API Key: EAAxxxxxxxxxxxxx (seu token)
Webhook URL: https://seudominio.com/webhook/whatsapp
Webhook Secret: seu_token_secreto
```

#### 2. Twilio

**Passo a Passo:**
1. **Criar Conta Twilio:**
   - Acesse [twilio.com](https://twilio.com)
   - Crie uma conta gratuita

2. **Configurar WhatsApp:**
   - No console, vá em "Messaging" → "Try it out" → "Send a WhatsApp message"
   - Siga o processo de configuração

3. **Obter Credenciais:**
   - **Account SID:** Encontrado no dashboard
   - **Auth Token:** Encontrado no dashboard
   - **WhatsApp Number:** Número configurado

**Configuração no AiZap:**
```
Provedor: Twilio
URL da API: https://api.twilio.com
API Key: Account SID:Auth Token (base64)
Webhook URL: https://seudominio.com/webhook/whatsapp
Webhook Secret: seu_token_secreto
```

#### 3. 360Dialog

**Passo a Passo:**
1. **Criar Conta:**
   - Acesse [360dialog.com](https://360dialog.com)
   - Registre-se e confirme o email

2. **Configurar WhatsApp:**
   - Siga o processo de onboarding
   - Configure seu número de telefone

3. **Obter Credenciais:**
   - **API Key:** Fornecida após configuração
   - **Webhook URL:** Configurado no painel

**Configuração no AiZap:**
```
Provedor: 360Dialog
URL da API: https://api.360dialog.com
API Key: sua_api_key
Webhook URL: https://seudominio.com/webhook/whatsapp
Webhook Secret: seu_token_secreto
```

### Implementação dos Endpoints Necessários

#### 1. Endpoint para Salvar Configurações WhatsApp
```javascript
// Adicionar ao backend/index.js
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
```

#### 2. Endpoint de Webhook para Receber Mensagens
```javascript
// Adicionar ao backend/index.js
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { body } = req;
    
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
    
    console.log('Mensagem recebida:', message);
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
  }
};
```

#### 3. Endpoint para Enviar Mensagens
```javascript
// Adicionar ao backend/index.js
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
```

### Segurança e Boas Práticas

#### 1. Validação de Webhook
```javascript
// Verificar assinatura do webhook
const verifyWebhook = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).send('Unauthorized');
  }
  
  next();
};
```

#### 2. Rate Limiting
```javascript
// Implementar rate limiting
const rateLimit = require('express-rate-limit');

const whatsappLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas, tente novamente em 15 minutos'
});

app.use('/whatsapp', whatsappLimiter);
```

#### 3. Logs e Monitoramento
```javascript
// Log de todas as operações WhatsApp
const logWhatsAppActivity = (action, data) => {
  console.log(`[WHATSAPP] ${action}:`, {
    timestamp: new Date().toISOString(),
    data: data
  });
};
```

### Próximos Passos
1. **Implementar endpoints no backend**
2. **Atualizar frontend para usar endpoints reais**
3. **Configurar webhook público (ngrok ou similar)**
4. **Testar integração com API escolhida**
5. **Implementar tratamento de erros**
6. **Adicionar logs e monitoramento**
7. **Configurar autenticação e segurança**

### Suporte
Para dúvidas sobre implementação:
- Documentação oficial da Meta: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- Documentação Twilio: [twilio.com/docs/whatsapp](https://twilio.com/docs/whatsapp)
- Documentação 360Dialog: [360dialog.com/docs](https://360dialog.com/docs)

---

## 🚀 Status Final

### ✅ Funcionalidades Implementadas:
- **Backend:** ✅ Endpoints funcionando
- **MongoDB Atlas:** ✅ Conectado e funcionando
- **Autenticação:** ✅ JWT implementado
- **CRUD Usuários:** ✅ Completo
- **Configurações:** ✅ Persistência implementada
- **WhatsApp:** ✅ Estrutura preparada para integração

### 📋 Para Testar:
1. **Backend:** `npm start` na pasta backend
2. **Frontend:** `npm run dev` na pasta frontend
3. **Login:** Use as credenciais admin@aizap.com.br / admin!
4. **Configurações:** Acesse /settings para testar persistência
5. **Usuários:** Teste CRUD completo na aba Usuários

### 🔧 Próximas Implementações:
- Integração real com APIs WhatsApp
- Sistema de mensagens em tempo real
- Dashboard com métricas
- Sistema de relatórios
- Backup e restore de dados
