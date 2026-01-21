import React, { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline, GlobalStyles } from '@mui/material'
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

  const theme = useMemo(() => {
    return isDarkMode ? darkTheme : lightTheme
  }, [isDarkMode])

  // Update color-scheme for instant browser chrome change
  useEffect(() => {
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light'
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            '*': {
              transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out !important',
            },
            // Exclude elements that should not have transitions
            'input, textarea, button, [role="button"]': {
              transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out !important',
            },
          }}
        />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
