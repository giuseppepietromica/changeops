import { azureAuthService } from './azureAuthService';
import apiService from './apiService';
import { apiConfig } from '../config/database.config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  azureId?: string; // ID utente Azure AD
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface UserCreateRequest {
  email: string;
  username: string;
  password?: string; // Opzionale per utenti Azure
  firstName?: string;
  lastName?: string;
  roleId: number;
  azureId?: string; // ID utente Azure AD
  isAzureUser?: boolean;
}

export interface UserUpdateRequest {
  id: number;
  email?: string;
  username?: string;
  password?: string; 
  firstName?: string;
  lastName?: string;
  roleId?: number;
  isActive?: boolean;
  azureId?: string;
  isAzureUser?: boolean;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

const TOKEN_KEY = 'changeops_auth_token';
const USER_KEY = 'changeops_user';
const AUTH_METHOD_KEY = 'changeops_auth_method';

// Tipo di autenticazione
export enum AuthMethod {
  LOCAL = 'local',
  AZURE = 'azure'
}

export const authService = {
  // Verifica se l'utente è già autenticato all'avvio dell'app
  async initialize(): Promise<boolean> {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    
    if (token && user) {
      return true;
    }
    
    return false;
  },

  // Login con username/password (DB locale)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Implementazione di esempio
    const mockResponse: AuthResponse = {
      user: {
        id: 1,
        email: credentials.username,
        username: credentials.username,
        role: 'user',
        isActive: true
      },
      token: 'mock-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem(TOKEN_KEY, mockResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(mockResponse.user));
    localStorage.setItem(AUTH_METHOD_KEY, AuthMethod.LOCAL);
    
    return mockResponse;
  },

  // Login con Azure AD
  async loginWithAzure(): Promise<User | null> {
    // Implementazione di esempio
    return null;
  },

  // Logout
  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_METHOD_KEY);
    window.location.href = '/login';
  },

  // Verifica autenticazione
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  // Ottieni token JWT
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Ottieni dati utente corrente
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  // Ottieni metodo autenticazione
  getAuthMethod(): AuthMethod {
    return (localStorage.getItem(AUTH_METHOD_KEY) as AuthMethod) || AuthMethod.LOCAL;
  },

  // OPERAZIONI SULLA GESTIONE UTENTI
  async getUsers(): Promise<User[]> {
    // Implementazione di esempio
    return [];
  },

  async getRoles(): Promise<Role[]> {
    // Implementazione di esempio
    return [
      { id: 1, name: 'admin', description: 'Amministratore' },
      { id: 2, name: 'user', description: 'Utente standard' }
    ];
  },

  async createUser(userData: UserCreateRequest): Promise<User> {
    // Implementazione di esempio
    return {
      id: Math.floor(Math.random() * 1000),
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'user',
      isActive: true
    };
  },

  async updateUser(userData: UserUpdateRequest): Promise<User> {
    // Implementazione di esempio
    return {
      id: userData.id,
      email: userData.email || '',
      username: userData.username || '',
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'user',
      isActive: userData.isActive !== undefined ? userData.isActive : true
    };
  },

  async deleteUser(userId: number): Promise<void> {
    // Implementazione di esempio
  }
};
