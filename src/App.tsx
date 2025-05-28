/**
 * Main application component for ChangeOPS.
 * 
 * This application is a comprehensive agent management system that allows users to:
 * - Create, edit, and delete AI agents
 * - Manage agent questions and validation logic
 * - View and manage agent sessions
 * - Chat with agents in an interactive interface
 * - View session details and answers
 * 
 * The application uses React Router for navigation and includes protected routes
 * that require authentication to access.
 */
import React, { useState, useEffect, useRef, ChangeEvent } from 'react'
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert, Table, Navbar, Nav, Badge, Modal } from 'react-bootstrap'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'
import { api, QuestionResponse, ValidationResponse, AgentInfo, AdminQuestion, AgentSession, SessionAnswer, AgentResponse, AgentQuestion } from './services/api'
import axios from 'axios'
import { authService } from './services/authService'
import LoginPage from './components/auth/LoginPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import UserManagement from './components/users/UserManagement'
import { apiConfig } from './config/database.config';
import Header from './components/layout/Header';

/**
 * Interface representing a chat message
 */
interface Message {
  isUser: boolean;  // Whether the message is from the user (true) or agent (false)
  text: string;     // The message content
  validation?: string; // Optional validation message for user inputs
}

/**
 * Props for the Loader component
 */
interface LoaderProps {
  message: string;  // Loading message to display
}

/**
 * Loader component to show loading states with a message
 */
const Loader: React.FC<LoaderProps> = ({ message }) => (
  <div className="loader-overlay">
    <div className="loader-content">
      <Spinner animation="border" size="sm" className="me-2" />
      <span>{message}</span>
    </div>
  </div>
);

/**
 * Generate a unique GUID for new sessions
 * @returns A random GUID string
 */
const generateGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function App() {
  // Base URL for API calls
  const API_BASE_URL = apiConfig.baseUrl;

  // ==========================================
  // AGENT MANAGEMENT STATE
  // ==========================================
  
  // Agent list state
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [agentLoading, setAgentLoading] = useState<boolean>(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [filteredAgents, setFilteredAgents] = useState<AgentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Agent editing state
  const [showEditAgentModal, setShowEditAgentModal] = useState<boolean>(false);
  const [editingAgent, setEditingAgent] = useState<AgentInfo | null>(null);
  const [editAgentName, setEditAgentName] = useState<string>('');
  const [editAgentDescription, setEditAgentDescription] = useState<string>('');
  const [isEditingAgent, setIsEditingAgent] = useState<boolean>(false);
  const [editAgentError, setEditAgentError] = useState<string | null>(null);
  
  // Agent creation state
  const [showAddAgentModal, setShowAddAgentModal] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState<string>('');
  const [newAgentDescription, setNewAgentDescription] = useState<string>('');
  const [isAddingAgent, setIsAddingAgent] = useState<boolean>(false);
  const [addAgentError, setAddAgentError] = useState<string | null>(null);
  
  // Agent deletion state
  const [showDeleteAgentConfirm, setShowDeleteAgentConfirm] = useState<boolean>(false);
  const [deletingAgent, setDeletingAgent] = useState<AgentInfo | null>(null);
  const [isDeletingAgent, setIsDeletingAgent] = useState<boolean>(false);
  const [deleteAgentError, setDeleteAgentError] = useState<string | null>(null);

  // ==========================================
  // QUESTION MANAGEMENT STATE
  // ==========================================
  
  const [selectedAgentForQuestions, setSelectedAgentForQuestions] = useState<AgentInfo | null>(null);
  const [adminQuestions, setAdminQuestions] = useState<AdminQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  
  // Question editing state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);
  const [editQuestionText, setEditQuestionText] = useState<string>('');
  const [editValidationText, setEditValidationText] = useState<string>('');
  const [editRagRequired, setEditRagRequired] = useState<boolean>(false);
  const [editQuestionOrder, setEditQuestionOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Question creation state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newValidationText, setNewValidationText] = useState<string>('');
  const [newRagRequired, setNewRagRequired] = useState<boolean>(false);
  const [newQuestionOrder, setNewQuestionOrder] = useState<number>(0);
  const [isAddingQuestion, setIsAddingQuestion] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);
  
  // Question deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deletingQuestion, setDeletingQuestion] = useState<AdminQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // ==========================================
  // SESSION MANAGEMENT STATE
  // ==========================================
  
  const [selectedAgentForSessions, setSelectedAgentForSessions] = useState<AgentInfo | null>(null);
  const [agentSessions, setAgentSessions] = useState<AgentSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  
  // Session deletion state
  const [showDeleteSessionConfirm, setShowDeleteSessionConfirm] = useState<boolean>(false);
  const [deletingSession, setDeletingSession] = useState<AgentSession | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState<boolean>(false);
  const [deleteSessionError, setDeleteSessionError] = useState<string | null>(null);
  
  // Session detail state
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
  const [sessionAnswersLoading, setSessionAnswersLoading] = useState<boolean>(false);
  const [sessionAnswersError, setSessionAnswersError] = useState<string | null>(null);
  
  // Answer deletion state
  const [showDeleteAnswerConfirm, setShowDeleteAnswerConfirm] = useState<boolean>(false);
  const [deletingAnswerId, setDeletingAnswerId] = useState<string>("");
  const [isDeletingAnswer, setIsDeletingAnswer] = useState<boolean>(false);
  const [deleteAnswerError, setDeleteAnswerError] = useState<string | null>(null);

  // ==========================================
  // CHAT INTERFACE STATE
  // ==========================================
  
  // New chat view state
  const [newChatAgents, setNewChatAgents] = useState<AgentInfo[]>([]);
  const [newChatAgentsLoading, setNewChatAgentsLoading] = useState<boolean>(false);
  const [newChatAgentsError, setNewChatAgentsError] = useState<string | null>(null);
  const [newChatSearchTerm, setNewChatSearchTerm] = useState<string>("");
  const [filteredNewChatAgents, setFilteredNewChatAgents] = useState<AgentInfo[]>([]);
  
  // Active chat state
  const [selectedAgentForChat, setSelectedAgentForChat] = useState<AgentInfo | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionNumericId, setSessionNumericId] = useState<number | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [chatQuestions, setChatQuestions] = useState<AgentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  // UI and loading state
  const [currentView, setCurrentView] = useState<'agents' | 'dashboard'>('agents');
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'agents' | 'questions' | 'sessions' | 'session_details' | 'new_chat' | 'chat'>('agents');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // ==========================================
  // AUTHENTICATION STATE
  // ==========================================
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // ==========================================
  // EFFECTS
  // ==========================================
  
  /**
   * Effect to scroll to the bottom of the messages container when messages change
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Effect to load the initial list of agents on component mount
   */
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const fetchedAgents = await api.getAgents();
        setAgents(fetchedAgents);
        setFilteredAgents(fetchedAgents);
      } catch (error: any) {
        console.error("Errore durante il caricamento degli agenti:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  /**
   * Effect to filter agents based on search term
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAgents(agents);
    } else {
      const filtered = agents.filter(
        agent => 
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAgents(filtered);
    }
  }, [searchTerm, agents]);

  /**
   * Effect to filter new chat agents based on search term
   */
  useEffect(() => {
    if (!newChatSearchTerm.trim()) {
      setFilteredNewChatAgents(newChatAgents);
    } else {
      const filtered = newChatAgents.filter(
        agent => 
          agent.name.toLowerCase().includes(newChatSearchTerm.toLowerCase()) || 
          (agent.description && agent.description.toLowerCase().includes(newChatSearchTerm.toLowerCase()))
      );
      setFilteredNewChatAgents(filtered);
    }
  }, [newChatSearchTerm, newChatAgents]);

  /**
   * Effect to check authentication status and keep it in sync
   */
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
      setCurrentUser(authService.getCurrentUser());
    };
    
    // Check on startup
    checkAuth();
    
    // Set up a listener for storage events to sync auth state between tabs
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  
  /**
   * Scrolls to the bottom of the messages container
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Adds a new message to the chat
   */
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  /**
   * Handles user logout
   */
  const handleLogout = () => {
    authService.logout();
  };

  // ==========================================
  // CHAT FUNCTIONS
  // ==========================================
  
  /**
   * Starts a new chat with the selected agent
   * @param agent The agent to start a chat with
   */
  const startNewChat = async (agent: AgentInfo) => {
    try {
      // Show a full page loader during API call
      setShowLoader(true);
      setLoadingMessage("Inizializzazione agente...");
      setSelectedAgentForChat(agent);
      
      // Generate a unique session ID (GUID)
      const newSessionId = generateGuid();
      console.log("Generated session ID:", newSessionId);
      setSessionId(newSessionId);

      // Step 1: Call the executeagent endpoint with task "Execute"
      console.log("Step 1: Calling executeagent with task Execute");
      const executeResponse = await axios.post(`${API_BASE_URL}/webhook/executeagent`, {
        agent_id: agent.id,
        user_email: "test@test.it",
        session_name: newSessionId,
        description: "nuova chat",
        task: "Execute"
      });
      
      console.log("Execute agent response:", executeResponse.data);
      
      // Store the agent ID from the execute response if available
      if (executeResponse.data && executeResponse.data.output) {
        setSelectedAgentId(executeResponse.data.output.agent);
      }
      
      // Step 2: Call AgentsServices to get all sessions for this agent
      console.log("Step 2: Calling AgentsServices to get all sessions");
      setLoadingMessage("Recupero informazioni della sessione...");
      
      const sessionsResponse = await axios.post(`${API_BASE_URL}/webhook/AgentsServices`, {
        agent_id: agent.id,
        task: "GetAllSessions"
      });
      
      console.log("Sessions response:", sessionsResponse.data);
      
      // Find the session that matches our generated GUID
      let sessionNumericId = null;
      if (Array.isArray(sessionsResponse.data)) {
        const matchingSession = sessionsResponse.data.find(session => session.nome === newSessionId);
        if (matchingSession) {
          sessionNumericId = matchingSession.id;
          setSessionNumericId(sessionNumericId);
          console.log("Found matching session with numeric ID:", sessionNumericId);
        } else {
          console.warn("No matching session found for GUID:", newSessionId);
          // We'll continue and try other approaches
        }
      }
      
      // After finding the session ID, update the loading message for the question retrieval
      setLoadingMessage("Recupero della prima domanda...");
      
      // Try different ways to make the question retrieval call
      let questionData = null;
      let errorMessages = [];
      
      // Option 1: Use the numeric session ID if found
      if (sessionNumericId) {
        try {
          console.log("Step 3 (Option 1): Calling executeagent with numeric session ID");
          const questionResponse = await axios.post(`${API_BASE_URL}/webhook/executeagent`, {
            session: sessionNumericId.toString(),
            task: "RetrieveQuestion"
          });
          
          console.log("Question response (Option 1):", questionResponse);
          console.log("Question data (Option 1):", questionResponse.data);
          
          if (questionResponse.data && (questionResponse.data.domanda || questionResponse.data.id)) {
            questionData = questionResponse.data;
            console.log("Question data found using numeric ID");
          } else {
            errorMessages.push("Option 1 failed: Response doesn't contain question data");
          }
        } catch (error: any) {
          console.error("Error in Option 1:", error);
          errorMessages.push(`Option 1 error: ${error.message}`);
        }
      }
      
      // Option 2: If Option 1 failed, try using the GUID
      if (!questionData) {
        try {
          console.log("Step 3 (Option 2): Calling executeagent with GUID");
          const questionResponse = await axios.post(`${API_BASE_URL}/webhook/executeagent`, {
            session: newSessionId,
            task: "RetrieveQuestion"
          });
          
          console.log("Question response (Option 2):", questionResponse);
          console.log("Question data (Option 2):", questionResponse.data);
          
          if (questionResponse.data && (questionResponse.data.domanda || questionResponse.data.id)) {
            questionData = questionResponse.data;
            console.log("Question data found using GUID");
          } else {
            errorMessages.push("Option 2 failed: Response doesn't contain question data");
          }
        } catch (error: any) {
          console.error("Error in Option 2:", error);
          errorMessages.push(`Option 2 error: ${error.message}`);
        }
      }
      
      // Process the question if we found it
      if (questionData) {
        console.log("Processing question data:", questionData);
        
        // Set the question data
        setCurrentQuestion({
          domanda: questionData.domanda,
          validazione: questionData.validazione,
          is_rag_required: questionData.is_rag_required
        });
        
        // Add welcome message and the question to the chat
        setMessages([
          {
            isUser: false,
            text: `Benvenuto nella chat con ${agent.name}! Sono qui per assisterti. Ti porrò alcune domande per completare l'attività.`
          },
          {
            isUser: false,
            text: questionData.domanda
          }
        ]);
        
        // Navigate to the chat view
        setActiveMenu('chat');
      } else {
        console.error("All options failed. Error messages:", errorMessages);
        throw new Error(`Nessuna domanda ricevuta dall'agente. Errors: ${errorMessages.join("; ")}`);
      }
    } catch (error: any) {
      console.error("Errore durante l'inizializzazione della chat:", error);
      setMessages([
        {
          isUser: false,
          text: "Si è verificato un errore durante l'inizializzazione della chat. Riprova più tardi."
        }
      ]);
      // Alert error for debugging
      alert(`Errore: ${error.message}`);
    } finally {
      setShowLoader
              return;
            } else if (nextQuestionResponse.data.domanda || nextQuestionResponse.data.id) {
              // Process the next question
              console.log("Processing next question data:", nextQuestionResponse.data);
              
              // Set the next question
              setCurrentQuestion({
                domanda: nextQuestionResponse.data.domanda,
                validazione: nextQuestionResponse.data.validazione,
                is_rag_required: nextQuestionResponse.data.is_rag_required
              });
              
              // Add the question to the chat
              addMessage({ 
                isUser: false, 
                text: nextQuestionResponse.data.domanda
              });
            } else {
              throw new Error("Risposta non contiene una domanda valida");
            }
          } else {
            throw new Error("Nessuna risposta valida dalla API");
          }
        }
      } catch (error: any) {
        console.error("Error during API calls:", error);
        throw error;
      }
    } catch (error: any) {
      console.error('Errore durante l\'invio della risposta:', error);
      addMessage({ 
        isUser: false, 
        text: `Si è verificato un errore durante l'invio: ${error.message}` 
      });
    } finally {
      // Always hide loading state when done
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleShowQuestions = async (agent: AgentInfo) => {
    try {
      setQuestionsLoading(true);
      setQuestionsError(null);
      setSelectedAgentForQuestions(agent);
      setActiveMenu('questions');
      
      await fetchAgentQuestions(agent.id);
    } catch (error: any) {
      console.error("Errore durante il caricamento delle domande:", error);
      setQuestionsError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setQuestionsLoading(false);
    }
  };
  
  const fetchAgentQuestions = async (agentId: string) => {
    try {
      const questions = await api.getAgentQuestions(agentId);
      // Sort questions by order (if exists) or default to id sorting
      const sortedQuestions = [...questions].sort((a, b) => {
        // If both questions have order property, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize the one with order
        else if (a.order !== undefined) {
          return -1;
        }
        else if (b.order !== undefined) {
          return 1;
        }
        // If neither has order, sort by id
        return a.id.localeCompare(b.id);
      });
      setAdminQuestions(sortedQuestions);
    } catch (error: any) {
      console.error("Errore durante il caricamento delle domande:", error);
      setQuestionsError(error instanceof Error ? error.message : 'Errore sconosciuto');
      throw error;
    }
  };
  
  const handleBackToAgents = () => {
    setActiveMenu('agents');
    setSelectedAgentForQuestions(null);
    setAdminQuestions([]);
  };

  const handleShowSessions = async (agent: AgentInfo) => {
    try {
      setSessionsLoading(true);
      setSessionsError(null);
      setSelectedAgentForSessions(agent);
      setActiveMenu('sessions');
      
      await fetchAgentSessions(agent.id);
    } catch (error: any) {
      console.error("Errore durante il caricamento delle sessioni:", error);
      setSessionsError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setSessionsLoading(false);
    }
  };
  
  const fetchAgentSessions = async (agentId: string) => {
    try {
      const sessions = await api.getAgentSessions(agentId);
      // Filtro ulteriormente per rimuovere qualsiasi sessione potenzialmente undefined o con id undefined
      const validSessions = sessions.filter(session => session && session.id !== undefined);
      setAgentSessions(validSessions);
    } catch (error: any) {
      console.error("Errore durante il caricamento delle sessioni:", error);
      setSessionsError(error instanceof Error ? error.message : 'Errore sconosciuto');
      throw error;
    }
  };
  
  const handleBackFromSessions = () => {
    setActiveMenu('agents');
    setSelectedAgentForSessions(null);
    setAgentSessions([]);
  };

  const navigateTo = (view: 'agents' | 'dashboard' | 'questions' | 'sessions' | 'new_chat') => {
    setActiveMenu(view);
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, menu: 'dashboard' | 'agents' | 'sessions' | 'new_chat') => {
    e.preventDefault();
    
    // Se stiamo visualizzando le domande, torniamo alla lista degli agenti
    if (activeMenu === 'questions' && menu === 'agents') {
      handleBackToAgents();
    } else if (menu === 'new_chat') {
      handleNewChatView();
    } else {
      setActiveMenu(menu);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Funzioni per la modifica delle domande
  const handleEditQuestion = (question: AdminQuestion) => {
    setEditingQuestion(question);
    setEditQuestionText(question.question_text);
    setEditValidationText(question.validation_prompt);
    setEditRagRequired(question.is_rag_required);
    setEditQuestionOrder(question.order !== undefined ? question.order : 0); // Add this line
    setSubmitError(null);
    setShowEditModal(true);
  };
  
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingQuestion(null);
  };
  
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingQuestion || !selectedAgentForQuestions) return;
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      await api.updateQuestion(
        editingQuestion.id,
        selectedAgentForQuestions.id,
        editQuestionText,
        editValidationText,
        editRagRequired,
        editQuestionOrder // Include order in the update
      );
      
      // Ricarica le domande per mostrare le modifiche
      if (selectedAgentForQuestions) {
        await fetchAgentQuestions(selectedAgentForQuestions.id);
      }
      
      setShowEditModal(false);
    } catch (error: any) {
      console.error("Errore durante l'aggiornamento della domanda:", error);
      setSubmitError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Funzioni per l'eliminazione delle domande
  const handleDeleteQuestion = (question: AdminQuestion) => {
    setDeletingQuestion(question);
    setShowDeleteConfirm(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingQuestion(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!deletingQuestion) return;
    
    try {
      setIsDeleting(true);
      
      await api.deleteQuestion(deletingQuestion.id);
      
      // Ricarica le domande per mostrare le modifiche
      if (selectedAgentForQuestions) {
        await fetchAgentQuestions(selectedAgentForQuestions.id);
      }
      
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error("Errore durante l'eliminazione della domanda:", error);
      // Mostrare un messaggio di errore
    } finally {
      setIsDeleting(false);
    }
  };

  // Funzioni per l'aggiunta di domande
  const handleShowAddModal = () => {
    setNewQuestionText('');
    setNewValidationText('');
    setNewRagRequired(false);
    setNewQuestionOrder(0); // Reset order state
    setAddError(null);
    setShowAddModal(true);
  };
  
  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };
  
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAgentForQuestions) return;
    
    try {
      setIsAddingQuestion(true);
      setAddError(null);
      
      await api.addQuestion(
        selectedAgentForQuestions.id,
        newQuestionText,
        newValidationText,
        newRagRequired,
        newQuestionOrder // Include order in the add
      );
      
      // Ricarica le domande per mostrare le modifiche
      if (selectedAgentForQuestions) {
        await fetchAgentQuestions(selectedAgentForQuestions.id);
      }
      
      setShowAddModal(false);
    } catch (error: any) {
      console.error("Errore durante l'aggiunta della domanda:", error);
      setAddError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsAddingQuestion(false);
    }
  };

  // Funzioni per l'aggiunta di un nuovo agente
  const handleShowAddAgentModal = () => {
    setNewAgentName('');
    setNewAgentDescription('');
    setAddAgentError(null);
    setShowAddAgentModal(true);
  };
  
  const handleCloseAddAgentModal = () => {
    setShowAddAgentModal(false);
  };
  
  const handleSubmitAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAgentName.trim()) {
      setAddAgentError('Il nome dell\'agente è obbligatorio');
      return;
    }
    
    try {
      setIsAddingAgent(true);
      setAddAgentError(null);
      
      await api.createAgent(
        newAgentName,
        newAgentDescription
      );
      
      // Ricarica gli agenti per mostrare le modifiche
      const fetchedAgents = await api.getAgents();
      setAgents(fetchedAgents);
      setFilteredAgents(fetchedAgents);
      
      setShowAddAgentModal(false);
    } catch (error: any) {
      console.error("Errore durante la creazione dell'agente:", error);
      setAddAgentError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsAddingAgent(false);
    }
  };

  // Funzioni per la modifica degli agenti
  const handleEditAgent = (agent: AgentInfo) => {
    setEditingAgent(agent);
    setEditAgentName(agent.name);
    setEditAgentDescription(agent.description || '');
    setEditAgentError(null);
    setShowEditAgentModal(true);
  };

  const handleCloseEditAgentModal = () => {
    setShowEditAgentModal(false);
    setEditingAgent(null);
  };

  const handleSubmitEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAgent) return;

    try {
      setIsEditingAgent(true);
      setEditAgentError(null);

      await api.updateAgent(editingAgent.id, editAgentName, editAgentDescription);

      // Refresh agents list
      const fetchedAgents = await api.getAgents();
      setAgents(fetchedAgents);
      setFilteredAgents(fetchedAgents);

      setShowEditAgentModal(false);
    } catch (error: any) {
      console.error("Errore durante la modifica dell'agente:", error);
      setEditAgentError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsEditingAgent(false);
    }
  };

  // Funzioni per l'eliminazione degli agenti
  const handleDeleteAgent = (agent: AgentInfo) => {
    setDeletingAgent(agent);
    setDeleteAgentError(null);
    setShowDeleteAgentConfirm(true);
  };

  const handleCloseDeleteAgentConfirm = () => {
    setShowDeleteAgentConfirm(false);
    setDeletingAgent(null);
  };

  const handleConfirmDeleteAgent = async () => {
    if (!deletingAgent) return;

    try {
      setIsDeletingAgent(true);
      setDeleteAgentError(null);

      await api.deleteAgent(deletingAgent.id);

      // Refresh agents list
      const fetchedAgents = await api.getAgents();
      setAgents(fetchedAgents);
      setFilteredAgents(fetchedAgents);

      setShowDeleteAgentConfirm(false);
    } catch (error: any) {
      console.error("Errore durante l'eliminazione dell'agente:", error);
      setDeleteAgentError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsDeletingAgent(false);
    }
  };

  const handleShowSessionDetail = async (sessionId: string) => {
    try {
      setSelectedSessionId(sessionId);
      setSessionAnswersLoading(true);
      setSessionAnswersError(null);
      setActiveMenu('session_details');
      
      const answers = await api.getSessionAnswers(sessionId);
      setSessionAnswers(answers);
    } catch (error: any) {
      console.error("Errore durante il caricamento delle risposte della sessione:", error);
      setSessionAnswersError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setSessionAnswersLoading(false);
    }
  };
  
  const handleBackFromSessionDetails = () => {
    setActiveMenu('sessions');
    setSelectedSessionId("");
    setSessionAnswers([]);
  };

  // Funzioni per la gestione dell'eliminazione delle risposte
  const handleDeleteAnswer = (answerId: string) => {
    setDeletingAnswerId(answerId);
    setDeleteAnswerError(null);
    setShowDeleteAnswerConfirm(true);
  };
  
  const handleCloseDeleteAnswerConfirm = () => {
    setShowDeleteAnswerConfirm(false);
    setDeletingAnswerId("");
  };
  
  const handleConfirmDeleteAnswer = async () => {
    if (!deletingAnswerId) return;
    
    try {
      setIsDeletingAnswer(true);
      setDeleteAnswerError(null);
      
      await api.deleteAnswer(deletingAnswerId);
      
      // Ricarica le risposte per mostrare le modifiche
      if (selectedSessionId) {
        const updatedAnswers = await api.getSessionAnswers(selectedSessionId);
        setSessionAnswers(updatedAnswers);
      }
      
      setShowDeleteAnswerConfirm(false);
    } catch (error: any) {
      console.error("Errore durante l'eliminazione della risposta:", error);
      setDeleteAnswerError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsDeletingAnswer(false);
    }
  };

  // Funzioni per l'eliminazione delle sessioni
  const handleDeleteSession = (session: AgentSession) => {
    setDeletingSession(session);
    setDeleteSessionError(null);
    setShowDeleteSessionConfirm(true);
  };

  const handleCloseDeleteSessionConfirm = () => {
    setShowDeleteSessionConfirm(false);
    setDeletingSession(null);
  };

  const handleConfirmDeleteSession = async () => {
    if (!deletingSession || !selectedAgentForSessions) return;

    try {
      setIsDeletingSession(true);
      setDeleteSessionError(null);

      await api.deleteSession(deletingSession.id);

      // Refresh sessions list
      await fetchAgentSessions(selectedAgentForSessions.id);
      
      setShowDeleteSessionConfirm(false);
    } catch (error: any) {
      console.error("Errore durante l'eliminazione della sessione:", error);
      setDeleteSessionError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsDeletingSession(false);
    }
  };

  const handleNewChatSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setNewChatSearchTerm(e.target.value);
  };

  const handleNewChatView = async () => {
    try {
      setNewChatAgentsLoading(true);
      setNewChatAgentsError(null);
      setActiveMenu('new_chat');
      
      const fetchedAgents = await api.getAgents();
      setNewChatAgents(fetchedAgents);
      setFilteredNewChatAgents(fetchedAgents);
    } catch (error: any) {
      console.error("Errore durante il caricamento degli agenti:", error);
      setNewChatAgentsError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setNewChatAgentsLoading(false);
    }
  };

  // Renderizzazione della vista delle domande
  const renderQuestionsView = () => (
    <div className="admin-content">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-3"
              onClick={handleBackToAgents}
            >
              ← Torna agli agenti
            </Button>
            <h1 className="d-inline-block">
              Domande: {selectedAgentForQuestions?.name}
            </h1>
          </div>
          <div>
            <Button 
              variant="success" 
              size="sm"
              onClick={handleShowAddModal}
            >
              + Aggiungi domanda
            </Button>
          </div>
        </div>
        {selectedAgentForQuestions?.description && (
          <p className="text-muted">{selectedAgentForQuestions.description}</p>
        )}
      </div>
      
      {questionsLoading ? (
        <div className="loading-container">
          <Spinner animation="border" role="status" />
          <p>Caricamento domande...</p>
        </div>
      ) : questionsError ? (
        <Alert variant="danger">
          <Alert.Heading>Errore di caricamento</Alert.Heading>
          <p>{questionsError}</p>
        </Alert>
      ) : adminQuestions.length === 0 ? (
        <Alert variant="info">
          <p>Nessuna domanda disponibile per questo agente.</p>
        </Alert>
      ) : (
        <div className="data-table-container">
          <div className="questions-header d-flex justify-content-between mb-3">
            <div>
              <span className="badge bg-secondary me-2">{adminQuestions.length} domande</span>
            </div>
          </div>
          
          <Table striped hover className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Domanda</th>
                <th>Validazione</th>
                <th style={{ width: '60px' }}>RAG</th>
                <th style={{ width: '60px' }}>Ordine</th> {/* Added Order column */}
                <th style={{ width: '120px' }}>Data creazione</th>
                <th style={{ width: '120px' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {adminQuestions.map((question) => (
                <tr key={question.id}>
                  <td className="text-muted small">{String(question.id).slice(0, 8)}...</td>
                  <td>{question.question_text}</td>
                  <td>{question.validation_prompt}</td>
                  <td>{question.is_rag_required ? 'Si' : 'No'}</td>
                  <td>{question.order !== undefined ? question.order : '-'}</td> {/* Display order value or dash if not present */}
                  <td className="text-muted small">
                    {new Date(question.created_at).toLocaleDateString('it-IT')}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="btn-action"
                        onClick={() => handleEditQuestion(question)}
                        title="Modifica domanda"
                      >
                        ✏️
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="btn-action"
                        onClick={() => handleDeleteQuestion(question)}
                        title="Elimina domanda"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderSessionsView = () => (
    <div className="admin-content">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-3"
              onClick={handleBackFromSessions}
            >
              ← Torna agli agenti
            </Button>
            <h1 className="d-inline-block">
              Sessioni: {selectedAgentForSessions?.name}
            </h1>
          </div>
        </div>
        {selectedAgentForSessions?.description && (
          <p className="text-muted">{selectedAgentForSessions.description}</p>
        )}
      </div>
      
      {sessionsLoading ? (
        <div className="loading-container">
          <Spinner animation="border" role="status" />
          <p>Caricamento sessioni...</p>
        </div>
      ) : sessionsError ? (
        <div className="alert alert-danger">
          <p>Errore: {sessionsError}</p>
        </div>
      ) : agentSessions.length === 0 ? (
        <div className="loading-container">
          <p>Nessuna sessione trovata</p>
        </div>
      ) : (
        <div className="data-table-container">
          <div className="questions-header d-flex justify-content-between mb-3">
            <div>
              <span className="badge bg-secondary me-2">
                {agentSessions.filter(session => session && session.id !== undefined).length} sessioni
              </span>
            </div>
          </div>
          
          <Table striped hover className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Nome</th>
                <th>Descrizione</th>
                <th style={{ width: '120px' }}>Utente</th>
                <th style={{ width: '120px' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {agentSessions
                .filter(session => session && session.id !== undefined)
                .map((session) => (
                  <tr key={session.id}>
                    <td className="text-muted small">{String(session.id).slice(0, 8)}...</td>
                    <td>{session.name}</td>
                    <td>{session.description}</td>
                    <td>{session.user}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="btn-action"
                          onClick={() => handleShowSessionDetail(session.id)}
                          title="Dettaglio sessione"
                        >
                          🔍
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="btn-action"
                          onClick={() => handleDeleteSession(session)}
                          title="Elimina sessione"
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderSessionDetailsView = () => (
    <div className="admin-content">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-3"
              onClick={handleBackFromSessionDetails}
            >
              ← Torna alle sessioni
            </Button>
            <h1 className="d-inline-block">
              Dettaglio Sessione: {selectedSessionId}
            </h1>
          </div>
        </div>
      </div>
      
      {sessionAnswersLoading ? (
        <div className="loading-container">
          <Spinner animation="border" role="status" />
          <p>Caricamento dettagli sessione...</p>
        </div>
      ) : sessionAnswersError ? (
        <Alert variant="danger">
          <p>Errore: {sessionAnswersError}</p>
        </Alert>
      ) : sessionAnswers.length === 0 ? (
        <Alert variant="info">
          <p>Nessuna risposta trovata per questa sessione.</p>
        </Alert>
      ) : (
        <div className="data-table-container">
          <div className="questions-header d-flex justify-content-between mb-3">
            <div>
              <span className="badge bg-secondary me-2">{sessionAnswers.length} risposte</span>
            </div>
          </div>
          
          <Table striped hover className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Domanda</th>
                <th>Risposta</th>
                <th style={{ width: '80px' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {sessionAnswers.map((item, index) => (
                <tr key={item.id || `session-answer-${index}`}>
                  <td className="text-muted small">{item.id.toString().slice(0, 8)}...</td>
                  <td>{item.question}</td>
                  <td>{item.answer}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="btn-action"
                        onClick={() => handleDeleteAnswer(item.id.toString())}
                        title="Elimina risposta"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderNewChatView = () => (
    <div className="admin-content">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Nuova Chat</h1>
        </div>
        <div>Seleziona un agente per iniziare una nuova conversazione</div>
      </div>
      <div className="content-actions">
        <div className="search-container">
          <Form.Control
            type="text"
            placeholder="Cerca agenti..."
            className="search-input"
            value={newChatSearchTerm}
            onChange={handleNewChatSearch}
          />
        </div>
      </div>
      
      {newChatAgentsLoading ? (
        <div className="loading-container">
          <Spinner animation="border" role="status" />
          <p>Caricamento agenti...</p>
        </div>
      ) : newChatAgentsError ? (
        <Alert variant="danger">
          <Alert.Heading>Errore di caricamento</Alert.Heading>
          <p>{newChatAgentsError}</p>
        </Alert>
      ) : filteredNewChatAgents.length === 0 ? (
        <div className="loading-container">
          <p>Nessun agente trovato</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4 mt-2">
          {filteredNewChatAgents.map((agent) => (
            <Col key={agent.id}>
              <Card className="h-100 agent-card">
                <Card.Body>
                  <Card.Title>{agent.name}</Card.Title>
                  <Card.Text>
                    {agent.description || "Nessuna descrizione disponibile"}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white border-0">
                  <Button 
                    variant="primary" 
                    className="w-100"
                    onClick={() => startNewChat(agent)}
                  >
                    Inizia Chat
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  const renderDashboardView = () => (
    <div className="admin-content">
      <div className="content-header">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-placeholder">
          <div className="placeholder-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z"/>
              <path fillRule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3z"/>
            </svg>
            <p>Dashboard in costruzione</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgentsView = () => (
    <div className="admin-content">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>Gestione Agenti</h1>
          <Button 
            variant="success" 
            size="sm"
            onClick={handleShowAddAgentModal}
          >
            + Nuovo agente
          </Button>
        </div>
        <div className="agent-count">{filteredAgents.length} agenti disponibili</div>
      </div>
      <div className="content-actions">
        <div className="search-container">
          <Form.Control
            type="text"
            placeholder="Cerca agenti..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <Spinner animation="border" role="status" />
          <p>Caricamento agenti...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="loading-container">
          <p>Nessun agente trovato</p>
        </div>
      ) : (
        <div className="data-table-container">
          <div className="questions-header d-flex justify-content-between mb-3">
            <div>
              <span className="badge bg-secondary me-2">{filteredAgents.length} agenti</span>
            </div>
          </div>
          
          <Table striped hover className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Nome</th>
                <th>Descrizione</th>
                <th style={{ width: '220px' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr key={agent.id}>
                  <td className="text-muted small">{String(agent.id).slice(0, 8)}...</td>
                  <td>{agent.name}</td>
                  <td>{agent.description || <span className="no-description">Nessuna descrizione</span>}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="btn-action"
                        onClick={() => handleShowQuestions(agent)}
                        title="Visualizza domande"
                      >
                        📝
                      </Button>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        className="btn-action"
                        onClick={() => handleShowSessions(agent)}
                        title="Visualizza sessioni"
                      >
                        🔍
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="btn-action"
                        onClick={() => handleEditAgent(agent)}
                        title="Modifica agente"
                      >
                        ✏️
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="btn-action"
                        onClick={() => handleDeleteAgent(agent)}
                        title="Elimina agente"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderMainContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderDashboardView();
      case 'questions':
        return renderQuestionsView();
      case 'sessions':
        return renderSessionsView();
      case 'session_details':
        return renderSessionDetailsView();
      case 'new_chat':
        return renderNewChatView();
      case 'chat':
        return renderChatView();
      case 'agents':
      default:
        return renderAgentsView();
    }
  };

  const renderAgentManagementView = () => (
    <div className="admin-dashboard">
      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
      />
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <div className="app-logo">CO</div>
          </div>
          <ul className="admin-menu">
            <li className={activeMenu === "dashboard" ? "active" : ""}>
              <a href="#dashboard" onClick={(e) => handleMenuClick(e, "dashboard")}>
                <span className="menu-icon dashboard-icon"></span>
                <span className="menu-text">Dashboard</span>
              </a>
            </li>
            <li className={activeMenu === "agents" || activeMenu === "questions" || activeMenu === "sessions" ? "active" : ""}>
              <a href="#agents" onClick={(e) => handleMenuClick(e, "agents")}>
                <span className="menu-icon agents-icon"></span>
                <span className="menu-text">Gestione Agenti</span>
              </a>
            </li>
            <li className={activeMenu === "new_chat" ? "active" : ""}>
              <a href="#new_chat" onClick={(e) => handleMenuClick(e, "new_chat")}>
                <span className="menu-icon chat-icon"></span>
                <span className="menu-text">Nuova Chat</span>
              </a>
            </li>
            {currentUser?.role === 'admin' && (
              <li className={activeMenu === "users" ? "active" : ""}>
                <a href="/users">
                  <span className="menu-icon user-icon"></span>
                  <span className="menu-text">Gestione Utenti</span>
                </a>
              </li>
            )}
          </ul>
          <div className="sidebar-footer">
            ChangeOps v1.0.0
          </div>
        </div>
        
        {renderMainContent()}
      </div>
    </div>
  );

  // Modale per la modifica delle domande
  const renderEditQuestionModal = () => (
    <Modal 
      show={showEditModal} 
      onHide={handleCloseEditModal}
      backdrop="static"
      centered
      className="edit-question-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Modifica Domanda</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {submitError && (
          <Alert variant="danger" className="mb-3">
            {submitError}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmitEdit}>
          <Form.Group className="mb-3">
            <Form.Label>Testo della domanda</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={editQuestionText}
              onChange={(e) => setEditQuestionText(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Validazione</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={editValidationText}
              onChange={(e) => setEditValidationText(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Richiede RAG"
              checked={editRagRequired}
              onChange={(e) => setEditRagRequired(e.target.checked)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ordine</Form.Label>
            <Form.Control
              type="number"
              value={editQuestionOrder}
              onChange={(e) => setEditQuestionOrder(Number(e.target.value))}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseEditModal} disabled={isSubmitting}>
          Annulla
        </Button>
        <Button variant="primary" onClick={handleSubmitEdit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Salvataggio...
            </>
          ) : (
            'Salva modifiche'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
  
  // Modale per la conferma di eliminazione
  const renderDeleteConfirmModal = () => (
    <Modal
      show={showDeleteConfirm}
      onHide={handleCloseDeleteConfirm}
      backdrop="static"
      centered
      className="delete-confirm-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Conferma eliminazione</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sei sicuro di voler eliminare questa domanda?</p>
        {deletingQuestion && (
          <Alert variant="warning">
            <strong>Domanda:</strong> {deletingQuestion.question_text}
          </Alert>
        )}
        <p className="text-danger mt-3">
          <strong>Attenzione:</strong> questa operazione non può essere annullata.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseDeleteConfirm} disabled={isDeleting}>
          Annulla
        </Button>
        <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
          {isDeleting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Eliminazione...
            </>
          ) : (
            'Elimina'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modale per l'aggiunta di domande
  const renderAddQuestionModal = () => (
    <Modal 
      show={showAddModal} 
      onHide={handleCloseAddModal}
      backdrop="static"
      centered
      className="add-question-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Nuova Domanda</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {addError && (
          <Alert variant="danger" className="mb-3">
            {addError}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmitAdd}>
          <Form.Group className="mb-3">
            <Form.Label>Testo della domanda</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Inserisci il testo della domanda..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Validazione</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Esempio: Il valore deve essere uno tra: blu, giallo."
              value={newValidationText}
              onChange={(e) => setNewValidationText(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Richiede RAG"
              checked={newRagRequired}
              onChange={(e) => setNewRagRequired(e.target.checked)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ordine</Form.Label>
            <Form.Control
              type="number"
              value={newQuestionOrder}
              onChange={(e) => setNewQuestionOrder(Number(e.target.value))}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseAddModal} disabled={isAddingQuestion}>
          Annulla
        </Button>
        <Button variant="success" onClick={handleSubmitAdd} disabled={isAddingQuestion}>
          {isAddingQuestion ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Creazione in corso...
            </>
          ) : (
            'Crea domanda'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modale per l'aggiunta di un nuovo agente
  const renderAddAgentModal = () => (
    <Modal 
      show={showAddAgentModal} 
      onHide={handleCloseAddAgentModal}
      backdrop="static"
      centered
      className="add-agent-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Nuovo Agente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {addAgentError && (
          <Alert variant="danger" className="mb-3">
            {addAgentError}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmitAddAgent}>
          <Form.Group className="mb-3">
            <Form.Label>Nome agente</Form.Label>
            <Form.Control
              type="text"
              placeholder="Inserisci il nome dell'agente..."
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Descrizione (opzionale)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Inserisci una descrizione per l'agente..."
              value={newAgentDescription}
              onChange={(e) => setNewAgentDescription(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseAddAgentModal} disabled={isAddingAgent}>
          Annulla
        </Button>
        <Button variant="success" onClick={handleSubmitAddAgent} disabled={isAddingAgent}>
          {isAddingAgent ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Creazione in corso...
            </>
          ) : (
            'Crea agente'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modale per la modifica degli agenti
  const renderEditAgentModal = () => (
    <Modal 
      show={showEditAgentModal} 
      onHide={handleCloseEditAgentModal}
      backdrop="static"
      centered
      className="edit-agent-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Modifica Agente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editAgentError && (
          <Alert variant="danger" className="mb-3">
            {editAgentError}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmitEditAgent}>
          <Form.Group className="mb-3">
            <Form.Label>Nome agente</Form.Label>
            <Form.Control
              type="text"
              placeholder="Inserisci il nome dell'agente..."
              value={editAgentName}
              onChange={(e) => setEditAgentName(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Descrizione (opzionale)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Inserisci una descrizione per l'agente..."
              value={editAgentDescription}
              onChange={(e) => setEditAgentDescription(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseEditAgentModal} disabled={isEditingAgent}>
          Annulla
        </Button>
        <Button variant="primary" onClick={handleSubmitEditAgent} disabled={isEditingAgent}>
          {isEditingAgent ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Salvataggio...
            </>
          ) : (
            'Salva modifiche'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modale per la conferma di eliminazione degli agenti
  const renderDeleteAgentConfirmModal = () => (
    <Modal
      show={showDeleteAgentConfirm}
      onHide={handleCloseDeleteAgentConfirm}
      backdrop="static"
      centered
      className="delete-confirm-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Conferma eliminazione agente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {deleteAgentError && (
          <Alert variant="danger" className="mb-3">
            {deleteAgentError}
          </Alert>
        )}
        <p>Sei sicuro di voler eliminare l'agente <strong>{deletingAgent?.name}</strong>?</p>
        <p className="text-danger mt-3">
          <strong>Attenzione:</strong> questa operazione non può essere annullata.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseDeleteAgentConfirm} disabled={isDeletingAgent}>
          Annulla
        </Button>
        <Button variant="danger" onClick={handleConfirmDeleteAgent} disabled={isDeletingAgent}>
          {isDeletingAgent ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Eliminazione...
            </>
          ) : (
            'Elimina'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modale per la conferma di eliminazione delle risposte
  const renderDeleteAnswerConfirmModal = () => (
    <Modal
      show={showDeleteAnswerConfirm}
      onHide={handleCloseDeleteAnswerConfirm}
      backdrop="static"
      centered
      className="delete-confirm-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Conferma eliminazione risposta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {deleteAnswerError && (
          <Alert variant="danger" className="mb-3">
            {deleteAnswerError}
          </Alert>
        )}
        <p>Sei sicuro di voler eliminare questa risposta?</p>
        <p className="text-danger mt-3">
          <strong>Attenzione:</strong> questa operazione non può essere annullata.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseDeleteAnswerConfirm} disabled={isDeletingAnswer}>
          Annulla
        </Button>
        <Button variant="danger" onClick={handleConfirmDeleteAnswer} disabled={isDeletingAnswer}>
          {isDeletingAnswer ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Eliminazione...
            </>
          ) : (
            'Elimina'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Modale per la conferma di eliminazione delle sessioni
  const renderDeleteSessionConfirmModal = () => (
    <Modal
      show={showDeleteSessionConfirm}
      onHide={handleCloseDeleteSessionConfirm}
      backdrop="static"
      centered
      className="delete-confirm-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Conferma eliminazione sessione</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {deleteSessionError && (
          <Alert variant="danger" className="mb-3">
            {deleteSessionError}
          </Alert>
        )}
        <p>Sei sicuro di voler eliminare la sessione <strong>{deletingSession?.name}</strong>?</p>
        <p className="text-danger mt-3">
          <strong>Attenzione:</strong> questa operazione non può essere annullata.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseDeleteSessionConfirm} disabled={isDeletingSession}>
          Annulla
        </Button>
        <Button variant="danger" onClick={handleConfirmDeleteSession} disabled={isDeletingSession}>
          {isDeletingSession ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Eliminazione...
            </>
          ) : (
            'Elimina'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Create a new component for the chat view
  const renderChatView = () => (
    <div className="admin-content">
      <div className="content-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-3"
              onClick={handleBackFromChat}
              disabled={isLoading}
            >
              ← Torna alla selezione agenti
            </Button>
            <h1 className="d-inline-block">
              Chat con {selectedAgentForChat?.name || "Agente"}
            </h1>
          </div>
        </div>
        {selectedAgentForChat?.description && (
          <p className="text-muted">{selectedAgentForChat.description}</p>
        )}
      </div>
      
      <div className="chat-page-container">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message-bubble ${message.isUser ? 'answer-bubble' : 'question-bubble'}`}
            >
              <div className="message-content">
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="loading-message-container">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>{loadingMessage || 'Elaborazione in corso...'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {currentQuestion && (
          <Form onSubmit={handleSubmit} className="answer-form">
            <Form.Group>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Scrivi la tua risposta..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isLoading || !userAnswer.trim()}
                >
                  {isLoading ? <Spinner animation="border" size="sm" /> : "Invia"}
                </Button>
              </InputGroup>
            </Form.Group>
            
            {isLoading && (
              <div className="text-muted mt-2 small">
                <Spinner animation="border" size="sm" className="me-1" />
                {loadingMessage || 'Elaborazione in corso...'}
              </div>
            )}
          </Form>
        )}
      </div>
    </div>
  );

  // Aggiungiamo la gestione delle route con protezione
  return (
    <Router>
      <>
        {showLoader && (
          <div className="loader-overlay">
            <div className="loader-content">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>{loadingMessage}</span>
            </div>
          </div>
        )}
        
        <Routes>
          {/* Rotta pubblica per il login */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } />
          
          {/* Route protette che richiedono autenticazione */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={renderAgentManagementView()} />
            
            {/* Altre route protette che possono essere accessibili da tutti gli utenti autenticati */}
          </Route>
          
          {/* Route protette che richiedono ruolo admin */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/users" element={<UserManagement />} />
          </Route>
          
          {/* Reindirizza qualsiasi altra route alla homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Modali */}
        {renderEditQuestionModal()}
        {renderDeleteConfirmModal()}
        {renderAddQuestionModal()}
        {renderAddAgentModal()}
        {renderEditAgentModal()}
        {renderDeleteAgentConfirmModal()}
        {renderDeleteAnswerConfirmModal()}
        {renderDeleteSessionConfirmModal()}
      </>
    </Router>
  );
}

export default App;
