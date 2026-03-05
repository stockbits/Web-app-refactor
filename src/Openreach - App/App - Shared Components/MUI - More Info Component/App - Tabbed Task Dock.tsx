import { useState, useMemo, useCallback, useEffect, memo } from 'react'
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  alpha,
  useTheme,
  Backdrop,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MinimizeIcon from '@mui/icons-material/Minimize'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'
import { TaskDetails } from './App - Task Details'

export interface TabbedDockItem {
  id: string
  title: string
  type: 'task' | 'resource'
  subtitle?: string
  task?: TaskTableRow
}

export interface TabbedTaskDockProps {
  items: TabbedDockItem[]
  open?: boolean
  onClose?: () => void
  onTabClose?: (id: string) => void
  onMinimize?: (id: string) => void
  onAddNote?: (type: 'field' | 'progress', text: string) => void
  defaultHeight?: number
  minHeight?: number
  maxHeight?: number
}

// Memoized minimized task item for better performance
const MinimizedTaskItem = memo(({ 
  item, 
  isActive, 
  onExpand, 
  onClose,
}: { 
  item: TabbedDockItem
  isActive: boolean
  onExpand: () => void
  onClose: (id: string) => void
}) => {
  const theme = useTheme()
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onExpand()
  }, [onExpand])

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onClose(item.id)
  }, [item.id, onClose])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.12),
        },
      }}
      onClick={handleClick}
    >
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {item.title}
      </Typography>
      <IconButton
        size="small"
        onClick={handleCloseClick}
        sx={{
          p: 0.5,
          color: 'text.secondary',
          '&:hover': {
            color: 'error.main',
            bgcolor: alpha(theme.palette.error.main, 0.1),
          },
        }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  )
})

MinimizedTaskItem.displayName = 'MinimizedTaskItem'

