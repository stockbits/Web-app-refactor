import { Box, Chip, Typography, Button, Tooltip, IconButton } from '@mui/material'
import CompareIcon from '@mui/icons-material/Compare'
import CloseIcon from '@mui/icons-material/Close'
import { useCallback, memo, useMemo } from 'react'
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

export interface TaskDockBarProps {
  items: TaskDockItem[]
  minimizedTasks?: MinimizedTaskItem[]
  onClick?: (id: string) => void
  onDelete?: (id: string) => void
  onMinimizedTaskClick?: (task: TaskTableRow) => void
  onMinimizedTaskRemove?: (taskId: string) => void
  onCompare?: (selectedIds: string[]) => void
  selectedItems?: string[]
  onSelectionChange?: (selected: string[]) => void
  multiSelect?: boolean
  maxItems?: number
  clickable?: boolean
}

export const TaskDockBar = memo(function TaskDockBar({ 
  items, 
  minimizedTasks = [],
  onClick, 
  onDelete, 
  onMinimizedTaskClick,
  onMinimizedTaskRemove,
  onCompare,
  selectedItems = [],
  onSelectionChange,
  multiSelect = false,
  maxItems: propMaxItems, 
  clickable = true 
}: TaskDockBarProps) {
  const maxItems = propMaxItems || 5
  const visibleItems = useMemo(() => items.slice(0, maxItems), [items, maxItems])

  const handleChipClick = useCallback((id: string) => {
    if (multiSelect && onSelectionChange) {
      const isSelected = selectedItems.includes(id)
      const newSelected = isSelected
        ? selectedItems.filter(itemId => itemId !== id)
        : [...selectedItems, id]
      onSelectionChange(newSelected)
    } else if (clickable && onClick) {
      onClick(id)
    }
  }, [multiSelect, onSelectionChange, selectedItems, clickable, onClick])

  const handleCompare = useCallback(() => {
    if (onCompare && selectedItems.length > 1) {
      onCompare(selectedItems)
    }
  }, [onCompare, selectedItems])

  if (visibleItems.length === 0 && minimizedTasks.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          px: 3,
          py: 1,
          bgcolor: 'background.paper'
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary', 
            textAlign: 'center',
          }}
        >
          Recent tasks will appear here
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
        px: 3,
        py: 1,
        bgcolor: 'background.paper'
      }}
    >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
          {/* Recent Tasks Row */}
          {visibleItems.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              >
                Recent Tasks ({items.length})
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap', 
                  alignItems: 'center',
                }}
              >
              {visibleItems.map((item) => {
                const isSelected = selectedItems.includes(item.id)
                return (
                  <Tooltip 
                    key={item.id} 
                    title={multiSelect ? (isSelected ? 'Deselect task' : 'Select task for comparison') : 'Open task details'}
                    placement="top"
                  >
                    <Chip
                      label={
                        <Typography 
                          variant="caption" 
                          fontWeight={500} 
                          noWrap
                          sx={{
                            fontSize: '0.75rem',
                          }}
                        >
                          {item.title}
                        </Typography>
                      }
                      onClick={() => handleChipClick(item.id)}
                      onDelete={onDelete ? () => onDelete(item.id) : undefined}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{
                        height: '28px',
                        borderColor: 'divider',
                        backgroundColor: 'transparent',
                        '& .MuiChip-label': {
                          px: 1,
                          color: 'text.primary',
                        },
                        '& .MuiChip-deleteIcon': {
                          fontSize: '0.875rem',
                          color: 'text.secondary',
                        },
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderColor: 'primary.main',
                        },
                        cursor: clickable || multiSelect ? 'pointer' : 'default',
                      }}
                    />
                  </Tooltip>
                )
              })}
              {items.length > maxItems && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontWeight: 500,
                  }}
                >
                  +{items.length - maxItems}
                </Typography>
              )}
            </Box>
          </Box>
          )}

          {/* Minimized Tasks Row */}
          {minimizedTasks.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                }}
              >
                Minimized ({minimizedTasks.length}):
              </Typography>
              {minimizedTasks.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    borderRadius: 'inherit',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => onMinimizedTaskClick?.(item.task)}
                >
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {item.task.taskId}
                  </Typography>
                  <Tooltip title="Remove from minimized">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMinimizedTaskRemove?.(item.id)
                      }}
                      sx={{
                        p: 0.25,
                        '&:hover': {
                          bgcolor: 'action.selected'
                        }
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {multiSelect && (
          <Tooltip title={selectedItems.length > 1 ? "Compare selected tasks side by side" : "Select at least 2 tasks to compare"} placement="top">
            <span>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<CompareIcon />}
                onClick={handleCompare}
                disabled={selectedItems.length < 2}
                sx={{ minHeight: '28px', fontSize: '0.75rem' }}
              >
                Compare ({selectedItems.length})
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>
  )
})
