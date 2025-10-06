# Dimensões de Foto de Perfil - AiZap

## 📏 **Dimensões Atuais Configuradas:**

### **1. Modal de Edição/Criação de Usuário:**
- **Avatar:** `size="120"` (120x120 pixels)
- **Ícone:** `size="60"` (60x60 pixels)
- **Uso:** Preview da foto durante upload/edição

### **2. Tabela de Usuários:**
- **Avatar:** `size="40"` (40x40 pixels)
- **Uso:** Exibição compacta na lista de usuários

## 🎯 **Dimensões Recomendadas:**

### **📱 Para Upload (Arquivo Original):**
- **Tamanho ideal:** **400x400 pixels**
- **Formato:** JPG, PNG, WebP
- **Qualidade:** 80-90% (boa compressão)
- **Tamanho do arquivo:** Máximo 2MB
- **Proporção:** 1:1 (quadrada)

### **🖼️ Para Exibição:**

#### **Modal de Usuário (Preview):**
- **Atual:** 120x120 pixels ✅
- **Recomendado:** 120x120 pixels
- **Justificativa:** Tamanho adequado para preview

#### **Tabela de Usuários:**
- **Atual:** 40x40 pixels ✅
- **Recomendado:** 40x40 pixels
- **Justificativa:** Compacto, não ocupa muito espaço

#### **Menu/Navbar (Futuro):**
- **Recomendado:** 32x32 pixels
- **Uso:** Avatar pequeno no canto superior

## 🔧 **Configurações Técnicas:**

### **Upload de Arquivo:**
```javascript
// Dimensões máximas recomendadas
const MAX_WIDTH = 400;
const MAX_HEIGHT = 400;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
```

### **Redimensionamento Automático:**
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

## 📋 **Especificações por Contexto:**

### **1. Upload/Edição:**
- **Tamanho:** 120x120 pixels
- **Formato:** Circular (v-avatar)
- **Qualidade:** Alta (preview)

### **2. Lista/Tabela:**
- **Tamanho:** 40x40 pixels
- **Formato:** Circular (v-avatar)
- **Qualidade:** Média (compacta)

### **3. Perfil Completo (Futuro):**
- **Tamanho:** 200x200 pixels
- **Formato:** Circular (v-avatar)
- **Qualidade:** Alta (detalhada)

## 🎨 **Recomendações de Design:**

### **✅ Dimensões Ideais:**
- **Upload:** 400x400px (arquivo original)
- **Preview:** 120x120px (modal)
- **Lista:** 40x40px (tabela)
- **Navbar:** 32x32px (menu)

### **📐 Proporções:**
- **Formato:** Quadrado (1:1)
- **Corte:** Automático para círculo
- **Centro:** Foco no rosto

### **💾 Otimização:**
- **Compressão:** 80-90% qualidade
- **Formato:** JPG para fotos, PNG para ícones
- **Tamanho:** Máximo 2MB por arquivo

## 🚀 **Implementação Atual:**
- **Modal:** ✅ 120x120px
- **Tabela:** ✅ 40x40px
- **Upload:** ✅ Funcionando
- **Preview:** ✅ Funcionando

As dimensões atuais estão adequadas para o uso pretendido! 🎉
