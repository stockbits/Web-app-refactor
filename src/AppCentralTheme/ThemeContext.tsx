import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from './index'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeToggleProvider')
  }
  return context
}

export const ThemeToggleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Theme selection is now O(1) - no recreation, just reference selection
  const theme = isDarkMode ? darkTheme : lightTheme

  // Update color-scheme for instant browser chrome change
  useEffect(() => {
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light'
  }, [isDarkMode])

  // Stabilize toggleTheme callback
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    isDarkMode, 
    toggleTheme 
  }), [isDarkMode, toggleTheme])

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
