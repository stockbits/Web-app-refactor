import type { ElementType } from 'react'
import type { MouseEvent } from 'react'
import { useState } from 'react'
import { Box, Chip, IconButton, Paper, Popover, Stack, Typography } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

export interface LandingMenuGroup {
  id: string
  label: string
  description: string
  icon: ElementType
  cards: { name: string; description: string }[]
}

export interface LandingOverviewProps {
  groups: LandingMenuGroup[]
  totalTools: number
}

export const LandingOverview = ({ groups, totalTools }: LandingOverviewProps) => {
  const [infoAnchor, setInfoAnchor] = useState<HTMLElement | null>(null)
  const infoOpen = Boolean(infoAnchor)

  const handleInfoToggle = (event: MouseEvent<HTMLButtonElement>) => {
    setInfoAnchor((prev) => (prev ? null : event.currentTarget))
  }

  const handleInfoClose = () => setInfoAnchor(null)

  return (
    <Stack gap={2.5}>
      <Stack gap={0.5}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center',
            color: '#037971',
          }}
        >
          <Typography
            variant="overline"
            sx={{ letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, color: '#037971' }}
          >
            Access summary
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            • {groups.length} programmes · {totalTools} tools ready to launch
          </Typography>
          <IconButton
            size="small"
            color="inherit"
            aria-label="Show access tip"
            onClick={handleInfoToggle}
            aria-describedby={infoOpen ? 'access-summary-tip' : undefined}
            sx={{ ml: { xs: 0, sm: 1 }, p: 0.25 }}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
        <Popover
          id="access-summary-tip"
          open={infoOpen}
          anchorEl={infoAnchor}
          onClose={handleInfoClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          disableRestoreFocus
          slotProps={{
            paper: {
              sx: {
                px: 2,
                py: 1.5,
                borderRadius: 2,
                maxWidth: 320,
                boxShadow: '0 20px 40px rgba(4, 26, 40, 0.25)',
              },
            },
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(4, 26, 40, 0.85)' }}>
            Tap the menu icon to open the navigation and move between tools.
          </Typography>
        </Popover>
      </Stack>

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