import { useState } from 'react'
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
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
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import PersonIcon from '@mui/icons-material/Person'
import CloseIcon from '@mui/icons-material/Close'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'

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
    if ('task' in item && item.task && onMinimizedTaskClick) {
      onMinimizedTaskClick(item.task as TaskTableRow)
    } else if (onClick) {
      onClick(item.id)
    }
    setOpen(false)
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
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                Open Items
              </Typography>
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary',
                    bgcolor: alpha(theme.palette.text.primary, 0.08),
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Filter buttons */}
            <Stack spacing={1.5}>
              <ButtonGroup size="small" fullWidth variant="outlined">
                <Button
                  onClick={() => setFilter('all')}
                  variant={filter === 'all' ? 'contained' : 'outlined'}
                  sx={{ textTransform: 'none' }}
                >
                  All ({totalCount})
                </Button>
                <Button
                  onClick={() => setFilter('task')}
                  variant={filter === 'task' ? 'contained' : 'outlined'}
                  sx={{ textTransform: 'none' }}
                >
                  Tasks ({taskCount})
                </Button>
                <Button
                  onClick={() => setFilter('resource')}
                  variant={filter === 'resource' ? 'contained' : 'outlined'}
                  sx={{ textTransform: 'none' }}
                >
                  Resources ({resourceCount})
                </Button>
              </ButtonGroup>

              {/* Clear all button */}
              {totalCount > 0 && onClearAll && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<ClearAllIcon />}
                  onClick={handleClearAll}
                  fullWidth
                  sx={{ textTransform: 'none' }}
                >
                  Clear All Items
                </Button>
              )}

              {/* Max items warning */}
              {totalCount >= maxItems && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'warning.main',
                    fontSize: '0.7rem',
                    display: 'block',
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                  }}
                >
                  Maximum {maxItems} items reached. Oldest items will be removed automatically.
                </Typography>
              )}
            </Stack>
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
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getItemIcon(item.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                            {item.type === 'task' ? 'Task' : 'Resource'} · {item.title}
                          </Typography>
                        }
                        secondary={
                          item.subtitle && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
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
              p: 1.5,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              Click an item to reopen
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}
