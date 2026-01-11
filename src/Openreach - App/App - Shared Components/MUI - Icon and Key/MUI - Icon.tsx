import { useTheme } from '@mui/material'

export type TaskIconVariant = 'appointment' | 'startBy' | 'completeBy' | 'failedSLA'

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
  const fillColor = color ?? colors[variant]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: 'inline-block' }}
    >
      {/* Solid map marker pin shape */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={fillColor}
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default TaskIcon
