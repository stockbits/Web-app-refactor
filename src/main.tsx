import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import App from './App.tsx'
import { ThemeToggleProvider } from './App - Central Theme/ThemeContext'
import { MinimizedTaskProvider } from './App - Central Theme/MinimizedTaskContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeToggleProvider>
      <MinimizedTaskProvider>
        <CssBaseline />
        <App />
      </MinimizedTaskProvider>
    </ThemeToggleProvider>
  </StrictMode>,
)
