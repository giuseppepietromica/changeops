/**
 * Entry point for the ChangeOPS application.
 * Sets up React with StrictMode and renders the main App component.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize React and render the application to the DOM
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
