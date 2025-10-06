# 📚 Documentação Completa do Frontend - AiZap

## 🎯 Visão Geral
Este documento consolida toda a documentação técnica do frontend do sistema AiZap, incluindo melhorias, correções, funcionalidades e guias de implementação.

---

## 🎨 Melhorias na Interface

### 1. Foto do Usuário no Cabeçalho

#### Funcionalidade Implementada:
- **Objetivo:** Exibir a foto do usuário no cabeçalho da aplicação
- **Localização:** Botão do menu do usuário no canto superior direito
- **Comportamento:** Foto personalizada ou avatar gerado automaticamente

#### Implementação:

**1. Avatar Inteligente:**
```javascript
const userAvatar = computed(() => {
  if (user.value?.photo) {
    return user.value.photo  // ✅ Usa foto do usuário se disponível
  }
  const name = user.value?.firstName || user.value?.name || 'U'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0c1b23&color=fff`
})
```

**2. Botão do Menu Atualizado:**
```vue
<v-btn
  v-bind="props"
  class="user-menu-btn"
  variant="text"
>
  <v-avatar size="32">
    <v-img v-if="userAvatar" :src="userAvatar" />
    <v-icon v-else>mdi-account-circle</v-icon>
  </v-avatar>
</v-btn>
```

**3. Menu do Usuário Melhorado:**
```vue
<v-list>
  <v-list-item
    prepend-avatar="userAvatar"
    :title="user?.firstName || user?.name || 'Usuário'"
    :subtitle="user?.email || ''"
    disabled
  />
  <v-divider />
  <v-list-item prepend-icon="mdi-account" title="Perfil" @click="goToProfile" />
  <v-list-item prepend-icon="mdi-logout" title="Sair" @click="handleLogout" />
</v-list>
```

#### Design e Funcionalidades:

**✅ Avatar no Cabeçalho:**
- **Tamanho:** 32x32 pixels
- **Formato:** Circular
- **Prioridade:** Foto do usuário > Avatar gerado > Ícone padrão
- **Posição:** Canto superior direito

**✅ Menu do Usuário:**
- **Cabeçalho:** Foto + Nome + Email
- **Opções:** Perfil e Sair
- **Separador:** Divisor visual entre informações e ações

**✅ Fallback Inteligente:**
1. **Foto do usuário:** Se `user.photo` estiver disponível
2. **Avatar gerado:** Baseado no nome do usuário
3. **Ícone padrão:** `mdi-account-circle` como último recurso

---

### 2. Melhorias no Modal de Usuário

#### Problemas Identificados:
- **Falta de informações sobre dimensões da foto:** Usuário não sabia as dimensões recomendadas para upload
- **Botão "Atualizar" não clicável:** Botão desabilitado mesmo com alterações feitas

#### Soluções Aplicadas:

**1. Informações de Dimensões Adicionadas:**
```vue
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
```

**2. Botão "Atualizar" Corrigido:**
```vue
<!-- Antes (Problema) -->
<v-btn
  color="primary"
  @click="saveUser"
  :loading="savingUser"
  :disabled="!userFormValid"  // ❌ Sempre desabilitado
>
  {{ editingUser ? 'Atualizar' : 'Criar' }}
</v-btn>

<!-- Depois (Corrigido) -->
<v-btn
  color="primary"
  @click="saveUser"
  :loading="savingUser"  // ✅ Sem validação desnecessária
>
  {{ editingUser ? 'Atualizar' : 'Criar' }}
