import { useTheme } from '@mui/material'
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle'
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
  
  // Determine icon color based on working status
  const getStatusColor = () => {
    if (statusColor) return statusColor
    
    const tokens = theme.openreach?.darkTokens || theme.openreach?.lightTokens
    
    switch (workingStatus) {
      case 'Signed on':
        return tokens?.success?.main || '#4CAF50'
      case 'Signed on no work':
        return tokens?.state?.warning || '#FF9800'
      case 'Not Signed on':
      case 'Absent':
        return tokens?.state?.error || '#F44336'
      case 'Rostered off':
        return '#9E9E9E'
      default:
        return '#9E9E9E'
    }
  }

  const iconColor = getStatusColor()

  return (
    <PersonPinCircleIcon 
      sx={{ 
        fontSize: size,
        color: iconColor,
        filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))'
      }} 
    />
  )
}

export default TaskIcon
