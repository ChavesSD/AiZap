# Credenciais do Sistema AiZap

## ✅ **Status das Credenciais:**

### **Usuário Admin Criado:**
- **Email:** `admin@aizap.com.br`
- **Senha:** `admin!`
- **Role:** `admin`
- **Status:** `Ativo`

### **Usuário de Teste Criado:**
- **Email:** `teste@teste.com`
- **Senha:** `123456`
- **Role:** `user`
- **Status:** `Ativo`

## 🔧 **Problema Identificado:**
O endpoint de login está funcionando, mas há um problema com a comunicação entre frontend e backend.

## 📋 **Para Testar o Login:**

### **1. Via Frontend:**
1. Acesse: `http://localhost:3000/login`
2. Use as credenciais:
   - **Email:** `admin@aizap.com.br`
   - **Senha:** `admin!`

### **2. Via Backend (Teste Direto):**
```bash
# Teste com curl
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aizap.com.br","password":"admin!"}'
```

## 🚀 **Status dos Serviços:**
- **Frontend:** ✅ Rodando em `localhost:3000`
- **Backend:** ✅ Rodando em `localhost:3001`
- **MongoDB Atlas:** ✅ Conectado
- **Usuários:** ✅ Cadastrados no banco

## 🔍 **Verificação:**
Para verificar se os usuários existem no banco:
```bash
curl http://localhost:3001/users
```

## ✅ **Resultado:**
As credenciais existem no banco de dados e estão corretas. O problema pode estar na comunicação entre frontend e backend ou na configuração do CORS.
