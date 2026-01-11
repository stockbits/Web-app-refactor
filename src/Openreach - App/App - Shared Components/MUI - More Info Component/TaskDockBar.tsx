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
}

export function TaskDockBar({ items, onClick, onRemove, maxItems = 5 }: TaskDockBarProps) {
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
        px: 2,
        py: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
        <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5 }}>
          Recent tasks
        </Typography>
        <Box sx={{ display: 'grid', gridAutoFlow: 'column', gap: 0.75 }}>
          {visibleItems.map((item) => (
            <Chip
              key={item.id}
              icon={item.icon as React.ReactElement}
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
              }}
            />
          ))}
        </Box>
      </Stack>
    </Paper>
  )
}

export default TaskDockBar
