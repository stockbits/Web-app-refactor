import type { ElementType } from 'react'
import { Box, Chip, Paper, Stack, Typography, useTheme } from '@mui/material'

export interface LandingMenuGroup {
  id: string
  label: string
  description: string
  icon: ElementType
  cards: { name: string; description: string }[]
}

export interface LandingOverviewProps {
  groups: LandingMenuGroup[]
}

export const LandingOverview = ({ groups }: LandingOverviewProps) => {
  const theme = useTheme()
  const tokens = theme.palette.mode === 'dark' ? theme.openreach.darkTokens : theme.openreach.lightTokens

  return (
    <Stack gap={2.5}>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {groups.map((group) => {
          const Icon = group.icon
          return (
            <Paper
              key={group.id}
              component="section"
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 0,
                border: `1px solid ${tokens.border.soft}`,
                backgroundColor: tokens.background.paper,
                boxShadow: `0 12px 32px ${tokens.background.overlay}`,
              }}
            >
              <Stack direction="row" gap={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    display: 'grid',
                    placeItems: 'center',
                    color: theme.palette.primary.main,
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Box flexGrow={1} minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: tokens.text.primary }}>
                    {group.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokens.text.secondary }}>
                    {group.description}
                  </Typography>
                </Box>
              </Stack>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mt: 1.5,
                }}
              >
                {group.cards.map((card) => (
                  <Chip
                    key={card.name}
                    label={card.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: tokens.success.main,
                      color: tokens.success.main,
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )
        })}
      </Box>

    </Stack>
  )
}