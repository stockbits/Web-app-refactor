import { IconButton, keyframes, useTheme } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useThemeMode } from '../../App - Central Theme/ThemeContext'
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
  const isLightMode = theme.palette.mode === 'light'
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
          bgcolor: 'transparent',
        },
        color: isLightMode ? theme.palette.text.primary : '#FFFFFF',
        transition: 'background-color 0.3s ease-in-out',
        padding: '10px',
      }}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <LightModeIcon sx={{ fontSize: 32 }} />
      ) : (
        <DarkModeIcon sx={{ fontSize: 32 }} />
      )}
    </IconButton>
  )
}
