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

  // Color mapping based on theme tokens (only used if color not provided)
  const getColors = () => {
    if (isDark) {
      return {
        appointment: '#6B99D8',
        startBy: '#FBBF24',
        completeBy: '#52BE84',
        failedSLA: '#FB7185',
      }
    }
    return {
      appointment: '#5488C7',
      startBy: '#D97706',
      completeBy: '#43B072',
      failedSLA: '#DC2626',
    }
  }

  const colors = getColors()
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
