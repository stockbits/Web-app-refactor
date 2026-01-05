import type { ElementType } from 'react'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'

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
                borderRadius: 3,
                border: '1px solid rgba(7,59,76,0.12)',
                backgroundColor: '#ffffff',
                boxShadow: '0 12px 32px rgba(4, 26, 40, 0.08)',
              }}
            >
              <Stack direction="row" gap={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    backgroundColor: 'rgba(0,204,173,0.12)',
                    color: '#037971',
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Box flexGrow={1} minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#042432' }}>
                    {group.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(4, 26, 40, 0.65)' }}>
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
                      borderColor: 'rgba(7,59,76,0.18)',
                      color: '#073B4C',
                      bgcolor: 'rgba(7,59,76,0.04)',
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