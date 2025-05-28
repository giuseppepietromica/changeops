# Services Documentation

This document provides detailed information about the service layer of the ChangeOPS application. Services handle business logic, API communication, and state management for the application.

## Core Services

### API Service (`apiService.ts`)

The API Service provides a centralized interface for making HTTP requests to the backend services.

#### Configuration

The service connects to two main endpoints:
- **Webhook API**: Used for agent-related operations (via n8n)
- **Auth API**: Used for authentication and user management (via PostgreSQL)

#### Key Features

- **Interceptors**: Automatically attaches authentication tokens to requests
- **Error Handling**: Manages expired tokens and authentication errors
- **Request Methods**: Provides wrapper methods for GET and POST requests to both APIs

#### Usage Example

```typescript
// Using webhook endpoints (agent operations)
const agents = await apiService.webhookGet<AgentInfo[]>('/agents');

// Using auth endpoints (user operations)
const userData = await apiService.authPost<User>('/users', newUserData);
```

### Agent API (`api.ts`)

This service handles all agent-related operations, providing methods to interact with AI agents, manage questions, and handle sessions.

#### Key Functionalities

- **Agent Execution**: Start agent sessions and retrieve questions
- **Answer Handling**: Submit and validate user answers
- **Agent Management**: Create, update, and delete agents
- **Question Management**: Add, update, and delete questions for agents
- **Session Management**: Retrieve sessions and their answers

#### Data Structures

- `AgentInfo`: Basic information about an agent
- `AgentQuestion`: Question presented to users during chat
- `AdminQuestion`: Extended question information for admin management
- `ValidationResponse`: Response from answer validation
- `AgentSession`: Information about a chat session
- `SessionAnswer`: Individual answers within a session

#### Usage Example

```typescript
// Start a new agent session
const session = await api.executeAgent('agent-123', 'session-456', 'user@example.com');

// Submit an answer for validation
const validation = await api.submitAnswer(session.output.session, 'My answer text');
```

### Authentication Service (`authService.ts`)

This service manages user authentication, session persistence, and user management operations.

#### Authentication Methods

- **Local Authentication**: Username/password login via database
- **Azure AD Authentication**: Single sign-on via Microsoft Azure Active Directory

#### User Management

- **User Operations**: Create, read, update, and delete users
- **Role Management**: Manage user roles and permissions

#### Session Management

- **Token Storage**: Securely stores authentication tokens in localStorage
- **User Context**: Maintains current user information across the application
- **Session Initialization**: Automatically restores session on application start

#### Data Structures

- `User`: User profile information
- `LoginCredentials`: Username and password for local authentication
- `AuthResponse`: Server response containing user data and token
- `Role`: User role information for permission control

#### Usage Example

```typescript
// Login with local credentials
const authResponse = await authService.login({
  username: 'user@example.com',
  password: 'password123'
});

// Check if user is authenticated
const isLoggedIn = authService.isAuthenticated();

// Get current user data
const currentUser = authService.getCurrentUser();
```

## Service Integration

The services are designed to work together:

1. **Authentication Flow**:
   - `authService` handles user login
   - Authentication tokens are stored locally
   - `apiService` attaches tokens to subsequent requests

2. **Agent Interaction Flow**:
   - UI components call `api` methods
   - `api` uses `apiService` to make HTTP requests
   - `apiService` ensures authentication via `authService`

3. **Error Handling**:
   - `apiService` intercepts authentication errors
   - On token expiration, `authService.logout()` is called
   - User is redirected to login page

## Best Practices

1. **Always use the service layer** for API communication rather than making direct HTTP requests
2. **Handle loading and error states** when calling service methods
3. **Use TypeScript interfaces** provided by the services for type safety
4. **Check authentication state** before rendering protected components
