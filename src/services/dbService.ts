import { Pool, QueryResult } from 'pg';
import { config } from '../config/database.config';

// Crea un pool di connessioni PostgreSQL
const pool = new Pool(config.database);

// Test della connessione al database
pool.on('connect', () => {
  console.log('PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

export interface QueryOptions {
  text: string;
  params?: any[];
}

// Servizio DB
export const dbService = {
  /**
   * Esegue una query SQL
   */
  query: async <T = any>(text: string, params?: any[]): Promise<T[]> => {
    try {
      const result: QueryResult = await pool.query(text, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  /**
   * Ottiene un singolo record
   */
  queryOne: async <T = any>(text: string, params?: any[]): Promise<T | null> => {
    try {
      const result: QueryResult = await pool.query(text, params);
      return result.rowCount > 0 ? (result.rows[0] as T) : null;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  /**
   * Esegue una query di inserimento e restituisce l'ID
   */
  insert: async <T = any>(
    table: string, 
    data: Record<string, any>,
    returnColumns: string = '*'
  ): Promise<T | null> => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');
    
    const text = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING ${returnColumns}`;
    
    try {
      const result = await pool.query(text, values);
      return result.rows[0] as T;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  },

  /**
   * Chiude tutte le connessioni
   */
  close: async (): Promise<void> => {
    await pool.end();
  }
};

export default dbService;
