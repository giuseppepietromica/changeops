// Utility per gestire le variabili d'ambiente in Vite

/**
 * Accede alle variabili d'ambiente di Vite in modo sicuro
 * Le variabili d'ambiente in Vite devono iniziare con VITE_
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5678',
  
  // Aggiungi altre variabili d'ambiente secondo necessità
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};
