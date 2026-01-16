import { alpha } from '@mui/material/styles'
import { Box, Chip, Paper, Stack, Typography, useTheme } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
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
  onRemove?: (id: string) => void
  maxItems?: number
  clickable?: boolean
}

export function TaskDockBar({ items, onClick, onRemove, maxItems = 5, clickable = true }: TaskDockBarProps) {
  const theme = useTheme()
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
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5} flex={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Recent tasks ({visibleItems.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {visibleItems.slice(0, 3).map((item) => (
              <Chip
                key={item.id}
                icon={item.icon as React.ReactElement}
                label={
                  <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: '80px' }}>
                    {item.title}
                  </Typography>
                }
                onClick={clickable && onClick ? () => onClick(item.id) : undefined}
                onDelete={onRemove ? () => onRemove(item.id) : undefined}
                deleteIcon={<CloseRoundedIcon />}
                size="small"
                sx={{
                  height: '20px',
                  bgcolor: clickable 
                    ? alpha(theme.palette.background.default, 0.9)
                    : alpha(theme.palette.action.disabledBackground, 0.5),
                  color: clickable 
                    ? theme.palette.text.primary
                    : theme.palette.text.disabled,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.text.secondary,
                    fontSize: '12px',
                    '&:hover': {
                      color: theme.palette.text.primary,
                    },
                  },
                  '&:hover': clickable ? {
                    bgcolor: theme.palette.background.default,
                  } : undefined,
                  cursor: clickable && onClick ? 'pointer' : 'default',
                  opacity: clickable ? 1 : 0.6,
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
      </Box>
    </Paper>
  )
}

export default TaskDockBar
