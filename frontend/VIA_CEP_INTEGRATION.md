# Integração com Via CEP API

## ✅ **Funcionalidade Implementada:**

### **Busca Automática de Endereço por CEP**
- **API:** Via CEP (https://viacep.com.br/)
- **Endpoint:** `https://viacep.com.br/ws/{cep}/json/`
- **Trigger:** Evento `@blur` no campo CEP
- **Máscara:** `#####-###` (formato brasileiro)

### **Campos Preenchidos Automaticamente:**
1. **Rua:** `data.logradouro`
2. **Bairro:** `data.bairro`
3. **Cidade/Estado:** `data.localidade/data.uf`

### **Funcionalidades:**
- ✅ **Validação:** CEP deve ter 8 dígitos
- ✅ **Loading:** Indicador visual durante a busca
- ✅ **Tratamento de Erro:** CEP não encontrado
- ✅ **Limpeza:** Remove caracteres não numéricos
- ✅ **Hint:** Texto explicativo no campo

### **Código Implementado:**

#### **Template:**
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

#### **Método:**
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

## 🎯 **Como Usar:**
1. Digite um CEP válido (ex: 01310-100)
2. Saia do campo (evento blur)
3. Os campos de endereço serão preenchidos automaticamente
4. Indicador de loading aparece durante a busca

## 🚀 **Status:**
- **Integração:** ✅ Implementada
- **API:** ✅ Via CEP funcionando
- **Frontend:** ✅ Funcionando em `localhost:3000`
- **Teste:** ✅ Pronto para uso
