import { useTheme } from '@mui/material'
import PlaceIcon from '@mui/icons-material/Place'

export type TaskIconVariant = 'appointment' | 'startBy' | 'completeBy' | 'failedSLA'

interface TaskIconProps {
  variant: TaskIconVariant
  size?: number
  color?: string
  backgroundColor?: string
}

export function TaskIcon({ variant, size = 32, color, backgroundColor }: TaskIconProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Color mapping based on theme tokens (only used if color not provided)
  const getColors = () => {
    if (isDark) {
      return {
        appointment: theme.openreach?.darkTokens?.state?.info ?? '#6B99D8',
        startBy: theme.openreach?.darkTokens?.state?.warning ?? '#FBBF24',
        completeBy: theme.openreach?.darkTokens?.state?.success ?? '#52BE84',
        failedSLA: theme.openreach?.darkTokens?.state?.error ?? '#FB7185',
      }
    }
    return {
      appointment: theme.openreach?.lightTokens?.state?.info ?? '#5488C7',
      startBy: theme.openreach?.lightTokens?.state?.warning ?? '#D97706',
      completeBy: theme.openreach?.lightTokens?.state?.success ?? '#43B072',
      failedSLA: theme.openreach?.lightTokens?.state?.error ?? '#DC2626',
    }
  }

  const colors = getColors()
  const fillColor = color ?? colors[variant]
  const bgColor = backgroundColor ?? theme.palette?.background?.paper ?? '#FFFFFF'

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
          fill={bgColor}
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
