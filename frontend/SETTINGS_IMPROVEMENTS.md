# Melhorias na Tela de Configurações

## ✅ **Modificações Realizadas:**

### 1. **Separação dos Campos de Endereço:**
- **Antes:** Campo único "Endereço" (textarea)
- **Depois:** Campos separados:
  - **CEP:** `v-mask="'#####-###'"` (formato brasileiro)
  - **Rua:** Campo de texto livre
  - **Número:** Campo de texto livre
  - **Bairro:** Campo de texto livre
  - **Cidade/Estado:** Campo de texto livre

### 2. **Horários Especiais para Finais de Semana:**
- **Sábado:** Card separado com:
  - Horário de início e fim
  - Switch para "Aberto aos sábados"
- **Domingo:** Card separado com:
  - Horário de início e fim
  - Switch para "Aberto aos domingos"

### 3. **Estrutura de Dados Atualizada:**
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

### 4. **Estilos CSS Adicionados:**
- Cards de horários especiais com hover effects
- Layout responsivo para os novos campos
- Visual consistente com o design existente

## 🎯 **Funcionalidades:**
- ✅ **Máscaras funcionando:** CNPJ, Telefone, CEP
- ✅ **Campos de endereço separados**
- ✅ **Horários especiais para sábado e domingo**
- ✅ **Interface responsiva**
- ✅ **Validações mantidas**

## 🚀 **Status:**
- **Frontend:** ✅ Funcionando em `localhost:3000`
- **Backend:** ✅ Funcionando em `localhost:3001`
- **Máscaras:** ✅ Plugin `vue-the-mask` instalado
- **Interface:** ✅ Todas as modificações aplicadas
