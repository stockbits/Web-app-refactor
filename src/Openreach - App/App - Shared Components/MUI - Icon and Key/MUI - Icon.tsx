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
  
  // Determine status indicator circle color based on working status
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
  const personIconSize = size * 0.5
  const personX = size / 2
  const personY = size * 0.35
  
  // Status indicator circle position (top-right of pin)
  const statusCircleX = size * 0.72
  const statusCircleY = size * 0.15
  const statusCircleRadius = size * 0.15

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
      {/* Person icon centered in the pin */}
      <g transform={`translate(${personX - personIconSize / 2}, ${personY - personIconSize / 2})`}>
        <circle
          cx={personIconSize / 2}
          cy={personIconSize * 0.3}
          r={personIconSize * 0.25}
          fill="black"
        />
        <path
          d={`M ${personIconSize * 0.15} ${personIconSize * 0.85} Q ${personIconSize * 0.15} ${personIconSize * 0.55} ${personIconSize / 2} ${personIconSize * 0.55} Q ${personIconSize * 0.85} ${personIconSize * 0.55} ${personIconSize * 0.85} ${personIconSize * 0.85} Z`}
          fill="black"
        />
      </g>
      {/* Status indicator circle */}
      <circle
        cx={statusCircleX}
        cy={statusCircleY}
        r={statusCircleRadius}
        fill={statusIndicatorColor}
        stroke={strokeColor}
        strokeWidth="1"
      />
    </svg>
  )
}

export default TaskIcon
