import { alpha } from '@mui/material/styles'
import { Box, Chip, Collapse, IconButton, Paper, Stack, Typography, useTheme } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import type { ReactNode } from 'react'
import { useState } from 'react'

export interface TaskDockItem {
  id: string
  title: string
  icon?: ReactNode
  subtitle?: string
}

export interface TaskDockBarProps {
  items: TaskDockItem[]
  onClick?: (id: string) => void
  onRemove?: (id: string) => void
  maxItems?: number
  defaultCollapsed?: boolean
}

export function TaskDockBar({ items, onClick, onRemove, maxItems = 5, defaultCollapsed = true }: TaskDockBarProps) {
  const theme = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const visibleItems = items.slice(0, maxItems)

  if (visibleItems.length === 0) return null

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Collapsed Header */}
      <Box
        sx={{
          px: 2,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: alpha(theme.palette.action.hover, 0.1),
          },
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Stack direction="row" alignItems="center" gap={1.5} flex={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Recent tasks ({visibleItems.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {visibleItems.slice(0, 3).map((item) => (
              <Chip
                key={item.id}
                label={
                  <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: '80px' }}>
                    {item.title}
                  </Typography>
                }
                size="small"
                sx={{
                  height: '20px',
                  bgcolor: alpha(theme.palette.background.default, 0.9),
                  color: theme.palette.text.primary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                }}
              />
            ))}
            {visibleItems.length > 3 && (
              <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
                +{visibleItems.length - 3}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton size="small" sx={{ p: 0.25 }}>
          {isCollapsed ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Expanded Content */}
      <Collapse in={!isCollapsed}>
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{ display: 'grid', gridAutoFlow: 'column', gap: 0.75, overflowX: 'auto', pb: 0.5 }}>
            {visibleItems.map((item) => (
              <Chip
                key={item.id}
                label={
                  <Typography variant="caption" fontWeight={700} noWrap>
                    {item.title}
                  </Typography>
                }
                onClick={onClick ? () => onClick(item.id) : undefined}
                onDelete={onRemove ? () => onRemove(item.id) : undefined}
                deleteIcon={<CloseRoundedIcon />}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.background.default, 0.9),
                  color: theme.palette.text.primary,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.text.primary,
                    },
                  },
                  '&:hover': {
                    bgcolor: theme.palette.background.default,
                  },
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default TaskDockBar