const TabbedTaskDockComponent = ({
  items,
  open = true,
  onClose,
  onTabClose,
  onMinimize,
  onAddNote,
  defaultHeight = 500,
  minHeight = 300,
  maxHeight = 800,
}: TabbedTaskDockProps) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [drawerHeight, setDrawerHeight] = useState(defaultHeight)
  const [isDragging, setIsDragging] = useState(false)
  
  // Track previous items length to auto-expand when new items added
  const [prevItemsLength, setPrevItemsLength] = useState(items.length)

  // Reset active tab if current one is closed
  useEffect(() => {
    if (activeTab >= items.length && items.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(items.length - 1)
    } else if (items.length === 0) {
       
      setActiveTab(0)
    }
  }, [items.length, activeTab])

  // Auto-expand when new items are added
  useEffect(() => {
    if (items.length > prevItemsLength) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCollapsed(false)
    }
    setPrevItemsLength(items.length)
  }, [items.length, prevItemsLength])

  // Mouse drag for resizing
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (event: MouseEvent) => {
      const windowHeight = window.innerHeight
      const mouseY = event.clientY
      const centerY = windowHeight / 2
      const offset = mouseY - centerY
      const newHeight = drawerHeight - offset * 2
      setDrawerHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minHeight, maxHeight, drawerHeight])

  const activeItem = useMemo(() => items[activeTab], [items, activeTab])

  // Memoize handlers to prevent unnecessary re-renders
  const handleMinimize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeItem && onMinimize) {
      onMinimize(activeItem.id)
      // The parent will handle removing from taskDockItems and adding to minimizedTasks
    }
  }, [activeItem, onMinimize])

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeItem) {
      onTabClose?.(activeItem.id)
      // Close the entire dock after removing the task
      onClose?.()
    }
  }, [activeItem, onTabClose, onClose])

  if (!open || items.length === 0) {
    return null
  }

  return (
    <>
      {/* Backdrop for focus */}
      <Backdrop
        open={open && items.length > 0 && !isCollapsed}
        onClick={onClose}
        sx={{
          zIndex: 1299,
          bgcolor: alpha(theme.palette.common.black, 0.3),
        }}
      />
      
      {/* Centered Floating Window / Minimized Handle */}
      <Paper
        elevation={isCollapsed ? 4 : 12}
        sx={{
          position: 'fixed',
          top: isCollapsed ? 'auto' : '50%',
          left: isCollapsed ? { xs: 8, sm: 16, md: 24 } : '50%',
          bottom: isCollapsed ? { xs: 8, sm: 16, md: 24 } : 'auto',
          transform: isCollapsed ? 'none' : 'translate(-50%, -50%)',
          width: isCollapsed ? 'auto' : { xs: '95vw', sm: '85vw', md: '75vw', lg: '65vw' },
          height: isCollapsed ? 'auto' : { xs: `${Math.min(drawerHeight, window.innerHeight * 0.75)}px`, sm: `${Math.min(drawerHeight, window.innerHeight * 0.8)}px`, md: `${drawerHeight}px` },
          maxWidth: isCollapsed ? { xs: 300, sm: 350 } : 1200,
          maxHeight: isCollapsed ? { xs: '40vh', sm: '50vh' } : { xs: '75vh', sm: '80vh', md: '85vh' },
          minWidth: isCollapsed ? { xs: 200, sm: 250 } : 'auto',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: isCollapsed ? 2 : { xs: 2, sm: 3 },
          overflow: isCollapsed ? 'auto' : 'hidden',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: isCollapsed ? 'auto' : 'transform, width, height',
          cursor: 'default',
          zIndex: 1300,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: isCollapsed ? 3 : 12,
        }}
      >
        {/* Resize Handle - Top Edge */}
        {!isCollapsed && (
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              height: { xs: 8, sm: 6 },
              cursor: isDragging ? 'row-resize' : 'ns-resize',
              bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.3) : 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
              '&:active': {
                bgcolor: alpha(theme.palette.primary.main, 0.4),
              },
              transition: 'background-color 0.2s',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              touchAction: 'none',
            }}
          />
        )}

        {/* Minimized Task List */}
        {isCollapsed && (
          <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
              {items.length} {items.length === 1 ? 'Task' : 'Tasks'}
            </Typography>
            <Stack spacing={0.5}>
              {items.slice(0, 5).map((item, idx) => (
                <MinimizedTaskItem
                  key={item.id}
                  item={item}
                  isActive={idx === activeTab}
                  onExpand={() => {
                    setActiveTab(idx)
                    setIsCollapsed(false)
                  }}
                  onClose={onTabClose!}
                />
              ))}
              {items.length > 5 && (
                <Box
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontStyle: 'italic',
                  }}
                >
                  + {items.length - 5} more {items.length - 5 === 1 ? 'task' : 'tasks'}
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Expanded Task View Header */}
        {!isCollapsed && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.default',
              minHeight: { xs: 48, sm: 56 },
              px: { xs: 2, sm: 2.5, md: 3 },
              position: 'relative',
            }}
          >
            <Typography variant="h6" sx={{ flex: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Task Details
            </Typography>
            
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Minimize">
                <IconButton
                  size="small"
                  onClick={handleMinimize}
                  sx={{
                    color: 'text.secondary',
                    p: { xs: 0.5, sm: 0.75 },
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <MinimizeIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Close Task">
                <IconButton
                  size="small"
                  onClick={handleClose}
                  sx={{
                    color: 'text.secondary',
                    p: { xs: 0.5, sm: 0.75 },
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        )}

        {/* Content Area */}
        {!isCollapsed && activeItem && (
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              bgcolor: 'background.default',
              p: 0,
            }}
          >
            {activeItem.task ? (
              <TaskDetails task={activeItem.task} onAddNote={onAddNote} />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary',
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <OpenInNewIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  <Typography variant="body2">No details available</Typography>
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const TabbedTaskDock = memo(TabbedTaskDockComponent, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.open === nextProps.open &&
    prevProps.items.length === nextProps.items.length &&
    prevProps.items.every((item, idx) => item.id === nextProps.items[idx]?.id) &&
    prevProps.onTabClose === nextProps.onTabClose &&
    prevProps.onAddNote === nextProps.onAddNote
  )
})
