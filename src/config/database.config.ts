// Configurazione per l'applicazione React (frontend)
// Non utilizza process.env perché non disponibile nel browser

export const config = {
  // Database PostgreSQL - non usato direttamente dal frontend
  database: {
    // Queste configurazioni servono solo come riferimento, 
    // il frontend non si connette direttamente al DB
    host: 'localhost',
    port: 5433,
    database: 'changeOPS', 
    user: 'pgvector_user',
    password: 'pgvector_password'
  },
  
  // API - questa è l'unica configurazione realmente usata dal frontend
  api: {
    // URL base per le chiamate API
    baseUrl: 'http://localhost:5678'
  },

  // Auth
  auth: {
    expiresIn: '1d'
  }
};

// Manteniamo l'esportazione delle singole configurazioni per retrocompatibilità
export const dbConfig = config.database;
export const apiConfig = config.api;
