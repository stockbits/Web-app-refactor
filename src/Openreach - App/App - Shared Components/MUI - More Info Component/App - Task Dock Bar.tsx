import { Box, Chip, Paper, Stack, Typography, useTheme, Button, Tooltip } from '@mui/material'
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
  maxItems = 3, 
  clickable = true 
}: TaskDockBarProps) {
  const theme = useTheme()
  const tokens = useMemo(() => theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens, [theme.palette.mode, theme.openreach])
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

  if (visibleItems.length === 0) return null

  return (
    <Paper
      elevation={1}
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" gap={4} flex={1} sx={{ mr: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.primary' }}>
            Recent tasks ({items.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', overflow: 'visible', px: 0.5, py: 0.25 }}>
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
                      <Typography variant="caption" fontWeight={600} noWrap>
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
                      height: '24px',
                      '& .MuiChip-label': {
                        px: 1,
                      },
                      cursor: clickable || multiSelect ? 'pointer' : 'default',
                      opacity: clickable || multiSelect ? 1 : 0.6,
                      transition: 'all 0.1s ease-in-out',
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
                    }}
                  />
                </Tooltip>
              )
            })}
            {items.length > maxItems && (
              <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
                +{items.length - maxItems}
              </Typography>
            )}
          </Box>
        </Stack>
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
