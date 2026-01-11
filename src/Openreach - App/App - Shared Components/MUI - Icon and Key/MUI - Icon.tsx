import { useTheme } from '@mui/material'
import VpnKeyIcon from '@mui/icons-material/VpnKey'

export type TaskIconVariant = 'appointment' | 'startBy' | 'completeBy' | 'failedSLA' | 'taskGroup'

interface TaskIconProps {
  variant: TaskIconVariant
  size?: number
  color?: string
}

export function TaskIcon({ variant, size = 32, color }: TaskIconProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Get colors from theme
  const colors = isDark ? theme.openreach?.darkTokens?.mapTaskColors : theme.openreach?.lightTokens?.mapTaskColors
  const iconColor = color ?? colors[variant]

  return (
    <VpnKeyIcon
      sx={{
        fontSize: size,
        color: iconColor,
      }}
    />
  )
}

export default TaskIcon
