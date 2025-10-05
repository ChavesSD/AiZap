# Configuração do MongoDB Atlas

## Passos para configurar o MongoDB Atlas:

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

## Credenciais padrão do admin:
- **Email:** admin@aizap.com.br
- **Senha:** admin!

## Endpoints disponíveis:
- `GET /ping` - Health check
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de usuário
