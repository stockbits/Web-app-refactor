import { useState, useMemo, useCallback } from 'react'
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
  Popover,
  Card,
  CardContent,
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import DescriptionIcon from '@mui/icons-material/Description'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import PersonIcon from '@mui/icons-material/Person'
import CloseIcon from '@mui/icons-material/Close'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'

type FilterType = 'all' | 'task' | 'resource'

export interface OpenDockItem {
  id: string
  title: string
  type: 'task' | 'resource'
  subtitle?: string
  task?: TaskTableRow
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
  onMinimizedTaskClick?: (task: TaskTableRow | TaskTableRow[]) => void
  onMinimizedTaskRemove?: (taskId: string) => void
  onDrawerClose?: () => void // New callback for when drawer closes
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
  onDrawerClose,
  maxItems = 20,
}: OpenItemsDockProps) => {
  const theme = useTheme()
  const [previewAnchor, setPreviewAnchor] = useState<HTMLElement | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const previewOpen = Boolean(previewAnchor)
  // Memoize combined items list
  const allItems = useMemo(
    () => [
      ...items.map(item => ({ ...item, source: 'dock' as const })),
      ...minimizedTasks.map(({ id, task }) => ({
        id,
        title: task.taskId,
        type: 'task' as const,
        subtitle: task.status,
        task,
        source: 'minimized' as const,
      })),
    ],
    [items, minimizedTasks]
  )

  // Memoize filtered items
  const filteredItems = useMemo(
    () => (filter === 'all' ? allItems : allItems.filter((item) => item.type === filter)),
    [allItems, filter]
  )

  // Get visible items (first 3 of filtered)
  const visibleItems = useMemo(() => filteredItems.slice(0, 3), [filteredItems])

  // Memoize counts
  const { totalCount, taskCount, resourceCount } = useMemo(
    () => ({
      totalCount: allItems.length,
      taskCount: allItems.filter((item) => item.type === 'task').length,
      resourceCount: allItems.filter((item) => item.type === 'resource').length,
    }),
    [allItems]
  )

  const handleItemClick = useCallback(
    (item: typeof allItems[0]) => {
      if ('task' in item && item.task && onMinimizedTaskClick) {
        onMinimizedTaskClick(item.task as TaskTableRow)
      } else if (onClick) {
        onClick(item.id)
      }
      setPreviewAnchor(null)
    },
    [onClick, onMinimizedTaskClick]
  )

  const handleItemRemove = useCallback(
    (item: typeof allItems[0], event: React.MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()
      if (item.source === 'minimized' && onMinimizedTaskRemove) {
        onMinimizedTaskRemove(item.id)
      } else if (onDelete) {
        onDelete(item.id)
      }
    },
    [onDelete, onMinimizedTaskRemove]
  )

  const handleClearAll = useCallback(() => {
    if (onClearAll) {
      onClearAll()
    }
    setPreviewAnchor(null)
  }, [onClearAll])

  const handleIconClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (previewOpen) {
      // If preview is open, close preview
      setPreviewAnchor(null)
    } else {
      // Show preview
      setPreviewAnchor(event.currentTarget)
    }
  }, [previewOpen])

  const handleOpenAll = useCallback(() => {
    // Open all visible items (up to 3 based on current filter)
    const tasksToOpen = visibleItems
      .filter(item => item.task)
      .map(item => item.task as TaskTableRow)
      .slice(0, 3)
    
    if (tasksToOpen.length > 1 && onMinimizedTaskClick) {
      // Open multi-task dialog
      onMinimizedTaskClick(tasksToOpen)
    } else if (tasksToOpen.length === 1 && onMinimizedTaskClick) {
      // Open single task
      onMinimizedTaskClick(tasksToOpen[0])
    }
    setPreviewAnchor(null)
  }, [visibleItems, onMinimizedTaskClick])

  const handlePreviewClose = useCallback(() => {
    setPreviewAnchor(null)
  }, [])

  const getItemIcon = useCallback((type: string) => {
    switch (type) {
      case 'task':
        return <TaskAltIcon sx={{ color: 'primary.main' }} />
      case 'resource':
        return <PersonIcon sx={{ color: 'secondary.main' }} />
      default:
        return <FolderOpenIcon sx={{ color: 'text.secondary' }} />
    }
  }, [])

  // Early return AFTER all hooks
  if (totalCount === 0) {
    return null
  }

  return (
    <>
      {/* Floating trigger button - bottom left */}
      <Tooltip title={previewOpen ? "Close preview" : "View docked items"} placement="right">
        <IconButton
          onClick={handleIconClick}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            bgcolor: previewOpen ? 'primary.dark' : 'primary.main',
            color: 'primary.contrastText',
            boxShadow: 3,
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: 4,
            },
            zIndex: 1200,
            transition: 'all 0.2s',
          }}
        >
          <Badge
            badgeContent={totalCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 18, sm: 20 },
                minWidth: { xs: 18, sm: 20 },
                fontWeight: 600,
              },
            }}
          >
            <DescriptionIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Preview Popover - compact list */}
      <Popover
        open={previewOpen}
        anchorEl={previewAnchor}
        onClose={handlePreviewClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              ml: 1,
              mb: 1,
              maxWidth: 380,
              minWidth: 300,
              boxShadow: 4,
            },
          },
        }}
      >
        <Card elevation={0}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack spacing={1.5}>
              {/* Header */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                  Docked Items
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {totalCount} total
                </Typography>
              </Stack>

              {/* Filter buttons */}
              <Stack direction="row" spacing={0.5}>
                <Button
                  onClick={() => setFilter('all')}
                  variant={filter === 'all' ? 'contained' : 'outlined'}
                  size="small"
                  sx={{
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    borderRadius: 1,
                    flex: 1,
                  }}
                >
                  All · {totalCount}
                </Button>
                <Button
                  onClick={() => setFilter('task')}
                  variant={filter === 'task' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<TaskAltIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    borderRadius: 1,
                    flex: 1,
                  }}
                >
                  {taskCount}
                </Button>
                <Button
                  onClick={() => setFilter('resource')}
                  variant={filter === 'resource' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<PersonIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    borderRadius: 1,
                    flex: 1,
                  }}
                >
                  {resourceCount}
                </Button>
              </Stack>

              <Divider />

              {/* Quick list preview (first 3 of filtered items) */}
              <Stack spacing={0.5}>
                {visibleItems.length === 0 ? (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      No {filter === 'all' ? '' : filter} items
                    </Typography>
                  </Box>
                ) : (
                  visibleItems.map((item, index) => (
                    <Box
                      key={item.id}
                      sx={{
                        position: 'relative',
                        '&:hover .remove-icon': {
                          opacity: 1,
                        },
                      }}
                    >
                      <Box
                        onClick={() => handleItemClick(item)}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: 1,
                          bgcolor: theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.primary.main, 0.08)
                            : alpha(theme.palette.primary.main, 0.04),
                          border: 1,
                          borderColor: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.12),
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 1px 3px rgba(0,0,0,0.3)'
                            : '0 1px 2px rgba(0,0,0,0.05)',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            transform: 'translateX(2px)',
                            boxShadow: theme.palette.mode === 'dark'
                              ? '0 2px 6px rgba(0,0,0,0.4)'
                              : '0 2px 4px rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: alpha(theme.palette.primary.main, 0.15),
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.title}
                            </Typography>
                            {item.subtitle && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.65rem',
                                  color: 'text.secondary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                }}
                              >
                                {item.subtitle}
                              </Typography>
                            )}
                          </Box>
                          {getItemIcon(item.type)}
                        </Stack>
                      </Box>
                      {/* Remove button */}
                      <IconButton
                        size="small"
                        className="remove-icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.source === 'minimized' && onMinimizedTaskRemove) {
                            onMinimizedTaskRemove(item.id)
                          } else if (onDelete) {
                            onDelete(item.id)
                          }
                        }}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          bgcolor: alpha(theme.palette.background.paper, 0.9),
                          width: 24,
                          height: 24,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main',
                          },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))
                )}
              </Stack>

              {/* Show more indicator */}
              {filteredItems.length > 3 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  +{filteredItems.length - 3} more {filter === 'all' ? '' : filter} {filteredItems.length - 3 === 1 ? 'item' : 'items'}
                </Typography>
              )}

              <Divider />

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={handleOpenAll}
                  variant="contained"
                  size="small"
                  fullWidth
                  disabled={visibleItems.length === 0}
                  endIcon={<OpenInNewIcon />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.75,
                  }}
                >
                  Open All ({visibleItems.length})
                </Button>
                {onClearAll && totalCount > 0 && (
                  <Button
                    onClick={handleClearAll}
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      py: 0.75,
                      minWidth: 80,
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Stack>

              {/* Helper text */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.65rem',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                Click item to open • Use filters to refine
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Popover>
    </>
  )
}
