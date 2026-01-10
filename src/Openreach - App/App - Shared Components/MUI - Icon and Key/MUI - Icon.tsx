import { useTheme } from '@mui/material'
import PlaceIcon from '@mui/icons-material/Place'

export type TaskIconVariant = 'appointment' | 'startBy' | 'completeBy' | 'failedSLA'

interface TaskIconProps {
  variant: TaskIconVariant
  size?: number
}

export function TaskIcon({ variant, size = 32 }: TaskIconProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Color mapping based on theme tokens
  const getColors = () => {
    if (isDark) {
      return {
        appointment: theme.openreach.darkTokens.state.info,      // Blazing Blue
        startBy: theme.openreach.darkTokens.state.warning,       // Warning orange
        completeBy: theme.openreach.darkTokens.state.success,    // Go Green
        failedSLA: theme.openreach.darkTokens.state.error,       // Error red
      }
    }
    return {
      appointment: theme.openreach.lightTokens.state.info,     // Blazing Blue
      startBy: theme.openreach.lightTokens.state.warning,      // Warning orange
      completeBy: theme.openreach.lightTokens.state.success,   // Go Green
      failedSLA: theme.openreach.lightTokens.state.error,      // Error red
    }
  }

  const colors = getColors()
  const fillColor = colors[variant]

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      {/* Base PlaceIcon */}
      <PlaceIcon
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          color: fillColor,
          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.25))',
        }}
      />
      {/* Inner circle overlay */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        {/* White background circle */}
        <circle
          cx="12"
          cy="10"
          r="4.5"
          fill={theme.palette.background.paper}
        />
        {/* Colored inner circle */}
        <circle
          cx="12"
          cy="10"
          r="3.5"
          fill={fillColor}
        />
      </svg>
    </div>
  )
}

export default TaskIcon
