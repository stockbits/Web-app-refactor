import { Box, Chip, Paper, Stack, Typography, useTheme } from '@mui/material'
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
  onDelete?: (id: string) => void // <-- add this
  maxItems?: number
  clickable?: boolean
}

export function TaskDockBar({ items, onClick, onDelete, maxItems = 5, clickable = true }: TaskDockBarProps) {
  const theme = useTheme()
  const tokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens
  const visibleItems = items.slice(0, maxItems)

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
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5} flex={1}>
          <Typography variant="caption" sx={{ color: 'text.primary' }}>
            Recent tasks ({visibleItems.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {visibleItems.slice(0, 3).map((item) => (
              <Chip
                key={item.id}
                label={
                  <Typography variant="caption" fontWeight={600} noWrap>
                    {item.title}
                  </Typography>
                }
                onClick={clickable && onClick ? () => onClick(item.id) : undefined}
                onDelete={onDelete ? () => onDelete(item.id) : undefined}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: tokens?.state.info || '#5488C7',
                  color: tokens?.state.info || '#5488C7',
                  backgroundColor: tokens?.background.alt || '#F3F4F7',
                  fontWeight: 500,
                  height: '20px',
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
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
