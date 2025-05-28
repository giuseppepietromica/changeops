import apiService from './apiService';

export interface Question {
  domanda: string;
  validazione: string;
  ordine: number;
  is_rag_required: boolean;
  risposta?: string;
}

export interface AgentQuestion {
  id: string;
  domanda: string;
  validazione: string;
  is_rag_required: boolean;
  is_answered: boolean;
}

export interface AdminQuestion {
  id: string;
  agent_id: string;
  question_text: string;
  validation_prompt: string;
  is_rag_required: boolean;
  created_at: string;
  order?: number;
}

export interface AgentResponse {
  output: {
    domande: AgentQuestion[];
    session: number;
    agent: number;
  };
}

export interface QuestionResponse {
  id?: string;
  domanda?: string;
  validazione?: string;
  ordine?: number;
  is_rag_required?: boolean;
  is_answered?: boolean;
  response?: string;
}

export interface ValidationResponse {
  esito: "KO" | "OK";
  validation: string;
  session: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  description?: string;
}

export interface AgentSession {
  id: string;
  name?: string;
  description?: string;
  user?: string;
}

export interface SessionAnswer {
  question: string;
  answer: string;
  id: number;
}

export const api = {
  async executeAgent(agentId: string, sessionId: string, userEmail: string = "test@test.it", description: string = "nuova chat"): Promise<AgentResponse> {
    return apiService.webhookPost<AgentResponse>('/executeagent', {
      agent_id: agentId,
      user_email: userEmail,
      session_name: sessionId,
      description: description,
      task: "Execute"
    });
  },

  async getQuestion(session: string | number): Promise<QuestionResponse> {
    try {
      // Always convert session to string to ensure compatibility
      const sessionStr = session.toString();
      console.log("Calling getQuestion with session (string):", sessionStr);
      
      return apiService.webhookPost<QuestionResponse>('/executeagent', {
        session: sessionStr,
        task: "RetrieveQuestion"
      });
    } catch (error) {
      console.error("Error in getQuestion API call:", error);
      throw error;
    }
  },

  async submitAnswer(session: string | number, risposta: string): Promise<ValidationResponse> {
    try {
      // Always convert session to string to ensure compatibility
      const sessionStr = session.toString();
      console.log("Calling submitAnswer with session (string):", sessionStr);
      
      return apiService.webhookPost<ValidationResponse>('/executeagent', {
        session: sessionStr,
        task: "ValidateAnswer",
        risposta
      });
    } catch (error) {
      console.error("Error in submitAnswer API call:", error);
      throw error;
    }
  },

  async getAgents(): Promise<AgentInfo[]> {
    return apiService.webhookPost<AgentInfo[]>('/AgentsServices', {
      task: "GetAllAgents"
    });
  },

  async getAgentQuestions(agentId: string): Promise<AdminQuestion[]> {
    return apiService.webhookPost<AdminQuestion[]>('/AgentsServices', {
      agent: agentId,
      task: "GetAllQuestions"
    });
  },

  async deleteQuestion(questionId: string): Promise<any> {
    return apiService.webhookPost<any>('/AgentsServices', {
      id: questionId,
      task: "DeleteQuestion"
    });
  },

  async updateQuestion(
    questionId: string, 
    agentId: string, 
    question: string, 
    validation: string, 
    isRagRequired: boolean,
    order?: number
  ): Promise<any> {
    return apiService.webhookPost<any>('/AgentsServices', {
      id: questionId,
      agent: agentId,
      domanda: question,
      validazione: validation,
      is_rag_required: isRagRequired.toString(),
      order: order !== undefined ? order.toString() : undefined,
      task: "UpdateQuestion"
    });
  },
  
  async addQuestion(
    agentId: string, 
    question: string, 
    validation: string, 
    isRagRequired: boolean,
    order?: number
  ): Promise<any> {
    return apiService.webhookPost<any>('/AgentsServices', {
      agent: agentId,
      domanda: question,
      validazione: validation,
      is_rag_required: isRagRequired.toString(),
      order: order !== undefined ? order.toString() : undefined,
      task: "AddQuestion"
    });
  },
  
  async createAgent(
    agentName: string,
    description?: string
  ): Promise<any> {
    return apiService.webhookPost<any>('/AgentsServices', {
      agent: agentName,
      description: description || "",
      task: "CreateAgent"
    });
  },

  async getAgentSessions(agentId: string): Promise<AgentSession[]> {
    try {
      const response = await apiService.webhookPost<any>('/AgentsServices', {
        agent_id: agentId,
        task: "GetAllSessions"
      });
      
      // Controllo se response.data è un array
      if (Array.isArray(response)) {
        return response
          .filter((session: any) => session && session.id !== undefined)
          .map((session: any) => ({
            id: session.id,
            name: session.nome || 'N/A',
            description: session.descrizione || 'N/A',
            user: session.utente || 'N/A'
          }));
      } 
      
      // Se response.data non è un array ma contiene una proprietà 'sessions' che è un array
      else if (response && Array.isArray(response.sessions)) {
        return response.sessions
          .filter((session: any) => session && session.id !== undefined)
          .map((session: any) => ({
            id: session.id,
            name: session.nome || 'N/A',
            description: session.descrizione || 'N/A',
            user: session.utente || 'N/A'
          }));
      }
      
      // Se response.data è un oggetto con i dati di una singola sessione
      else if (response && response.id) {
        return [{
          id: response.id,
          name: response.nome || 'N/A',
          description: response.descrizione || 'N/A',
          user: response.utente || 'N/A'
        }];
      }
      
      // Se non riusciamo a interpretare la risposta, restituiamo un array vuoto
      console.error('Formato risposta non riconosciuto:', response);
      return [];
    } catch (error) {
      console.error('Errore durante il recupero delle sessioni:', error);
      throw error;
    }
  },

  async getSessionAnswers(sessionId: string): Promise<SessionAnswer[]> {
    return apiService.webhookPost<SessionAnswer[]>('/AgentsServices', {
      session: sessionId,
      task: "GetAllAnswers"
    });
  },

  async deleteAnswer(answerId: string): Promise<any> {
    return apiService.webhookPost<any>('/AgentsServices', {
      answer_id: answerId,
      task: "DeleteAnswer"
    });
  },

  async deleteAgent(agentId: string): Promise<any> {
    return apiService.webhookPost<any>('/AgentsServices', {
      agent_id: agentId,
      task: "DeleteAgent"
    });
  },

  async updateAgent(agentId: string, agentName: string, description: string): Promise<any> {
    return apiService.webhookPost<any>('/AgentsServices', {
      agent_id: agentId,
      agent_name: agentName,
      description,
      task: "UpdateAgent"
    });
  },

  async deleteSession(sessionId: string): Promise<any> {
    return apiService.webhookPost<any>('/AgentsServices', {
      session_id: sessionId,
      task: "DeleteSession"
    });
  }
};