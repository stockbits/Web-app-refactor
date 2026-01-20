import type { ElementType } from 'react'
import { Box, Card, CardActionArea, Chip, Divider, Grid, Stack, Typography, useTheme, alpha } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'

export interface LandingMenuGroup {
  id: string
  label: string
  description: string
  icon: ElementType
  accessLabel?: string
  cards: { name: string; description: string }[]
}

export interface LandingOverviewProps {
  groups: LandingMenuGroup[]
  onToolClick?: (groupId: string, toolName: string) => void
}

export const LandingOverview = ({ groups, onToolClick }: LandingOverviewProps) => {
  const theme = useTheme()

  // Calculate total tools count
  const totalTools = groups.reduce((sum, group) => sum + group.cards.length, 0)

  return (
    <Stack 
      component="section"
      role="region"
      aria-label="Task Force Dashboard"
      sx={{ 
        width: '100%', 
        height: '100%',
        bgcolor: 'background.default',
        overflow: 'auto',
      }}
    >
      {/* Dashboard Header */}
      <Box 
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, sm: 3.5 },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <DashboardRoundedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="h4" 
              component="h1"
              fontWeight={700} 
              sx={{ 
                color: 'text.primary',
                fontSize: { xs: '1.5rem', sm: '2rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Toolkit Overview
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.9375rem',
                lineHeight: 1.5,
              }}
            >
              Your complete operational toolkit across {groups.length} categories and {totalTools} tools
            </Typography>
          </Stack>
        </Stack>

        {/* Quick Stats */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
        >
          {groups.slice(0, 3).map((group) => (
            <Box key={group.id} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                {group.label}
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                {group.cards.length} {group.cards.length === 1 ? 'tool' : 'tools'}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Tool Categories Grid */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, sm: 4 } }}>
        <Stack spacing={5}>
          {groups.map((group, groupIndex) => {
            const GroupIcon = group.icon
            return (
              <Box key={group.id} component="article" aria-labelledby={`group-${group.id}-title`}>
                {/* Category Header */}
                <Stack 
                  direction="row" 
                  spacing={2} 
                  alignItems="center"
                  sx={{ mb: 2.5 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                      <Typography 
                        id={`group-${group.id}-title`}
                        variant="h6" 
                        component="h2"
                        fontWeight={700} 
                        sx={{ 
                          color: 'text.primary',
                          fontSize: '1.125rem',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {group.label}
                      </Typography>
                      {group.accessLabel && (
                        <Chip 
                          label={group.accessLabel} 
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: 'success.dark',
                            border: 'none',
                          }}
                        />
                      )}
                    </Stack>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {group.description}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Tool Cards Grid */}
                <Grid container spacing={2}>
                  {group.cards.map((tool) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tool.name}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          borderRadius: 2,
                          borderColor: 'divider',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            bgcolor: 'primary.main',
                            transform: 'scaleX(0)',
                            transformOrigin: 'left',
                            transition: 'transform 0.2s ease-in-out',
                          },
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                            transform: 'translateY(-2px)',
                            '&::before': {
                              transform: 'scaleX(1)',
                            },
                            '& .tool-arrow': {
                              opacity: 1,
                              transform: 'translateX(4px)',
                            },
                          },
                          '&:active': {
                            transform: 'translateY(0)',
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() => onToolClick?.(group.id, tool.name)}
                          sx={{ 
                            height: '100%',
                            p: 2.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                          }}
                        >
                          <Stack spacing={1.5} sx={{ width: '100%' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Typography 
                                variant="subtitle1" 
                                component="h3"
                                fontWeight={600} 
                                sx={{ 
                                  color: 'text.primary',
                                  fontSize: '1rem',
                                  lineHeight: 1.4,
                                  pr: 1,
                                  flex: 1,
                                }}
                              >
                                {tool.name}
                              </Typography>
                              <ArrowForwardIcon 
                                className="tool-arrow"
                                sx={{ 
                                  fontSize: 18,
                                  color: 'primary.main',
                                  opacity: 0,
                                  transition: 'all 0.2s',
                                  flexShrink: 0,
                                }} 
                              />
                            </Stack>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'text.secondary',
                                lineHeight: 1.6,
                                fontSize: '0.875rem',
                              }}
                            >
                              {tool.description}
                            </Typography>
                          </Stack>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Divider between categories (except last) */}
                {groupIndex < groups.length - 1 && (
                  <Divider sx={{ mt: 5, borderColor: alpha(theme.palette.divider, 0.6) }} />
                )}
              </Box>
            )
          })}
        </Stack>
      </Box>
    </Stack>
  )
}