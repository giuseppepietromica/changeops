# ChangeOPS

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-green.svg)

ChangeOPS è un sistema completo di gestione degli agenti AI, costruito con React e TypeScript. Permette agli utenti di creare, gestire e interagire con agenti AI attraverso un'interfaccia conversazionale intuitiva.

## 🚀 Funzionalità

- **Gestione Agenti**: Crea, modifica ed elimina agenti AI con nomi e descrizioni personalizzate
- **Gestione Domande**: Crea e gestisci domande per ogni agente, incluse regole di validazione
- **Gestione Sessioni**: Visualizza e gestisci le sessioni di chat degli agenti e le relative risposte
- **Interfaccia di Chat Interattiva**: Chatta con gli agenti attraverso un'interfaccia user-friendly
- **Autenticazione Utente**: Login sicuro e controllo degli accessi basato sui ruoli
- **Design Responsive**: Funziona su dispositivi desktop e mobili

## 🛠️ Stack Tecnologico

- **Frontend**: React 18, TypeScript, Bootstrap 5
- **Routing**: React Router v6
- **Gestione Stato**: React Hooks (useState, useEffect)
- **Client HTTP**: Axios
- **Autenticazione**: Servizio di autenticazione personalizzato con token + integrazione Azure AD
- **Componenti UI**: React Bootstrap
- **Build Tool**: Vite

## 📋 Prerequisiti

- Node.js (v16+)
- npm (v8+) o yarn (v1.22+)
- PostgreSQL (v14+)

## 🔧 Installazione

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

## 📚 Documentazione

- [Architettura](./src/docs/architecture.md) - Panoramica dettagliata dell'architettura dell'applicazione
- [Servizi](./src/docs/services.md) - Documentazione del layer dei servizi

## 🤝 Contribuire

Se desideri contribuire al progetto, consulta la nostra [Guida al Contributo](./CONTRIBUTING.md).

Seguiamo il flusso di lavoro standard di GitHub con branch, pull request e issue. Per contribuire:

1. Forka il repository
2. Crea un branch per la tua feature (`git checkout -b feature/amazing-feature`)
3. Committa le tue modifiche (`git commit -m 'feat: aggiungi una funzionalità fantastica'`)
4. Pusha il branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## 📝 Linee Guida per il Codice

- Usa TypeScript per tutto il codice
- Segui le convenzioni di codice definite nel file [CONTRIBUTING.md](./CONTRIBUTING.md)
- Scrivi test per le nuove funzionalità
- Documenta il codice con JSDoc
- Segui il formato [Conventional Commits](https://www.conventionalcommits.org/) per i messaggi di commit

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file [LICENSE](./LICENSE) per ulteriori informazioni.

## 📬 Contatti

Nome del Team - [@twitter_handle](https://twitter.com/twitter_handle) - email@example.com

Link del Progetto: [https://github.com/yourusername/changeops](https://github.com/yourusername/changeops)
