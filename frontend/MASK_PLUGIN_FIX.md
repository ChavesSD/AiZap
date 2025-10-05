# Correção do Plugin de Máscara

## Problema Resolvido:
- **Erro:** `[Vue warn]: Failed to resolve directive: mask`
- **Causa:** Plugin de máscara não estava instalado/registrado
- **Localização:** `SettingsView.vue` - campos CNPJ e Telefone

## Solução Aplicada:

### 1. Instalação do Plugin:
```bash
npm install vue-the-mask
```

### 2. Registro no main.js:
```javascript
import VueTheMask from 'vue-the-mask'
app.use(VueTheMask)
```

### 3. Uso nos Campos:
- **CNPJ:** `v-mask="'##.###.###/####-##'"`
- **Telefone:** `v-mask="'(##) #####-####'"`

## Status:
✅ **Plugin instalado e registrado**
✅ **Frontend reiniciado**
✅ **Erro resolvido**

## Teste:
1. Acesse `http://localhost:3000/settings`
2. Verifique se os campos CNPJ e Telefone funcionam corretamente
3. Não deve mais aparecer o erro no console
