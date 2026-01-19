import { Box, Chip, Paper, Typography, useTheme, Button, Tooltip, useMediaQuery } from '@mui/material'
import CompareIcon from '@mui/icons-material/Compare'
import { useCallback, memo, useMemo } from 'react'
import type { ReactNode } from 'react'

export interface TaskDockItem {
  id: string
  title: string
  icon?: ReactNode
  subtitle?: string
}

export interface TaskDockBarProps {
  items: TaskDockItem[]
  onClick?: (id: string) => void
  onDelete?: (id: string) => void
  onCompare?: (selectedIds: string[]) => void
  selectedItems?: string[]
  onSelectionChange?: (selected: string[]) => void
  multiSelect?: boolean
  maxItems?: number
  clickable?: boolean
}

export const TaskDockBar = memo(function TaskDockBar({ 
  items, 
  onClick, 
  onDelete, 
  onCompare,
  selectedItems = [],
  onSelectionChange,
  multiSelect = false,
  maxItems: propMaxItems, 
  clickable = true 
}: TaskDockBarProps) {
  const theme = useTheme()
  const tokens = useMemo(() => theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens, [theme.palette.mode, theme.openreach])
  
  // Responsive max items: 2 on mobile, 3 on desktop
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const maxItems = propMaxItems || (isMobile ? 2 : 3)
  
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

  if (visibleItems.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: 'none',
          boxShadow: 'none',
          bgcolor: 'transparent',
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1, sm: 1.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: '40px', sm: '32px' },
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary', 
              fontStyle: 'italic',
              textAlign: 'center',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              lineHeight: 1.4,
            }}
          >
            Task dock - minimized task dialogs will appear here
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: 'none',
        boxShadow: 'none',
        bgcolor: 'transparent',
      }}
    >
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1, sm: 1 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '0.9rem' },
            mb: { xs: 0.5, sm: 0 },
          }}
        >
          Recent Tab ({items.length})
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 }, 
            flexWrap: { xs: 'wrap', sm: 'nowrap' }, 
            overflow: { xs: 'visible', sm: 'visible' }, 
            px: { xs: 0, sm: 0.5 }, 
            py: { xs: 0, sm: 0.25 },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-start' },
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
                        fontWeight={600} 
                        noWrap
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    onClick={() => handleChipClick(item.id)}
                    onDelete={onDelete ? () => onDelete(item.id) : undefined}
                    size="small"
                    variant={isSelected ? "filled" : "outlined"}
                    sx={{
                      borderColor: isSelected 
                        ? (tokens?.state.success || '#4CAF50')
                        : (tokens?.state.info || '#5488C7'),
                      color: isSelected 
                        ? theme.palette.getContrastText(tokens?.state.success || '#4CAF50')
                        : (tokens?.state.info || '#5488C7'),
                      backgroundColor: isSelected 
                        ? (tokens?.state.success || '#4CAF50')
                        : (tokens?.background.alt || '#F3F4F7'),
                      fontWeight: 500,
                      height: { xs: '32px', sm: '24px' }, // Larger touch target on mobile
                      minHeight: { xs: '32px', sm: '24px' },
                      '& .MuiChip-label': {
                        px: { xs: 1.5, sm: 1 },
                      },
                      '& .MuiChip-deleteIcon': {
                        fontSize: { xs: '1rem', sm: '0.875rem' },
                        width: { xs: '20px', sm: '16px' },
                        height: { xs: '20px', sm: '16px' },
                        color: isSelected 
                          ? theme.palette.getContrastText(tokens?.state.success || '#4CAF50')
                          : (tokens?.state.info || '#5488C7'),
                        transition: 'none', // Prevent color transitions on delete icon
                        '&:hover': {
                          color: isSelected 
                            ? theme.palette.getContrastText(tokens?.state.success || '#4CAF50')
                            : (tokens?.state.info || '#5488C7'),
                          opacity: 0.8,
                        },
                        '&:active': {
                          color: isSelected 
                            ? theme.palette.getContrastText(tokens?.state.success || '#4CAF50')
                            : (tokens?.state.info || '#5488C7'),
                          opacity: 0.6,
                        },
                      },
                      cursor: clickable || multiSelect ? 'pointer' : 'default',
                      opacity: clickable || multiSelect ? 1 : 0.6,
                      transition: 'background-color 0.1s ease-in-out, transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
                      '&:hover': {
                        backgroundColor: isSelected 
                          ? theme.palette.action.hover
                          : theme.palette.action.selected,
                        transform: clickable || multiSelect ? 'scale(1.01)' : 'none',
                      },
                      '&:active': {
                        transform: clickable || multiSelect ? 'scale(0.98)' : 'none',
                        transition: 'transform 0.05s ease-in-out',
                      },
                      // Prevent any inherited transitions that might affect delete icon
                      '& *': {
                        transition: 'none',
                      },
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
                  alignSelf: 'center',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  fontWeight: 500,
                }}
              >
                +{items.length - maxItems}
              </Typography>
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
                sx={{ minHeight: '24px', fontSize: '0.75rem' }}
              >
                Compare ({selectedItems.length})
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>
    </Paper>
  )
})
