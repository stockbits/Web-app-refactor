import type { ElementType } from 'react'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'

export interface LandingMenuGroup {
  id: string
  label: string
  description: string
  icon: ElementType
  accessLabel: string
  cards: { name: string; description: string }[]
}

export interface LandingOverviewProps {
  groups: LandingMenuGroup[]
  totalTools: number
}

export const LandingOverview = ({ groups, totalTools }: LandingOverviewProps) => {
  return (
    <Stack gap={3}>
      <Stack gap={1}>
        <Typography variant="overline" sx={{ letterSpacing: 4, color: 'rgba(0,204,173,0.9)' }}>
          OPENREACH TASK FORCE
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          Access overview
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(245,244,245,0.85)' }}>
          Hi Jordan, you have access to {groups.length} programmes and {totalTools} tools. Use the left navigation to
          jump straight into a workspace.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
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
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(4, 11, 18, 0.35)',
                backdropFilter: 'blur(6px)',
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
                    color: '#00CCAD',
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Box flexGrow={1} minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#F5F4F5' }}>
                    {group.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(245,244,245,0.75)' }}>
                    {group.description}
                  </Typography>
                </Box>
                <Chip
                  label={group.accessLabel}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0,204,173,0.16)',
                    color: '#00CCAD',
                    border: '1px solid rgba(0,204,173,0.45)',
                    fontWeight: 600,
                  }}
                />
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
                      borderColor: 'rgba(245,244,245,0.35)',
                      color: '#F5F4F5',
                      bgcolor: 'transparent',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )
        })}
      </Box>

      <Typography variant="body2" sx={{ color: 'rgba(245,244,245,0.75)' }}>
        Tip: tap the Task Force menu icon to open navigation and move between programmes.
      </Typography>
    </Stack>
  )
}