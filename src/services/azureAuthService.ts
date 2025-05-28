import { PublicClientApplication, AuthenticationResult, AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { User } from './authService';
import apiService from './apiService';

// Configurazione Azure AD
const AZURE_CONFIG = {
  clientId: '52b86875-fcb4-44f0-946b-05ac5b08048b', // Da sostituire con ID reale
  authority: 'https://login.microsoftonline.com/43856f99-e62c-4462-8b49-41c9e502ea83', // Da sostituire
  redirectUri: window.location.origin,
  scopes: ['User.Read', 'User.ReadBasic.All']
};

class AzureAuthService {
  private msalInstance: PublicClientApplication;
  private currentAccount: AccountInfo | null = null;
  
  constructor() {
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: AZURE_CONFIG.clientId,
        authority: AZURE_CONFIG.authority,
        redirectUri: AZURE_CONFIG.redirectUri,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: true
      }
    });
  }

  async initialize(): Promise<boolean> {
    try {
      // Verifica se c'è un account già loggato
      const accounts = this.msalInstance.getAllAccounts();
      
      if (accounts.length > 0) {
        this.currentAccount = accounts[0];
        return true;
      }
      return false;
    } catch (error) {
      console.error('Errore durante l\'inizializzazione di Azure AD:', error);
      return false;
    }
  }

  async login(): Promise<User | null> {
    try {
      // Esegue login popup con Azure
      const authResult = await this.msalInstance.loginPopup({
        scopes: AZURE_CONFIG.scopes,
        prompt: 'select_account'
      });
      
      if (authResult) {
        this.currentAccount = authResult.account;
        
        // Ottieni informazioni utente da Microsoft Graph
        const userInfo = await this.getUserInfo(authResult);
        
        // Registra o aggiorna l'utente nel backend
        const user = await this.registerUserWithBackend(userInfo, authResult.idToken);
        
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login Azure AD fallito:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.msalInstance.logoutPopup();
    } catch (error) {
      console.error('Logout Azure AD fallito:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (!this.currentAccount) {
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length === 0) {
          return null;
        }
        this.currentAccount = accounts[0];
      }

      const silentRequest = {
        scopes: AZURE_CONFIG.scopes,
        account: this.currentAccount,
        forceRefresh: false
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Token scaduto, è necessario ri-autenticarsi
        const response = await this.msalInstance.acquireTokenPopup({
          scopes: AZURE_CONFIG.scopes
        });
        return response.accessToken;
      }
      console.error('Errore nel recupero del token:', error);
      return null;
    }
  }

  async getUserInfo(authResult: AuthenticationResult): Promise<any> {
    // Usa il token per chiamare Microsoft Graph e ottenere informazioni utente
    const token = authResult.accessToken;
    
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Errore nel recupero dei dati utente: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Errore nel recupero delle informazioni utente da Graph:', error);
      throw error;
    }
  }

  async registerUserWithBackend(userInfo: any, idToken: string): Promise<User> {
    try {
      // Invia i dati utente Azure al backend per registrazione/login
      const response = await apiService.authPost<{user: User, token: string}>('/auth/azure-login', {
        idToken,
        email: userInfo.mail || userInfo.userPrincipalName,
        displayName: userInfo.displayName,
        firstName: userInfo.givenName,
        lastName: userInfo.surname,
        azureId: userInfo.id
      });

      // Salva il token JWT del backend in localStorage
      localStorage.setItem('changeops_auth_token', response.token);
      localStorage.setItem('changeops_user', JSON.stringify(response.user));
      
      return response.user;
    } catch (error) {
      console.error('Errore durante la registrazione dell\'utente nel backend:', error);
      throw error;
    }
  }

  getAccount(): AccountInfo | null {
    return this.currentAccount;
  }

  isAuthenticated(): boolean {
    return this.currentAccount !== null;
  }
}

export const azureAuthService = new AzureAuthService();
export default azureAuthService;
