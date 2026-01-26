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
        stroke="#000000"
        strokeWidth="2.5"
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
  
  // Determine border/outline color based on working status
  const getStatusColor = () => {
    if (statusColor) return statusColor
    
    const tokens = theme.openreach?.darkTokens || theme.openreach?.lightTokens
    
    switch (workingStatus) {
      case 'Signed on':
        return tokens?.success?.main || '#4CAF50'
      case 'Signed on no work':
        return tokens?.state?.warning || '#FF9800'
      case 'Not Signed on':
        return tokens?.state?.error || '#F44336'
      case 'Absent':
      case 'Rostered off':
        return '#9E9E9E'
      default:
        return '#9E9E9E'
    }
  }

  const borderColor = getStatusColor()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      role="img"
      style={{ display: 'inline-block', filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))' }}
    >
      {/* White teardrop background with colored status outline */}
      <path 
        fill="white" 
        stroke={borderColor} 
        strokeWidth="1.5" 
        d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"
      />
      {/* Jet black person silhouette in center */}
      <g fill="#000000" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="0.3">
        <circle cx="12" cy="6" r="2"/>
        <path d="M12 9.8c-2 0-3.98.73-4 2.05.86 1.3 2.33 2.15 4 2.15s3.14-.85 4-2.15c-.02-1.32-2-2.05-4-2.05z"/>
      </g>
    </svg>
  )
}

export default TaskIcon
