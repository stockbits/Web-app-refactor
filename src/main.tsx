import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import App from './App.tsx'
import { ThemeToggleProvider } from './AppCentralTheme/ThemeContext'
import { MinimizedTaskProvider } from './AppCentralTheme/MinimizedTaskContext'

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
