# ChangeOPS Solution Documentation

## 1. Overview

ChangeOPS is a comprehensive agent management system built with React and TypeScript. The application enables users to create, manage, and interact with AI agents through a conversational interface. It's designed to handle complex workflows including agent creation, question management, user sessions, and answer validation.

## 2. Architecture

### 2.1 Technical Stack

- **Frontend**: React 18, TypeScript, Bootstrap 5
- **Authentication**: Dual authentication system (Local + Azure AD)
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router v6
- **HTTP Communication**: Axios
- **Database**: PostgreSQL
- **Build Tool**: Vite

### 2.2 Component Architecture

The application follows a modular architecture with clear separation of concerns:

- **Service Layer**: Handles API communication, authentication, and business logic
- **Component Layer**: UI components with specific responsibilities
- **Routing Layer**: Manages navigation and protected routes
- **Configuration Layer**: Environment-specific settings

### 2.3 Project Structure

```
src/
├── components/        # UI components
│   ├── auth/          # Authentication components
│   ├── layout/        # Layout components
│   └── users/         # User management components
├── services/          # Service layer
│   ├── api.ts         # Agent API service
│   ├── apiService.ts  # Core API communication service
│   ├── authService.ts # Authentication service
│   ├── azureAuthService.ts # Azure AD integration
│   └── dbService.ts   # Database service
├── config/            # Configuration
│   ├── database.config.ts # Database and API config
│   └── env.ts         # Environment variables
├── docs/              # Documentation
├── App.tsx            # Main application component
└── main.tsx          # Application entry point
```

## 3. Core Components

### 3.1 Authentication System

ChangeOPS implements a dual authentication system:

1. **Local Authentication**:
   - Username/password authentication against PostgreSQL database
   - Token-based session management
   - Role-based access control

2. **Azure AD Integration**:
   - Single Sign-On with Microsoft Azure Active Directory
   - OAuth 2.0 flow with MSAL library
   - User profile synchronization with local database

#### Authentication Flow

1. User enters credentials (local) or clicks Azure login
2. Authentication service verifies credentials
3. On successful authentication, a JWT token is generated
4. Token is stored in localStorage and attached to subsequent API requests
5. Protected routes check authentication status before rendering

### 3.2 Agent Management System

The core functionality of ChangeOPS revolves around AI agent management:

1. **Agent Creation**: Administrators can create agents with specific names and descriptions
2. **Question Management**: Each agent has a set of ordered questions with validation rules
3. **Session Management**: The system tracks user sessions with agents
4. **Answer Validation**: Answers submitted by users are validated against custom rules

#### Agent Interaction Flow

1. User selects an agent to interact with
2. System creates a new session and retrieves agent questions
3. Questions are presented in order to the user
4. User answers are submitted for validation
5. Valid answers are stored and the next question is presented
6. Session details are saved for later review

### 3.3 User Management

The application includes a comprehensive user management system:

1. **User CRUD**: Create, read, update, and delete user accounts
2. **Role Management**: Assign roles (admin, user) to control access
3. **Azure Integration**: Link local accounts with Azure AD accounts
4. **Profile Management**: Update user profile information

## 4. Database Schema

The PostgreSQL database includes the following main tables:

### 4.1 User Authentication Tables

- **users**: Stores user information
  - id, email, username, password_hash, first_name, last_name, role_id, is_active, etc.

- **roles**: Defines user roles
  - id, name, description, created_at

- **access_tokens**: Manages authentication tokens
  - id, user_id, token, expires_at, created_at

- **user_sessions**: Tracks user sessions
  - id, user_id, session_token, expires_at, created_at

### 4.2 Agent-Related Tables (Inferred)

Based on the API interfaces, the system likely includes tables for:

- **agents**: Stores agent information
  - id, name, description, created_at, etc.

- **agent_questions**: Stores questions for each agent
  - id, agent_id, question_text, validation_prompt, is_rag_required, order, etc.

- **agent_sessions**: Tracks user sessions with agents
  - id, agent_id, user_id, created_at, etc.

- **session_answers**: Stores user answers for each session
  - id, session_id, question_id, answer_text, is_valid, created_at, etc.

## 5. Service Layer

The service layer is the backbone of the application, handling all business logic and API communication:

### 5.1 API Service (`apiService.ts`)

Central service for HTTP communication with two main endpoints:
- **Webhook API**: For agent operations (via n8n)
- **Auth API**: For user and authentication operations

Features:
- Request interceptors for token management
- Error handling and token expiration management
- Configurable base URLs for different environments

### 5.2 Authentication Service (`authService.ts`)

Manages authentication state and user operations:
- Login and logout functionality
- Token management
- User CRUD operations
- Role management
- Session persistence

### 5.3 Azure AD Service (`azureAuthService.ts`)

Handles Microsoft Azure Active Directory integration:
- OAuth 2.0 authentication flow
- Token acquisition and validation
- User profile retrieval and synchronization
- Silent token renewal

### 5.4 Agent API (`api.ts`)

Provides agent-specific operations:
- Agent execution and session management
- Question retrieval and answer submission
- Answer validation
- Session history and reporting

## 6. UI Components

### 6.1 Authentication Components

- **LoginPage**: Handles user login with both local and Azure options
- **ProtectedRoute**: Implements route protection based on authentication and roles

### 6.2 Layout Components

- **Header**: Application header with user menu and navigation
- Other layout components for consistent UI presentation

### 6.3 User Management Components

- **UserManagement**: Comprehensive user administration interface

### 6.4 Agent Components (Inferred)

Based on App.tsx:
- Agent creation and management interface
- Question management interface
- Chat interface for agent interaction
- Session review interface

## 7. Security Considerations

The application implements several security best practices:

1. **Authentication**: Token-based authentication with expiration
2. **Authorization**: Role-based access control for protected resources
3. **Password Security**: Passwords are hashed (likely using bcrypt)
4. **API Security**: Authentication tokens required for API access
5. **Session Management**: Proper session handling and expiration

## 8. Development and Deployment

### 8.1 Development Environment

The application uses modern development tools:
- **Vite**: Fast build tool and development server
- **TypeScript**: Static typing for improved code quality
- **ESLint**: Code linting for consistency

### 8.2 Deployment Considerations

The application is likely deployed as a static web application with:
- Backend API services (not visible in the codebase)
- Database server for PostgreSQL
- Authentication services for Azure AD integration

## 9. Conclusion

ChangeOPS is a well-structured React application with a robust architecture. It demonstrates several best practices:
- Clear separation of concerns
- Modular component design
- Comprehensive service layer
- Strong typing with TypeScript
- Secure authentication handling
- Responsive UI with Bootstrap

The codebase is organized logically, making it maintainable and extensible for future development.
