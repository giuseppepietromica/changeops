# ChangeOPS

ChangeOPS is a comprehensive agent management system built with React and TypeScript. It enables users to create, manage, and interact with AI agents through a conversational interface.

## Features

- **Agent Management**: Create, edit, and delete AI agents with custom names and descriptions
- **Question Management**: Create and manage questions for each agent, including validation rules
- **Session Management**: View and manage agent chat sessions and their answers
- **Interactive Chat Interface**: Chat with agents through a user-friendly interface
- **User Authentication**: Secure login and role-based access control
- **Responsive Design**: Works on desktop and mobile devices

## Technical Stack

- **Frontend**: React 18, TypeScript, Bootstrap 5
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios
- **Authentication**: Custom authentication service with token-based auth
- **UI Components**: React Bootstrap
- **Build Tool**: Vite

## Project Structure

The application follows a modular structure:

```
src/
├── components/        # Reusable React components
│   ├── auth/          # Authentication-related components
│   ├── layout/        # Layout components like Header
│   └── users/         # User management components
├── services/          # API and authentication services
├── config/            # Configuration files
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Key Components

### Agent Management

The system allows administrators to create and manage AI agents. Each agent can have:
- A unique name and description
- A set of ordered questions with validation rules
- Multiple chat sessions with users

### Question Management

For each agent, administrators can:
- Create new questions with specific validation rules
- Set whether RAG (Retrieval-Augmented Generation) is required
- Specify the order of questions
- Edit or delete existing questions

### Session Management

The system tracks all chat sessions between users and agents:
- View all sessions for a specific agent
- Examine detailed question-answer pairs within each session
- Delete sessions or individual answers if needed

### Chat Interface

Users can interact with agents through a conversational interface:
- Select an agent to start a new chat
- Answer agent questions in sequence
- Receive validation feedback for invalid answers
- Complete the entire conversation flow

## Authentication

The application implements a token-based authentication system:
- Login page for user authentication
- Protected routes that require authentication
- Role-based access control (admin vs regular users)
- Token storage and management

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example` template
4. Start the development server:
   ```
   npm run dev
   ```

### Building for Production

To build the application for production:

```
npm run build
```

The built files will be available in the `dist` directory.

## API Integration

The application connects to a backend API for:
- Agent data retrieval and management
- Question storage and validation
- Session tracking and management
- Authentication and user management

## License

This project is proprietary and confidential. All rights reserved.
