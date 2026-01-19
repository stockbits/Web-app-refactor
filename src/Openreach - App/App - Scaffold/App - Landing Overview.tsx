import type { ElementType } from 'react'
import { useState } from 'react'
import { Box, Paper, Typography, useTheme, Tabs, Tab } from '@mui/material'

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
  const tokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens
  const [selectedTab, setSelectedTab] = useState(0)

  const selectedGroup = groups[selectedTab]

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: '100%', 
        height: '100%',
        bgcolor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        p: { xs: 2, sm: 3 }
      }}
    >
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: { xs: 2, sm: 3 },
          '& .MuiTab-root': {
            minHeight: { xs: 40, sm: 48 },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 1.5, sm: 2 },
          }
        }}
      >
        {groups.map((group) => {
          const Icon = group.icon
          return (
            <Tab
              key={group.id}
              icon={<Icon fontSize="small" />}
              iconPosition="start"
              label={group.label}
              sx={{
                minHeight: { xs: 40, sm: 48 },
                px: { xs: 1.5, sm: 2 },
                '& .MuiTab-iconWrapper': {
                  mr: 1,
                }
              }}
            />
          )
        })}
      </Tabs>

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: { xs: 3, sm: 4 }, 
          height: { xs: 'auto', md: 'calc(100% - 80px)' },
          minHeight: { xs: 'calc(100vh - 200px)', md: 'auto' }
        }}
      >
        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, sm: 4 }, flexWrap: 'wrap' }}>
            <Box
              sx={{
                width: { xs: 64, sm: 72 },
                height: { xs: 64, sm: 72 },
                display: 'grid',
                placeItems: 'center',
                color: theme.palette.primary.main,
                mr: { xs: 3, sm: 4 },
                flexShrink: 0,
              }}
            >
              <selectedGroup.icon sx={{ fontSize: { xs: 32, sm: 40 } }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography 
                variant="h4" 
                fontWeight={600} 
                sx={{ 
                  color: tokens.text.primary, 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2.125rem' }
                }}
              >
                {selectedGroup.label}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: tokens.text.secondary, 
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  lineHeight: 1.5
                }}
              >
                {selectedGroup.description}
              </Typography>
            </Box>
          </Box>

          {/* Tools Section */}
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              sx={{ 
                color: tokens.text.primary, 
                mb: 3,
                fontSize: { xs: '1.125rem', sm: '1.25rem' }
              }}
            >
              Available Tools
            </Typography>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              {selectedGroup.cards.map((tool) => (
                <Paper
                  key={tool.name}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    bgcolor: theme.palette.background.paper,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      elevation: 1,
                      borderColor: theme.palette.primary.main + '40',
                    }
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={600} 
                    sx={{ 
                      color: tokens.text.primary, 
                      mb: 1,
                      fontSize: { xs: '1rem', sm: '1.125rem' }
                    }}
                  >
                    {tool.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: tokens.text.secondary, 
                      lineHeight: 1.5,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {tool.description}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}