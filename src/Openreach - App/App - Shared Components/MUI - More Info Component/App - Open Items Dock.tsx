import { useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Divider,
  Stack,
  Checkbox,
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import PersonIcon from '@mui/icons-material/Person'
import CloseIcon from '@mui/icons-material/Close'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'
import { MultiTaskDialog } from './App - Multi Task Dialog'

type FilterType = 'all' | 'task' | 'resource'

export interface OpenDockItem {
  id: string
  title: string
  type: 'task' | 'resource'
  subtitle?: string
}

export interface MinimizedTaskItem {
  id: string
  task: TaskTableRow
}

export interface OpenItemsDockProps {
  items: OpenDockItem[]
  minimizedTasks?: MinimizedTaskItem[]
  onClick?: (id: string) => void
  onDelete?: (id: string) => void
  onClearAll?: () => void
  onMinimizedTaskClick?: (task: TaskTableRow) => void
  onMinimizedTaskRemove?: (taskId: string) => void
  maxItems?: number
}

export const OpenItemsDock = ({
  items,
  minimizedTasks = [],
  onClick,
  onDelete,
  onClearAll,
  onMinimizedTaskClick,
  onMinimizedTaskRemove,
  maxItems = 20,
}: OpenItemsDockProps) => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [multiTaskDialogOpen, setMultiTaskDialogOpen] = useState(false)
  // Combine all items into a unified list
  const allItems = [
    ...items,
    ...minimizedTasks.map(({ id, task }) => ({
      id,
      title: task.taskId,
      type: 'task' as const,
      subtitle: task.status,
      task,
    })),
  ]

  // Apply filter
  const filteredItems = filter === 'all' 
    ? allItems 
    : allItems.filter(item => item.type === filter)

  const totalCount = allItems.length
  const taskCount = allItems.filter(item => item.type === 'task').length
  const resourceCount = allItems.filter(item => item.type === 'resource').length

  if (totalCount === 0) {
    return null
  }

  const handleItemClick = (item: typeof allItems[0]) => {
    // Click item to open it
    if ('task' in item && item.task && onMinimizedTaskClick) {
      onMinimizedTaskClick(item.task as TaskTableRow)
    } else if (onClick) {
      onClick(item.id)
    }
    setOpen(false)
  }

  const handleCheckboxToggle = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  const handleItemRemove = (item: typeof allItems[0], event: React.MouseEvent) => {
    event.stopPropagation()
    if ('task' in item && item.task && onMinimizedTaskRemove) {
      onMinimizedTaskRemove(item.id)
    } else if (onDelete) {
      onDelete(item.id)
    }
  }

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll()
    }
    setOpen(false)
  }

  const handleCompareSelected = () => {
    if (selectedIds.length >= 2) {
      setMultiTaskDialogOpen(true)
    }
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const getSelectedTasks = (): TaskTableRow[] => {
    return allItems
      .filter((item) => selectedIds.includes(item.id) && 'task' in item && item.task)
      .map((item) => ('task' in item ? item.task : null))
      .filter((task): task is TaskTableRow => task !== null)
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <TaskAltIcon sx={{ color: 'primary.main' }} />
      case 'resource':
        return <PersonIcon sx={{ color: 'secondary.main' }} />
      default:
        return <FolderOpenIcon sx={{ color: 'text.secondary' }} />
    }
  }

  return (
    <>
      {/* Floating trigger button - bottom left */}
      <Tooltip title="Open Items" placement="right">
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: 3,
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: 4,
            },
            zIndex: 1200,
          }}
        >
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
            <FolderOpenIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Drawer panel */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            maxWidth: '90vw',
            boxShadow: 4,
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              pb: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.9375rem' }}>
                Open Items
              </Typography>
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                sx={{
                  color: 'text.secondary',
                  p: 0.5,
                  '&:hover': {
                    color: 'text.primary',
                    bgcolor: alpha(theme.palette.text.primary, 0.08),
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>

            {/* Filter chips */}
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Button
                size="small"
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'contained' : 'outlined'}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: 1,
                }}
              >
                All · {totalCount}
              </Button>
              <Button
                size="small"
                onClick={() => setFilter('task')}
                variant={filter === 'task' ? 'contained' : 'outlined'}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: 1,
                }}
              >
                Tasks · {taskCount}
              </Button>
              <Button
                size="small"
                onClick={() => setFilter('resource')}
                variant={filter === 'resource' ? 'contained' : 'outlined'}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: 1,
                }}
              >
                Resources · {resourceCount}
              </Button>
            </Stack>

            {/* Action buttons */}
            {totalCount > 0 && (
              <Stack spacing={0.5}>
                {/* Compare button - always visible */}
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    disabled={selectedIds.length < 2}
                    startIcon={<CompareArrowsIcon sx={{ fontSize: 16 }} />}
                    onClick={handleCompareSelected}
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      py: 0.5,
                    }}
                  >
                    Compare ({selectedIds.length})
                  </Button>
                  {selectedIds.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={handleClearSelection}
                      sx={{ color: 'text.secondary' }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Stack>
                {/* Clear all button */}
                {onClearAll && (
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    startIcon={<ClearAllIcon sx={{ fontSize: 16 }} />}
                    onClick={handleClearAll}
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      py: 0.5,
                      justifyContent: 'flex-start',
                    }}
                  >
                    Clear All Items
                  </Button>
                )}
              </Stack>
            )}

            {/* Max items warning */}
            {totalCount >= maxItems && (
              <Typography
                variant="caption"
                sx={{
                  color: 'warning.dark',
                  fontSize: '0.6875rem',
                  display: 'block',
                  mt: 1,
                  px: 1,
                  py: 0.5,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  borderRadius: 0.5,
                  borderLeft: 2,
                  borderColor: 'warning.main',
                }}
              >
                Max {maxItems} items. Oldest removed automatically.
              </Typography>
            )}
          </Box>

          {/* Items list */}
          <List
            sx={{
              flex: 1,
              overflow: 'auto',
              py: 0,
            }}
          >
            {filteredItems.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No {filter === 'all' ? '' : filter} items to display
                </Typography>
              </Box>
            ) : (
              filteredItems.map((item, index) => (
                <Box key={item.id}>
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => handleItemRemove(item, e)}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={() => handleItemClick(item)}
                      selected={selectedIds.includes(item.id)}
                      sx={{
                        py: 1.25,
                        px: 2,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <Checkbox
                        edge="start"
                        checked={selectedIds.includes(item.id)}
                        onClick={(event) => handleCheckboxToggle(item.id, event)}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                        sx={{ mr: 1, p: 0 }}
                      />
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {getItemIcon(item.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          item.subtitle && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', lineHeight: 1.3 }}>
                              {item.subtitle}
                            </Typography>
                          )
                        }
                        sx={{ my: 0 }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < filteredItems.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </List>

          {/* Footer */}
          <Box
            sx={{
              p: 1.25,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.background.default, 0.4),
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
              {selectedIds.length > 0 
                ? `${selectedIds.length} selected • Select 2+ to compare`
                : 'Click item to open • Check boxes to compare multiple'}
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Multi-task comparison dialog */}
      <MultiTaskDialog
        open={multiTaskDialogOpen}
        onClose={() => {
          setMultiTaskDialogOpen(false)
          setSelectedIds([])
        }}
        tasks={getSelectedTasks()}
        onMinimize={() => {
          setMultiTaskDialogOpen(false)
          setSelectedIds([])
        }}
      />
    </>
  )
}
