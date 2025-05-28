import axios, { AxiosInstance } from 'axios';
import { authService } from './authService';
import { apiConfig } from '../config/database.config';

// Configurazione ambiente da file config
const API_CONFIG = {
  // Webhook per operazioni legate agli agenti (n8n)
  WEBHOOK_BASE_URL: `${apiConfig.baseUrl}/webhook`,
  
  // API per autenticazione e gestione utenti (PostgreSQL)
  AUTH_BASE_URL: `${apiConfig.baseUrl}/api`
};

// Classe per gestire le chiamate API
class ApiService {
  private webhookClient: AxiosInstance;
  private authClient: AxiosInstance;

  constructor() {
    // Client per le chiamate webhook (n8n)
    this.webhookClient = axios.create({
      baseURL: API_CONFIG.WEBHOOK_BASE_URL
    });

    // Client per le chiamate auth/user (PostgreSQL)
    this.authClient = axios.create({
      baseURL: API_CONFIG.AUTH_BASE_URL
    });

    // Configura intercettori per aggiungere token a tutte le richieste
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercettore per aggiungere token a richieste webhook
    this.webhookClient.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercettore per aggiungere token a richieste auth
    this.authClient.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercettore per gestire token scaduti
    const handleExpiredToken = (error: any) => {
      if (error.response?.status === 401) {
        // Token scaduto o non valido
        authService.logout();
      }
      return Promise.reject(error);
    };

    this.webhookClient.interceptors.response.use(
      response => response,
      handleExpiredToken
    );

    this.authClient.interceptors.response.use(
      response => response,
      handleExpiredToken
    );
  }

  // Metodi per chiamate webhook (n8n)
  async webhookPost<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.webhookClient.post(endpoint, data);
    return response.data;
  }

  async webhookGet<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.webhookClient.get(endpoint, { params });
    return response.data;
  }

  // Metodi per chiamate auth/user (PostgreSQL)
  async authPost<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.authClient.post(endpoint, data);
    return response.data;
  }

  async authGet<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.authClient.get(endpoint, { params });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
