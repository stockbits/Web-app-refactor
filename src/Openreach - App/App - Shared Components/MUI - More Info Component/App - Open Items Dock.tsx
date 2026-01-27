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
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import DescriptionIcon from '@mui/icons-material/Description'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import PersonIcon from '@mui/icons-material/Person'
import CloseIcon from '@mui/icons-material/Close'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
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

  // Memoize counts
  const { totalCount, taskCount, resourceCount } = useMemo(
    () => ({
      totalCount: allItems.length,
      taskCount: allItems.filter((item) => item.type === 'task').length,
      resourceCount: allItems.filter((item) => item.type === 'resource').length,
    }),
    [allItems]
  )

  // Memoize selected tasks for comparison
  const selectedTasks = useMemo(
    () => allItems
      .filter(i => selectedIds.includes(i.id) && i.task)
      .map(i => i.task as TaskTableRow)
      .slice(0, 3),
    [allItems, selectedIds]
  )

  const handleItemSelect = useCallback(
    (item: typeof allItems[0], event: React.MouseEvent) => {
      // Ctrl+click for multi-select (max 3)
      if (event.ctrlKey || event.metaKey) {
        setSelectedIds(prev => {
          if (prev.includes(item.id)) {
            // Deselect
            return prev.filter(id => id !== item.id)
          } else if (prev.length < 3) {
            // Select (max 3)
            return [...prev, item.id]
          }
          // Already at max, don't select
          return prev
        })
      } else {
        // Regular click - open task(s)
        if (selectedIds.length >= 2 && selectedIds.includes(item.id)) {
          // If clicking on a selected item and we have 2+ selected, open multi-task dialog
          if (selectedTasks.length >= 2 && onMinimizedTaskClick) {
            onMinimizedTaskClick(selectedTasks)
          }
        } else {
          // Single task open
          if ('task' in item && item.task && onMinimizedTaskClick) {
            onMinimizedTaskClick(item.task as TaskTableRow)
          } else if (onClick) {
            onClick(item.id)
          }
        }
        setSelectedIds([])
        setOpen(false)
      }
    },
    [onClick, onMinimizedTaskClick, selectedTasks, selectedIds]
  )

  const handleItemClick = useCallback(
    (item: typeof allItems[0]) => {
      if ('task' in item && item.task && onMinimizedTaskClick) {
        onMinimizedTaskClick(item.task as TaskTableRow)
      } else if (onClick) {
        onClick(item.id)
      }
      setOpen(false)
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
    setOpen(false)
  }, [onClearAll])

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
      <Tooltip title="Open Items" placement="right">
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: 3,
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
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
            <Stack 
              direction="row" 
              spacing={{ xs: 0.5, sm: 1 }} 
              sx={{ 
                mb: 1.5,
                flexWrap: 'wrap',
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'contained' : 'outlined'}
                sx={{
                  minWidth: 'auto',
                  px: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  textTransform: 'none',
                  borderRadius: 1,
                  flex: { xs: '1 1 auto', sm: '0 0 auto' },
                }}
              >
                All · {totalCount}
              </Button>
              <Button
                onClick={() => setFilter('task')}
                variant={filter === 'task' ? 'contained' : 'outlined'}
                sx={{
                  minWidth: 'auto',
                  px: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  textTransform: 'none',
                  borderRadius: 1,
                  flex: { xs: '1 1 auto', sm: '0 0 auto' },
                }}
              >
                Tasks · {taskCount}
              </Button>
              <Button
                onClick={() => setFilter('resource')}
                variant={filter === 'resource' ? 'contained' : 'outlined'}
                sx={{
                  minWidth: 'auto',
                  px: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  textTransform: 'none',
                  borderRadius: 1,
                  flex: { xs: '1 1 auto', sm: '0 0 auto' },
                }}
              >
                Resources · {resourceCount}
              </Button>
            </Stack>

            {/* Action buttons */}
            {onClearAll && totalCount > 0 && (
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 0.5, sm: 0.5 }} 
                sx={{ mt: 1.5 }}
              >
                {/* Compare selected button - active when 2-3 selected */}
                <Tooltip title={selectedIds.length >= 2 ? `Compare ${selectedIds.length} tasks` : "Select 2-3 tasks to compare"} placement="top">
                  <span style={{ flex: 1, width: '100%' }}>
                    <Button
                      variant="text"
                      color="primary"
                      disabled={selectedIds.length < 2}
                      startIcon={<OpenInNewIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                      onClick={() => {
                        if (selectedTasks.length >= 2 && onMinimizedTaskClick) {
                          onMinimizedTaskClick(selectedTasks)
                        }
                        setSelectedIds([])
                        setOpen(false)
                      }}
                      fullWidth
                      sx={{
                        textTransform: 'none',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        py: 0.5,
                        justifyContent: 'flex-start',
                        '&.Mui-disabled': {
                          color: 'text.disabled',
                        },
                      }}
                    >
                      {selectedIds.length >= 2 ? `Tasks ${selectedIds.length}` : 'Tasks'}
                    </Button>
                  </span>
                </Tooltip>
                {/* Clear all button */}
                <Button
                  variant="text"
                  color="error"
                  startIcon={<ClearAllIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  onClick={handleClearAll}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    py: 0.5,
                    justifyContent: 'flex-start',
                    flex: 1,
                  }}
                >
                  Clear All
                </Button>
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
                    sx={{
                      '&:hover .action-icons': {
                        opacity: 1,
                      },
                    }}
                  >
                    <ListItemButton
                      selected={selectedIds.includes(item.id)}
                      onClick={(e) => handleItemSelect(item, e)}
                      sx={{
                        py: 1.25,
                        px: 2,
                        pr: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.16),
                          },
                        },
                      }}
                    >
                      {/* Order number badge */}
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Box>
                      
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
                        sx={{ my: 0, flex: 1, pr: 1 }}
                      />
                      
                      {/* Action icons group */}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        className="action-icons"
                        sx={{
                          ml: 'auto',
                          flexShrink: 0,
                          transition: 'opacity 0.2s',
                          opacity: 0.7,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Open icon - disabled when multiple items selected */}
                        <Tooltip title={selectedIds.length >= 2 ? "Use compare icon above" : "Open"} placement="top">
                          <span>
                            <IconButton
                              size="small"
                              disabled={selectedIds.length >= 2}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleItemClick(item)
                              }}
                              sx={{
                                color: 'text.secondary',
                                p: 0.5,
                                '&:hover': {
                                  color: 'primary.main',
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                },
                                '&.Mui-disabled': {
                                  color: 'text.disabled',
                                },
                              }}
                            >
                              <OpenInNewIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        {/* Close/Remove icon */}
                        <Tooltip title="Remove item" placement="top">
                          <IconButton
                            size="small"
                            onClick={(e) => handleItemRemove(item, e)}
                            sx={{
                              color: 'text.secondary',
                              p: 0.5,
                              '&:hover': {
                                color: 'error.main',
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
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
                ? `${selectedIds.length} selected • Click any to compare${selectedIds.length < 3 ? ' • Ctrl+click for more' : ''}`
                : 'Click to open • Ctrl+click to select (max 3)'}
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}
