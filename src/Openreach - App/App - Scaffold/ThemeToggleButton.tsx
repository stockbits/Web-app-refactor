import { IconButton, keyframes, useTheme } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useThemeMode } from '../../ThemeContext'
import { useState } from 'react'

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const ThemeToggleButton = () => {
  const { isDarkMode, toggleTheme } = useThemeMode()
  const theme = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    toggleTheme()
    setTimeout(() => setIsAnimating(false), 600)
  }

  return (
    <IconButton
      onClick={handleClick}
      sx={{
        animation: isAnimating ? `${spin} 0.6s ease-in-out` : 'none',
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.15)' 
            : 'rgba(20,32,50,0.1)',
        },
        color: '#FFFFFF',
        transition: 'background-color 0.3s ease-in-out',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(255,255,255,0.2)'
          : `1px solid ${theme.palette.divider}`,
        padding: '10px',
      }}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <LightModeIcon sx={{ fontSize: 22 }} />
      ) : (
        <DarkModeIcon sx={{ fontSize: 22 }} />
      )}
    </IconButton>
  )
}
