import { useState, useCallback, memo } from 'react'
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  alpha,
  useTheme,
  Chip,
  Collapse,
  Fade,
  Slide,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'
import InboxIcon from '@mui/icons-material/Inbox'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'

export interface TaskQuickTrayProps {
  tasks: TaskTableRow[]
  onTaskRemove?: (taskId: string) => void
  onClearAll?: () => void
  onOpenFull?: (task: TaskTableRow) => void
}

// Individual Task Card Component
const TaskCard = memo(({
  task,
  onTaskClick,
  onRemove,
}: {
  task: TaskTableRow
  onTaskClick: () => void
  onRemove: () => void
}) => {
  const theme = useTheme()

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return theme.palette.success.main
      case 'in progress':
      case 'started':
        return theme.palette.info.main
      case 'pending':
        return theme.palette.warning.main
      default:
        return theme.palette.text.secondary
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon sx={{ fontSize: 14 }} />
      case 'in progress':
      case 'started':
        return <PlayArrowIcon sx={{ fontSize: 14 }} />
      default:
        return <ScheduleIcon sx={{ fontSize: 14 }} />
    }
  }

  return (
    <Paper
      elevation={2}
      sx={{
        minWidth: { xs: 180, sm: 220 },
        maxWidth: { xs: 220, sm: 280 },
        height: { xs: 70, sm: 80 },
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        bgcolor: 'background.paper',
        '&:hover': {
          elevation: 8,
          borderColor: theme.palette.primary.main,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onTaskClick}
    >
      {/* Compact View */}
      <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={{ xs: 0.5, sm: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Task ID and Status Badge - same row to prevent clipping on mobile */}
            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ mb: 0.5 }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                noWrap
                sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' }, color: 'primary.main' }}
              >
                {task.taskId || '—'}
              </Typography>
              <Chip
                icon={getStatusIcon(task.status)}
                label={task.status}
                size="small"
                sx={{
                  height: { xs: 18, sm: 20 },
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                  fontWeight: 600,
                  bgcolor: alpha(getStatusColor(task.status), 0.1),
                  color: getStatusColor(task.status),
                  flexShrink: 0,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                    fontSize: { xs: 12, sm: 14 },
                  },
                }}
              />
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: 'block', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
            >
              {task.postCode || 'No location'}
            </Typography>
          </Box>

          <Stack spacing={0.5}>
            <Tooltip title="Remove from tray" placement="top">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                sx={{
                  p: 0.5,
                  opacity: 0.6,
                  '&:hover': {
                    opacity: 1,
                    color: 'error.main',
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  )
})

TaskCard.displayName = 'TaskCard'

// Main Tray Component
const TaskQuickTrayComponent = ({
  tasks,
  onTaskRemove,
  onClearAll,
  onOpenFull,
}: TaskQuickTrayProps) => {
  const theme = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleTaskCardClick = useCallback((task: TaskTableRow) => {
    // Open directly in full view - inline preview doesn't add value
    onOpenFull?.(task)
  }, [onOpenFull])

  const handleTaskRemove = useCallback((taskId: string) => {
    onTaskRemove?.(taskId)
  }, [onTaskRemove])

  return (
    <Slide direction="up" in={true} timeout={300}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: { xs: 8, sm: 16 },
          left: { xs: 8, sm: 16 },
          right: 'auto',
          maxWidth: isCollapsed ? { xs: 160, sm: 200 } : 'calc(100vw - 32px)',
          width: isCollapsed ? 'auto' : 'auto',
          zIndex: 1150,
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 1, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={{ xs: 0.75, sm: 1 }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Quick Tasks
            </Typography>
            <Chip
              label={tasks.length}
              size="small"
              color={tasks.length > 0 ? 'primary' : 'default'}
              sx={{
                height: { xs: 18, sm: 20 },
                minWidth: { xs: 18, sm: 20 },
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                fontWeight: 700,
                '& .MuiChip-label': {
                  px: { xs: 0.5, sm: 0.75 },
                },
              }}
            />
          </Stack>

          <Stack direction="row" spacing={0.5}>
            {tasks.length > 0 && (
              <Tooltip title="Clear all tasks" placement="top">
                <IconButton
                  size="small"
                  onClick={() => {
                    onClearAll?.()
                  }}
                  sx={{
                    p: 0.5,
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  <ClearAllIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isCollapsed ? 'Expand tray' : 'Collapse tray'} placement="top">
              <IconButton
                size="small"
                onClick={() => {
                  setIsCollapsed(!isCollapsed)
                }}
                sx={{
                  p: 0.5,
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {isCollapsed ? (
                  <KeyboardArrowUpIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Task Cards Carousel */}
        <Collapse in={!isCollapsed} timeout={250}>
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 1, sm: 1.5 },
              p: { xs: 1, sm: 1.5 },
              overflowX: 'auto',
              overflowY: 'hidden',
              maxWidth: { xs: 'calc(100vw - 32px)', sm: 'calc(100vw - 100px)', md: '90vw' },
              '&::-webkit-scrollbar': {
                height: { xs: 4, sm: 6 },
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: alpha(theme.palette.divider, 0.1),
                borderRadius: 3,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(theme.palette.primary.main, 0.3),
                borderRadius: 3,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.5),
                },
              },
            }}
          >
            {tasks.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: { xs: 200, sm: 250 },
                  py: { xs: 2, sm: 3 },
                  px: 2,
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <InboxIcon
                    sx={{
                      fontSize: 40,
                      color: 'text.disabled',
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" align="center">
                    No tasks in tray
                  </Typography>
                  <Typography variant="caption" color="text.disabled" align="center">
                    Tasks will appear here when added
                  </Typography>
                </Stack>
              </Box>
            ) : (
              tasks.map((task) => (
                <Fade key={task.taskId} in={true} timeout={300}>
                  <Box>
                    <TaskCard
                      task={task}
                      onTaskClick={() => handleTaskCardClick(task)}
                      onRemove={() => handleTaskRemove(task.taskId)}
                    />
                  </Box>
                </Fade>
              ))
            )}
          </Box>
        </Collapse>
      </Paper>
    </Slide>
  )
}

export const TaskQuickTray = memo(TaskQuickTrayComponent, (prevProps, nextProps) => {
  return (
    prevProps.tasks.length === nextProps.tasks.length &&
    prevProps.tasks.every((task, idx) => task.taskId === nextProps.tasks[idx]?.taskId)
  )
})
