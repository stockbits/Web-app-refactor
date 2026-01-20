import { useState } from 'react'
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Badge,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import type { ReactNode } from 'react'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'

export interface TaskDockItem {
  id: string
  title: string
  icon?: ReactNode
  subtitle?: string
}

export interface MinimizedTaskItem {
  id: string
  task: TaskTableRow
}

export interface TaskDockDialProps {
  items: TaskDockItem[]
  minimizedTasks?: MinimizedTaskItem[]
  onClick?: (id: string) => void
  onDelete?: (id: string) => void
  onMinimizedTaskClick?: (task: TaskTableRow) => void
  onMinimizedTaskRemove?: (taskId: string) => void
}

export const TaskDockDial = ({
  items,
  minimizedTasks = [],
  onClick,
  onDelete,
  onMinimizedTaskClick,
  onMinimizedTaskRemove,
}: TaskDockDialProps) => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)

  const allItems = [
    ...items.map(item => ({ ...item, type: 'recent' as const })),
    ...minimizedTasks.map(({ id, task }) => ({
      id,
      title: task.taskId,
      subtitle: task.status,
      type: 'minimized' as const,
      task,
    })),
  ]

  const totalCount = allItems.length

  if (totalCount === 0) {
    return null
  }

  const handleActionClick = (item: typeof allItems[0]) => {
    if (item.type === 'recent' && onClick) {
      onClick(item.id)
    } else if (item.type === 'minimized' && onMinimizedTaskClick) {
      onMinimizedTaskClick(item.task!)
    }
    setOpen(false)
  }

  const handleActionDelete = (item: typeof allItems[0], event: React.MouseEvent) => {
    event.stopPropagation()
    if (item.type === 'recent' && onDelete) {
      onDelete(item.id)
    } else if (item.type === 'minimized' && onMinimizedTaskRemove) {
      onMinimizedTaskRemove(item.id)
    }
  }

  return (
    <SpeedDial
      ariaLabel="Docked tasks and resources"
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        '& .MuiSpeedDial-fab': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        },
      }}
      icon={
        <Badge
          badgeContent={totalCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              height: 20,
              minWidth: 20,
              fontWeight: 600,
            },
          }}
        >
          <SpeedDialIcon icon={<BookmarkIcon />} openIcon={<CloseIcon />} />
        </Badge>
      }
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      direction="up"
    >
      {allItems.map((item) => (
        <SpeedDialAction
          key={item.id}
          icon={
            <Tooltip title={`Remove ${item.title}`} placement="left">
              <CloseIcon
                onClick={(e) => handleActionDelete(item, e)}
                sx={{
                  fontSize: 18,
                  color: 'error.main',
                  '&:hover': {
                    color: 'error.dark',
                  },
                }}
              />
            </Tooltip>
          }
          tooltipTitle={
            item.subtitle ? (
              <div>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{item.subtitle}</div>
              </div>
            ) : (
              item.title
            )
          }
          tooltipPlacement="left"
          onClick={() => handleActionClick(item)}
          sx={{
            bgcolor: item.type === 'minimized' 
              ? alpha(theme.palette.warning.main, 0.1)
              : 'background.paper',
            border: 1,
            borderColor: item.type === 'minimized' 
              ? alpha(theme.palette.warning.main, 0.3)
              : 'divider',
            '&:hover': {
              bgcolor: item.type === 'minimized'
                ? alpha(theme.palette.warning.main, 0.2)
                : alpha(theme.palette.primary.main, 0.08),
              borderColor: 'primary.main',
            },
          }}
        />
      ))}
    </SpeedDial>
  )
}
