import {inject} from '@loopback/core';
import {post, requestBody, HttpErrors} from '@loopback/rest';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class AuthController {
  constructor() {}

  @post('/auth/login')
  async login(@requestBody() credentials: LoginRequest): Promise<LoginResponse> {
    const {email, password} = credentials;

    // Validação básica
    if (!email || !password) {
      throw new HttpErrors.BadRequest('Email e senha são obrigatórios');
    }

    // Aqui será implementada a lógica de autenticação com MongoDB
    // Por enquanto, retornamos um token mock
    const mockUser = {
      id: '1',
      email: email,
      name: 'Usuário Teste'
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    return {
      token: mockToken,
      user: mockUser
    };
  }

  @post('/auth/register')
  async register(@requestBody() userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<{message: string}> {
    const {email, password, name} = userData;

    // Validação básica
    if (!email || !password || !name) {
      throw new HttpErrors.BadRequest('Todos os campos são obrigatórios');
    }

    // Aqui será implementada a lógica de registro com MongoDB
    return {
      message: 'Usuário registrado com sucesso'
    };
  }
}
