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
        },
        color: 'inherit',
        transition: 'color 0.3s ease-in-out',
      }}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <LightModeIcon sx={{ fontSize: 20 }} />
      ) : (
        <DarkModeIcon sx={{ fontSize: 20 }} />
      )}
    </IconButton>
  )
}