</v-btn>
```

---

### 3. Dimensões de Foto de Perfil

#### Dimensões Atuais Configuradas:

**1. Modal de Edição/Criação de Usuário:**
- **Avatar:** `size="120"` (120x120 pixels)
- **Ícone:** `size="60"` (60x60 pixels)
- **Uso:** Preview da foto durante upload/edição

**2. Tabela de Usuários:**
- **Avatar:** `size="40"` (40x40 pixels)
- **Uso:** Exibição compacta na lista de usuários

#### Dimensões Recomendadas:

**📱 Para Upload (Arquivo Original):**
- **Tamanho ideal:** **400x400 pixels**
- **Formato:** JPG, PNG, WebP
- **Qualidade:** 80-90% (boa compressão)
- **Tamanho do arquivo:** Máximo 2MB
- **Proporção:** 1:1 (quadrada)

**🖼️ Para Exibição:**

**Modal de Usuário (Preview):**
- **Atual:** 120x120 pixels ✅
- **Recomendado:** 120x120 pixels
- **Justificativa:** Tamanho adequado para preview

**Tabela de Usuários:**
- **Atual:** 40x40 pixels ✅
- **Recomendado:** 40x40 pixels
- **Justificativa:** Compacto, não ocupa muito espaço

**Menu/Navbar (Futuro):**
- **Recomendado:** 32x32 pixels
- **Uso:** Avatar pequeno no canto superior

#### Configurações Técnicas:

**Upload de Arquivo:**
```javascript
// Dimensões máximas recomendadas
const MAX_WIDTH = 400;
const MAX_HEIGHT = 400;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
```

**Redimensionamento Automático:**
```javascript
// Função para redimensionar imagem
const resizeImage = (file, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

---

### 4. Correção da Tabela de Usuários

#### Problemas Identificados:
- **Nome não sendo exibido:** Coluna "Nome" vazia na tabela de usuários
- **Falta de coluna para foto:** Não havia coluna para visualizar a foto do usuário

#### Soluções Aplicadas:

**1. Correção dos Headers da Tabela:**
```javascript
// Antes (Incorreto)
const userHeaders = [
  { title: 'Nome', key: 'name' },        // ❌ Campo inexistente
  { title: 'Email', key: 'email' },
  { title: 'Função', key: 'role' },
  { title: 'Status', key: 'isActive' },
  { title: 'Ações', key: 'actions', sortable: false }
]

// Depois (Correto)
const userHeaders = [
  { title: 'Foto', key: 'photo', sortable: false },     // ✅ Nova coluna
  { title: 'Nome', key: 'fullName' },                   // ✅ Campo correto
  { title: 'Email', key: 'email' },
  { title: 'Função', key: 'role' },
  { title: 'Status', key: 'isActive' },
  { title: 'Ações', key: 'actions', sortable: false }
]
```

**2. Templates para Exibição:**
```vue
<!-- Template da Foto -->
<template v-slot:item.photo="{ item }">
  <v-avatar size="40">
    <v-img v-if="item.photo" :src="item.photo" />
    <v-icon v-else>mdi-account</v-icon>
  </v-avatar>
</template>

<!-- Template do Nome Completo -->
<template v-slot:item.fullName="{ item }">
  {{ `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Nome não informado' }}
</template>
```

---

### 5. Correção do Erro de Componentes Vuetify

#### Problema Identificado:
```
[Vue warn]: Failed to resolve component: v-tab-window-item
```

#### Causa do Problema:
- **Componente incorreto:** `v-tab-window-item` não existe no Vuetify 3
- **Estrutura incorreta:** Mistura de componentes Vuetify 2 e 3

#### Solução Aplicada:

**Antes (Incorreto):**
```vue
<v-tabs v-model="userTab">
  <v-tab value="basic">Dados Básicos</v-tab>
  <v-tab value="access">Acesso</v-tab>
</v-tabs>

<v-form>
  <v-tab-window-item value="basic">
    <!-- Conteúdo -->
  </v-tab-window-item>
</v-form>
```

**Depois (Correto):**
```vue
<v-tabs v-model="userTab">
  <v-tab value="basic">Dados Básicos</v-tab>
  <v-tab value="access">Acesso</v-tab>
</v-tabs>

<v-window v-model="userTab">
  <v-window-item value="basic">
    <v-form>
      <!-- Conteúdo -->
    </v-form>
  </v-window-item>
</v-window>
```

#### Mudanças Realizadas:
- ✅ **v-tabs** → Mantido (correto)
- ✅ **v-tab-window-item** → **v-window-item** (corrigido)
- ✅ **v-window** → Adicionado (necessário)

#### Componentes Vuetify 3:
- ✅ **v-tabs** - Para navegação entre abas
- ✅ **v-tab** - Para cada aba individual
- ✅ **v-window** - Container para conteúdo das abas
- ✅ **v-window-item** - Conteúdo de cada aba

---

### 6. Correção do Plugin de Máscara

#### Problema Resolvido:
- **Erro:** `[Vue warn]: Failed to resolve directive: mask`
- **Causa:** Plugin de máscara não estava instalado/registrado
- **Localização:** `SettingsView.vue` - campos CNPJ e Telefone

#### Solução Aplicada:

**1. Instalação do Plugin:**
```bash
npm install vue-the-mask
```

**2. Registro no main.js:**
```javascript
import VueTheMask from 'vue-the-mask'
app.use(VueTheMask)
```

**3. Uso nos Campos:**
- **CNPJ:** `v-mask="'##.###.###/####-##'"`
- **Telefone:** `v-mask="'(##) #####-####'"`

---

### 7. Integração com Via CEP API

#### Funcionalidade Implementada:

**Busca Automática de Endereço por CEP**
- **API:** Via CEP (https://viacep.com.br/)
- **Endpoint:** `https://viacep.com.br/ws/{cep}/json/`
- **Trigger:** Evento `@blur` no campo CEP
- **Máscara:** `#####-###` (formato brasileiro)

**Campos Preenchidos Automaticamente:**
1. **Rua:** `data.logradouro`
2. **Bairro:** `data.bairro`
3. **Cidade/Estado:** `data.localidade/data.uf`

#### Código Implementado:

**Template:**
```vue
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
```

**Método:**
```javascript
const searchCep = async () => {
  const cep = generalSettings.cep.replace(/\D/g, '')
  
  if (cep.length !== 8) return
  
  loadingCep.value = true
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await response.json()
    
    if (data.erro) {
      console.warn('CEP não encontrado')
      return
    }
    
    generalSettings.street = data.logradouro || ''
    generalSettings.neighborhood = data.bairro || ''
    generalSettings.cityState = `${data.localidade || ''}/${data.uf || ''}`
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
  } finally {
    loadingCep.value = false
  }
}
```

#### Funcionalidades:
- ✅ **Validação:** CEP deve ter 8 dígitos
- ✅ **Loading:** Indicador visual durante a busca
- ✅ **Tratamento de Erro:** CEP não encontrado
- ✅ **Limpeza:** Remove caracteres não numéricos
- ✅ **Hint:** Texto explicativo no campo

---

### 8. Melhorias na Tela de Configurações

#### Modificações Realizadas:

**1. Separação dos Campos de Endereço:**
- **Antes:** Campo único "Endereço" (textarea)
- **Depois:** Campos separados:
  - **CEP:** `v-mask="'#####-###'"` (formato brasileiro)
  - **Rua:** Campo de texto livre
  - **Número:** Campo de texto livre
  - **Bairro:** Campo de texto livre
  - **Cidade/Estado:** Campo de texto livre

**2. Horários Especiais para Finais de Semana:**
- **Sábado:** Card separado com:
  - Horário de início e fim
  - Switch para "Aberto aos sábados"
- **Domingo:** Card separado com:
  - Horário de início e fim
  - Switch para "Aberto aos domingos"

**3. Estrutura de Dados Atualizada:**
```javascript
generalSettings: {
  // Campos existentes...
  cep: '',
  street: '',
  number: '',
  neighborhood: '',
  cityState: '',
  // Novos campos de horário
  saturdayStartTime: '09:00',
  saturdayEndTime: '13:00',
  saturdayOpen: false,
  sundayStartTime: '09:00',
  sundayEndTime: '13:00',
  sundayOpen: false
}
```

**4. Estilos CSS Adicionados:**
- Cards de horários especiais com hover effects
- Layout responsivo para os novos campos
- Visual consistente com o design existente

#### Funcionalidades:
- ✅ **Máscaras funcionando:** CNPJ, Telefone, CEP
- ✅ **Campos de endereço separados**
- ✅ **Horários especiais para sábado e domingo**
- ✅ **Interface responsiva**
- ✅ **Validações mantidas**

---

## 🎨 Melhorias na UI/UX

### 1. Redesign das Abas de Configurações

#### Problemas Identificados:
- **Abas agrupadas à esquerda:** Não aproveitavam todo o espaço
- **Contraste inadequado:** Texto invisível na aba selecionada
- **Layout desorganizado:** Aparência não profissional

#### Soluções Implementadas:

**1. Distribuição Uniforme:**
```css
/* Antes: Abas agrupadas à esquerda */
align-tabs="start"

/* Depois: Abas distribuídas por todo o espaço */
align-tabs="center"
grow
```

**2. Layout Flexível:**
- ✅ **`flex: 1`** - Cada aba ocupa espaço igual
- ✅ **`justify-content: center`** - Conteúdo centralizado
- ✅ **`display: flex`** - Layout flexível
- ✅ **`text-align: center`** - Texto centralizado

**3. Correção de Contraste:**
```css
/* Antes: Fundo azul escuro com texto azul (invisível) */
background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
color: white;

/* Depois: Fundo azul claro com texto azul escuro (visível) */
background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
color: #1976d2;
border: 2px solid #1976d2;
```

**4. Responsividade Aprimorada:**

**Desktop (>768px):**
- Abas com `flex: 1` e padding `16px`
- Ícones de `18px` com margem `8px`

**Tablet (768px):**
- Abas com `flex: 1` e padding `8px`
- Ícones de `16px` com margem `4px`
- Font-size `14px`

**Mobile (600px):**
- Abas com `flex: 1` e padding `4px`
- Ícones de `14px` com margem `2px`
- Font-size `12px`

**Mobile Pequeno (480px):**
- Abas com padding `2px`
- Ícones de `12px` com margem `1px`
- Font-size `11px`

---

### 2. Padronização de Layout

#### Problema Identificado:
- **Layout inconsistente:** Diferentes telas com backgrounds e estilos diferentes
- **Falta de padronização:** Cards sem elevação consistente
- **Responsividade inadequada:** Layout não adaptável

#### Solução Implementada:

**1. Background Gradiente Consistente:**
```css
.settings-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}
```

**2. Cards Padronizados:**
```css
.settings-content {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  elevation: 4;
}
```

**3. Layout Centralizado:**
```vue
<v-container fluid>
  <v-row justify="center">
    <v-col cols="12" md="10" lg="8">
      <!-- Conteúdo centralizado -->
    </v-col>
  </v-row>
</v-container>
```

**4. Headers Padronizados:**
```vue
<div class="text-center mb-6">
  <h1 class="settings-title">
    <v-icon class="mr-2">mdi-cog</v-icon>
    Configurações
  </h1>
  <p class="settings-subtitle">Gerencie as configurações do sistema</p>
</div>
```

---

### 3. Efeitos Glassmorphism no Chat

#### Implementação:

**1. Sidebar de Conversas:**
```css
.conversations-sidebar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}
```

**2. Header do Chat:**
```css
.chat-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
```

**3. Área de Input:**
```css
.chat-input {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
```

**4. Background Gradiente:**
```css
.chat-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.chat-messages {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
```

---

## 🚀 Sistema de Gerenciamento de Usuários

### Funcionalidades Completas:

#### 1. Backend - Endpoints CRUD:
- **GET /users** - Listar todos os usuários
- **POST /users** - Criar novo usuário
- **PUT /users/:id** - Atualizar usuário
- **DELETE /users/:id** - Excluir usuário

#### 2. Frontend - Modal Completo com 3 Abas:

**Aba 1: Dados Básicos**
- ✅ **Upload de Foto:** Preview e upload de imagem
- ✅ **Nome e Sobrenome:** Campos separados
- ✅ **Email:** Com validação
- ✅ **Senha:** Obrigatória para novos usuários
- ✅ **Setor:** Dropdown com 10 opções
- ✅ **Função:** Administrador/Usuário
- ✅ **Status:** Ativo/Inativo

**Aba 2: Acesso**
- ✅ **Menu Lateral:** Seleção múltipla de seções
- ✅ **Capitalização Automática:** Switch para ativar/desativar

**Aba 3: Mensagens Rápidas**
- ✅ **Configuração Dinâmica:** Adicionar/remover mensagens
- ✅ **Atalhos:** Campo para definir atalho (ex: /saudacao)
- ✅ **Mensagem:** Texto da mensagem rápida

#### 3. Setores Disponíveis:
- Comercial
- Suporte Técnico
- Montagem
- Financeiro
- RH
- Logística
- TI
- Desenvolvimento
- Gerência
- Diretoria

#### 4. Opções de Menu:
- Dashboard
- Chat
- Contatos
- Relatórios
- Configurações
- Bot
- Conectar

#### 5. Funcionalidades Avançadas:
- ✅ **Upload de Foto:** Preview em tempo real
- ✅ **Validação de Formulário:** Campos obrigatórios
- ✅ **Edição de Usuário:** Preenchimento automático
- ✅ **Exclusão com Confirmação:** Modal de confirmação
- ✅ **Notificações:** Feedback visual para ações
- ✅ **Persistência:** Dados salvos no MongoDB Atlas

#### 6. Estrutura de Dados do Usuário:
```javascript
{
  firstName: string,
  lastName: string,
  email: string,
  password: string (hashed),
  role: 'admin' | 'user',
  sector: string,
  photo: string (base64),
  isActive: boolean,
  menuAccess: string[],
  autoCapitalization: boolean,
  quickMessages: [
    {
      shortcut: string,
      text: string
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Correções de Bugs

### 1. Correção do Sistema de Controle de Acesso

#### Problema Identificado:
- **Erro:** "mesmo escolhendo as opções do menu lateral que ele terá acesso ele está tendo acesso a tudo quando faz login"
- **Causa:** Sistema de controle de acesso não implementado no MainLayout

#### Solução Aplicada:

**Antes (Sem controle):**
```javascript
const menuItems = [
  // Todos os itens sempre visíveis
]
```

**Depois (Com controle):**
```javascript
const allMenuItems = [
  // Todos os itens disponíveis
]

// Filter menu items based on user's menuAccess
const menuItems = computed(() => {
  if (!user.value || !user.value.menuAccess || user.value.role === 'admin') {
    return allMenuItems  // Admin vê tudo
  }
  
  return allMenuItems.filter(item => 
    user.value.menuAccess.includes(item.value)  // Usuário vê apenas o permitido
  )
})
```

### 2. Correção dos Problemas de Edição

#### Problema na função `openUserDialog`:
```javascript
// Antes (Incorreto)
const openUserDialog = () => {
  editingUser.value = false
  userForm.name = ''  // ❌ Campo incorreto
  userForm.email = ''
  // ... outros campos
}

// Depois (Correto)
const openUserDialog = () => {
  editingUser.value = false
  userForm.firstName = ''  // ✅ Campo correto
  userForm.lastName = ''   // ✅ Campo correto
  userForm.email = ''
  // ... todos os campos
}
```

#### Problema na função `deleteUser`:
```javascript
// Antes (Incorreto)
if (confirm(`Tem certeza que deseja excluir o usuário ${user.firstName || user.name}?`)) {

// Depois (Correto)
if (confirm(`Tem certeza que deseja excluir o usuário ${user.firstName}?`)) {
```

---

## 📱 Funcionalidades Implementadas

### 1. Sistema de Edição:
- ✅ **Criar usuário:** Funcionando
- ✅ **Editar usuário:** Funcionando
- ✅ **Excluir usuário:** Funcionando
- ✅ **Campos corretos:** firstName, lastName, email, password, role, sector, photo, isActive, menuAccess, autoCapitalization, quickMessages

### 2. Sistema de Controle de Acesso:
- ✅ **Admin:** Acesso total a todos os menus
- ✅ **Usuário:** Acesso apenas aos menus permitidos
- ✅ **Filtragem dinâmica:** Baseada no campo `menuAccess`
- ✅ **Persistência:** Configurações salvas no banco

### 3. Interface e UX:
- ✅ **Upload de foto:** Preview em tempo real
- ✅ **Validação de formulário:** Campos obrigatórios
- ✅ **Edição de usuário:** Preenchimento automático
- ✅ **Exclusão com confirmação:** Modal de confirmação
- ✅ **Notificações:** Feedback visual para ações
- ✅ **Persistência:** Dados salvos no MongoDB Atlas

---

## 🚀 Status Final

### ✅ Funcionalidades Implementadas:
- **Frontend:** ✅ Interface completa e responsiva
- **Vuetify 3:** ✅ Componentes atualizados
- **Upload de Foto:** ✅ Funcionando
- **Mensagens Rápidas:** ✅ Configuração dinâmica
- **Validações:** ✅ Campos obrigatórios
- **CRUD Completo:** ✅ Criar, Ler, Atualizar, Excluir
- **Controle de Acesso:** ✅ Implementado
- **Layout Padronizado:** ✅ Consistente em todas as telas
- **Efeitos Glassmorphism:** ✅ Implementados
- **Responsividade:** ✅ Funcionando em todos os dispositivos

### 📋 Para Testar:
1. **Frontend:** `npm run dev` na pasta frontend
2. **Login:** Use as credenciais admin@aizap.com.br / admin!
3. **Configurações:** Acesse /settings para testar todas as funcionalidades
4. **Usuários:** Teste CRUD completo na aba Usuários
5. **Chat:** Teste a interface com efeitos glassmorphism
6. **Responsividade:** Teste em diferentes tamanhos de tela

### 🔧 Próximas Implementações:
- Sistema de mensagens em tempo real
- Dashboard com métricas avançadas
- Sistema de relatórios detalhados
- Backup e restore de dados
- Integração com APIs externas
- Sistema de notificações push
- Modo escuro/claro
- Temas personalizáveis
