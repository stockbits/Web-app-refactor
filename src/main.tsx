import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import App from './App.tsx'
import { ThemeToggleProvider } from './ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeToggleProvider>
      <CssBaseline />
      <App />
    </ThemeToggleProvider>
  </StrictMode>,
)
