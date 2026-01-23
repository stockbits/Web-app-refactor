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
  
  // Determine fill color based on working status
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

  const fillColor = getStatusColor()

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
      {/* Solid colored map marker teardrop with black outline */}
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* MUI Person icon - more recognizable standard person silhouette */}
      <g transform="translate(12, 7)" fill="white" stroke={strokeColor} strokeWidth="0.5">
        {/* Head */}
        <circle cx="0" cy="-1.5" r="1.8" />
        {/* Body - classic person icon shape */}
        <path d="M -3 5 L -3 1.5 Q -3 0.5 -1.5 0.5 L 1.5 0.5 Q 3 0.5 3 1.5 L 3 5 L 2 5 L 2 2 L 0.5 2 L 0.5 5 L -0.5 5 L -0.5 2 L -2 2 L -2 5 Z" />
      </g>
    </svg>
  )
}

export default TaskIcon
