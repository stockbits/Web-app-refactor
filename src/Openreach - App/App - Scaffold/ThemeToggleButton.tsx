import { IconButton, keyframes } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useThemeMode } from '../../ThemeContext'

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

  return (
    <IconButton
      onClick={toggleTheme}
      sx={{
        animation: `${spin} 0.6s ease-in-out`,
        '&:hover': {
          animation: `${spin} 0.6s ease-in-out`,
          bgcolor: 'rgba(255,255,255,0.1)',
        },
        color: 'rgba(255,255,255,0.9)',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid rgba(255,255,255,0.2)',
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
