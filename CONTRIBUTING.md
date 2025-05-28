# Guida al Contributo per ChangeOPS

Grazie per il tuo interesse a contribuire al progetto ChangeOPS! Questa guida ti aiuterà a seguire le convenzioni di codice e le pratiche adottate in questo progetto per garantire uniformità e alta qualità del codice.

## Indice

- [Ambiente di Sviluppo](#ambiente-di-sviluppo)
- [Struttura del Progetto](#struttura-del-progetto)
- [Convenzioni di Codice](#convenzioni-di-codice)
- [Flusso di Lavoro Git](#flusso-di-lavoro-git)
- [Test](#test)
- [Documentazione](#documentazione)
- [Best Practices](#best-practices)

## Ambiente di Sviluppo

### Prerequisiti

- Node.js (v16+)
- npm (v8+) o yarn (v1.22+)
- PostgreSQL (v14+)

### Setup Iniziale

1. Clona il repository:
   ```bash
   git clone https://github.com/yourusername/changeops.git
   cd changeops
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Configura le variabili d'ambiente creando un file `.env` basato su `.env.example`.

4. Inizializza il database:
   ```bash
   psql -U postgres -f sql/user_schema.sql
   ```

5. Avvia l'applicazione in modalità sviluppo:
   ```bash
   npm run dev
   ```

## Struttura del Progetto

ChangeOPS segue una struttura modulare con separazione delle responsabilità:

```
src/
├── components/        # Componenti UI React
│   ├── auth/          # Componenti per autenticazione
│   ├── layout/        # Componenti di layout (header, footer, ecc.)
│   └── users/         # Componenti per gestione utenti
├── services/          # Service layer per logica di business e API
├── config/            # Configurazione dell'applicazione
├── docs/              # Documentazione
├── App.tsx            # Componente principale
└── main.tsx           # Punto di ingresso dell'applicazione
```

## Convenzioni di Codice

### Generale

- Utilizza **TypeScript** per tutto il codice
- Segui le regole di lint definite in `eslint.config.js`
- Mantieni i file sotto le 300 righe quando possibile
- Usa nomi descrittivi per variabili, funzioni e componenti

### Componenti React

- Usa componenti funzionali con hooks
- Definisci interfacce esplicite per le props
- Organizza i componenti in questo ordine:
  1. Interfacce/Types
  2. Variabili di stato (useState)
  3. Effetti collaterali (useEffect)
  4. Funzioni di event handler
  5. Return JSX

Esempio:

```tsx
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

interface ExampleProps {
  initialValue: number;
  onUpdate: (value: number) => void;
}

const ExampleComponent: React.FC<ExampleProps> = ({ initialValue, onUpdate }) => {
  // Stati
  const [count, setCount] = useState<number>(initialValue);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Effetti
  useEffect(() => {
    onUpdate(count);
  }, [count, onUpdate]);
  
  // Event handlers
  const handleIncrement = (): void => {
    setCount(prevCount => prevCount + 1);
  };
  
  // JSX
  return (
    <div className="example-component">
      <p>Current count: {count}</p>
      <Button onClick={handleIncrement}>Increment</Button>
    </div>
  );
};

export default ExampleComponent;
```

### Service Layer

- Ogni servizio dovrebbe avere una responsabilità ben definita
- Usa interfacce TypeScript per definire i tipi di input/output
- Gestisci gli errori in modo appropriato
- Documenta le funzioni pubbliche con JSDoc

Esempio:

```typescript
/**
 * Recupera le informazioni di un agente dal server
 * @param agentId - L'identificativo dell'agente
 * @returns Promise con le informazioni dell'agente
 */
async function getAgentInfo(agentId: string): Promise<AgentInfo> {
  try {
    const response = await apiService.webhookGet<AgentInfo>(`/agents/${agentId}`);
    return response;
  } catch (error) {
    console.error('Errore nel recupero delle informazioni dell\'agente:', error);
    throw error;
  }
}
```

## Flusso di Lavoro Git

### Branch

- `main`: Branch principale, contiene codice stabile e pronto per la produzione
- `develop`: Branch di sviluppo, per integrare nuove feature
- `feature/nome-feature`: Branch per lo sviluppo di nuove funzionalità
- `bugfix/nome-bug`: Branch per correzioni di bug
- `release/x.y.z`: Branch per preparare il rilascio di una versione

### Commit

Segui il formato [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descrizione>

[corpo]

[piè di pagina]
```

Tipi comuni:
- `feat`: Nuova feature
- `fix`: Correzione di bug
- `docs`: Modifiche alla documentazione
- `style`: Modifiche di formattazione (non cambiano il codice)
- `refactor`: Refactoring del codice
- `test`: Aggiunta o modifica di test
- `chore`: Modifiche al processo di build o tool di sviluppo

Esempio:
```
feat(auth): implementa autenticazione con Azure AD

Aggiunge il supporto per il login tramite Microsoft Azure Active Directory.
Utilizza la libreria MSAL per gestire il flusso OAuth.

Closes #123
```

### Pull Request

1. Crea un branch dal branch appropriato (di solito `develop`)
2. Implementa le modifiche
3. Assicurati che il codice passi i test e il linting
4. Crea una Pull Request con una descrizione dettagliata
5. Attendi la review e l'approvazione

## Test

- Scrivi test unitari per i componenti usando React Testing Library
- Scrivi test unitari per i servizi
- Mantieni una copertura di test adeguata (almeno 70%)
- I test devono essere eseguiti con successo prima di fare commit

## Documentazione

- Documenta tutti i componenti pubblici e le funzioni con JSDoc
- Aggiorna `README.md` quando aggiungi nuove funzionalità significative
- Mantieni aggiornata la documentazione in `docs/`
- Aggiungi esempi d'uso quando possibile

## Best Practices

### Service Layer

1. **Centralizza le chiamate API** attraverso il service layer
2. **Gestisci sempre gli stati di caricamento e errore** quando usi i servizi
3. **Usa le interfacce TypeScript** fornite dai servizi per la type safety
4. **Verifica lo stato di autenticazione** prima di renderizzare componenti protetti

### Gestione degli Agenti

1. Separa la logica di presentazione dalla logica di business
2. Usa il pattern di gestione stato appropriato per la complessità del componente
3. Implementa la validazione degli input sul client e sul server

### Sicurezza

1. Non esporre informazioni sensibili nel codice client
2. Usa HTTPS per tutte le comunicazioni API
3. Implementa la validazione degli input
4. Segui le best practice per l'autenticazione e l'autorizzazione

### Performance

1. Minimizza le dipendenze esterne
2. Usa la memorizzazione in cache quando appropriato
3. Ottimizza i componenti che si rendono frequentemente
4. Sfrutta il code splitting per ridurre le dimensioni del bundle iniziale

---

Se hai domande o hai bisogno di ulteriori chiarimenti, non esitare a chiedere o a proporre miglioramenti a questa guida.
