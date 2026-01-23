import { useTheme } from '@mui/material'
import type { WorkingStatus } from '../../App - Data Tables/Resource - Table'

export type TaskIconVariant = 'appointment' | 'startBy' | 'completeBy' | 'failedSLA' | 'taskGroup'

interface TaskIconProps {
  variant: TaskIconVariant
  size?: number
  color?: string
}

export function TaskIcon({ variant, size = 32, color }: TaskIconProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const strokeColor = theme.openreach?.coreBlock ?? '#000000'

  // Get colors from theme
  const colors = isDark ? theme.openreach?.darkTokens?.mapTaskColors : theme.openreach?.lightTokens?.mapTaskColors
  const fillColor = color ?? colors?.[variant] ?? '#43B072'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      role="img"
      style={{ display: 'inline-block', paintOrder: 'stroke fill' }}
    >
      {/* Solid map marker pin shape */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

interface ResourceIconProps {
  workingStatus: WorkingStatus
  size?: number
  statusColor?: string
}

export function ResourceIcon({ workingStatus, size = 32, statusColor }: ResourceIconProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const strokeColor = theme.openreach?.coreBlock ?? '#000000'
  
  // Determine status indicator color based on working status
  const getStatusColor = () => {
    if (statusColor) return statusColor
    
    const tokens = isDark ? theme.openreach?.darkTokens : theme.openreach?.lightTokens
    
    switch (workingStatus) {
      case 'Signed on':
        return tokens?.success?.main || '#4CAF50'
      case 'Signed on no work':
        return tokens?.state?.warning || '#FF9800'
      case 'Not Signed on':
      case 'Absent':
        return tokens?.state?.error || '#F44336'
      case 'Rostered off':
        return theme.palette.text.secondary
      default:
        return '#9E9E9E'
    }
  }

  const statusIndicatorColor = getStatusColor()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      role="img"
      style={{ display: 'inline-block', paintOrder: 'stroke fill' }}
    >
      {/* White/light map marker teardrop with black outline */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="white"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Colored circle background behind person icon for status indication */}
      <circle
        cx="12"
        cy="7"
        r="3.5"
        fill={statusIndicatorColor}
      />
      {/* Person icon centered in the pin */}
      <g>
        {/* Head */}
        <circle
          cx="12"
          cy="5.8"
          r="1.3"
          fill="white"
        />
        {/* Body */}
        <path
          d="M 9.5 9.5 Q 9.5 7.5 12 7.5 Q 14.5 7.5 14.5 9.5 Z"
          fill="white"
        />
      </g>
    </svg>
  )
}

export default TaskIcon
