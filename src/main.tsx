import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, Box, CircularProgress } from '@mui/material'
import App from './App.tsx'
import { ThemeToggleProvider } from './AppCentralTheme/ThemeContext'

// Lazy load window components
const TaskDetailWindow = lazy(() => import('./Openreach - App/App - Scaffold/App - Pages/Task Detail Window.tsx'))
const TaskCompareWindow = lazy(() => import('./Openreach - App/App - Scaffold/App - Pages/Task Compare Window.tsx'))

// Check URL to determine which component to render
const urlParams = new URLSearchParams(window.location.search)
const windowType = urlParams.get('window')

let RootComponent: typeof App | typeof TaskDetailWindow | typeof TaskCompareWindow = App

if (windowType === 'task-detail') {
  RootComponent = TaskDetailWindow
} else if (windowType === 'task-compare') {
  RootComponent = TaskCompareWindow
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeToggleProvider>
      <CssBaseline />
      <Suspense
        fallback={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              bgcolor: 'background.default',
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <RootComponent />
      </Suspense>
    </ThemeToggleProvider>
  </StrictMode>,
)
