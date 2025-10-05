# AiZap - Sistema de Multichat

Sistema completo de multichat desenvolvido com Vue.js, Vuetify e Node.js.

## 🚀 Tecnologias

### Frontend
- **Vue.js 3** - Framework JavaScript
- **Vuetify 3** - Framework de componentes Material Design
- **Vue Router** - Roteamento
- **Pinia** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📁 Estrutura do Projeto

```
AiZap/
├── frontend/          # Aplicação Vue.js
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── layouts/
│   │   ├── stores/
│   │   └── router/
│   └── package.json
├── backend/           # API Node.js
│   ├── index.js
│   ├── .env
│   └── package.json
└── README.md
```

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- MongoDB
- Git

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente (Backend)
Crie um arquivo `.env` na pasta `backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/aizap
JWT_SECRET=seu-jwt-secret-aqui
PORT=3001
```

### Banco de Dados
O sistema criará automaticamente um usuário administrador:
- **Email**: admin@aizap.com.br
- **Senha**: admin!

## 📱 Funcionalidades

### Sistema de Chat
- Interface similar ao WhatsApp Web
- Sidebar de conversas com abas (Atendimento, Aguardando, Finalizado)
- Chat em tempo real
- Envio de emojis e anexos
- Gravação de áudio
- Transferência e finalização de atendimento

### Configurações
- **Geral**: Informações da empresa e horários
- **Usuários**: CRUD completo de usuários
- **WhatsApp**: Configurações de API flexíveis
- **Manutenção**: Ferramentas de sistema
- **Backup**: Export/import com filtros

### Autenticação
- Login seguro com JWT
- Persistência de sessão
- Proteção de rotas

## 🎨 Interface

- Design responsivo
- Tema escuro para sidebar
- Layout limpo e moderno
- Navegação intuitiva
- Componentes Material Design

## 📊 Banco de Dados

### Usuários
```javascript
{
  email: String,
  password: String (hashed),
  name: String,
  role: String (admin/user),
  isActive: Boolean,
  createdAt: Date
}
```

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Tokens JWT para autenticação
- Validação de dados
- CORS configurado
- Helmet para headers de segurança

## 🚀 Deploy

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvedor

**Deyvison Chaves**
- GitHub: [@ChavesSD](https://github.com/ChavesSD)
- LinkedIn: [Deyvison Chaves](https://linkedin.com/in/deyvison-chaves)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato através do email: contato@aizap.com.br