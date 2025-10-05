const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aizap';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB conectado com sucesso!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Test connection
    await mongoose.connection.db.admin().ping();
    console.log('🏓 Ping MongoDB: OK');
    
    // Create admin user if not exists
    await createAdminUser();
    
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    process.exit(1);
  }
};

// Create Admin User
const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@aizap.com.br';
    const adminPassword = 'admin!';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('👤 Usuário admin já existe');
      return;
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrador AiZap',
      role: 'admin',
      isActive: true
    });
    
    await adminUser.save();
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
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
  });
});

// Auth routes
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
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
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
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
        email: user.email,
        name: user.name,
        role: user.role
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
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'Usuário já existe'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: 'user',
      isActive: true
    });

    await user.save();

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
