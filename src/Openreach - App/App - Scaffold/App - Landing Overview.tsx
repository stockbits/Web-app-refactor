import type { ElementType } from 'react'
import { useState, useMemo } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { STANDARD_INPUT_PROPS, searchTextFieldSx } from '../../AppCentralTheme/input-config.ts'

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
  infoIconOpen?: boolean
  onInfoIconClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  infoIconId?: string
}

export const LandingOverview = ({ 
  groups, 
  onToolClick,
  onInfoIconClick,
  infoIconId
}: LandingOverviewProps) => {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false)

  // Filter groups and tools based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups

    const query = searchQuery.toLowerCase()
    return groups
      .map((group) => ({
        ...group,
        cards: group.cards.filter(
          (tool) =>
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query)
        ),
      }))
      .filter(
        (group) =>
          group.cards.length > 0 ||
          group.label.toLowerCase().includes(query) ||
          group.description.toLowerCase().includes(query)
      )
  }, [groups, searchQuery])

  const handleAccordionChange = (panelId: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panelId : false)
  }

  const totalTools = groups.reduce((sum, group) => sum + group.cards.length, 0)

  return (
    <Stack
      component="section"
      role="region"
      aria-label="Toolkit Access Overview"
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'background.default',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 3.5 },
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                Access Overview
              </Typography>
              
              {/* Info Icon */}
              <Tooltip title="View help" placement="right">
                <IconButton
                  size="small"
                  aria-label="Info: landing page help"
                  onClick={onInfoIconClick}
                  aria-describedby={infoIconId}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                    },
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Stack>
            
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.9375rem',
                lineHeight: 1.5,
              }}
            >
              {groups.length} {groups.length === 1 ? 'toolkit' : 'toolkits'} · {totalTools} {totalTools === 1 ? 'tool' : 'tools'} available
            </Typography>
          </Box>

          {/* Search */}
          <TextField
            {...STANDARD_INPUT_PROPS}
            fullWidth
            placeholder="Search toolkits and tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              ...searchTextFieldSx,
              maxWidth: 500,
            }}
          />
        </Stack>
      </Box>

      {/* Toolkit Accordions */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, sm: 4 } }}>
        {filteredGroups.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No toolkits or tools match your search.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {filteredGroups.map((group) => {
              const GroupIcon = group.icon
              const isExpanded = expandedPanel === group.id

              return (
                <Accordion
                  key={group.id}
                  expanded={isExpanded}
                  onChange={handleAccordionChange(group.id)}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: '8px !important',
                    bgcolor: 'background.paper',
                    '&:before': { display: 'none' },
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      px: 3,
                      py: 1.5,
                      '& .MuiAccordionSummary-content': {
                        my: 1.5,
                      },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <GroupIcon sx={{ fontSize: 22 }} />
                      </Box>
                      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                          <Typography
                            variant="h6"
                            component="h2"
                            fontWeight={600}
                            sx={{
                              color: 'text.primary',
                              fontSize: '1.0625rem',
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
                          <Chip
                            label={`${group.cards.length} ${group.cards.length === 1 ? 'tool' : 'tools'}`}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              bgcolor: alpha(theme.palette.text.primary, 0.06),
                              color: 'text.secondary',
                              border: 'none',
                            }}
                          />
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
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 2.5, pt: 0 }}>
                    <Stack spacing={1}>
                      {group.cards.map((tool) => (
                        <Paper
                          key={tool.name}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 1.5,
                            bgcolor: 'background.default',
                            borderColor: 'divider',
                            transition: 'all 0.15s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                sx={{
                                  color: 'text.primary',
                                  fontSize: '0.9375rem',
                                }}
                              >
                                {tool.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.8125rem',
                                  lineHeight: 1.5,
                                }}
                              >
                                {tool.description}
                              </Typography>
                            </Stack>
                            <Button
                              variant="outlined"
                              size="small"
                              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                              onClick={(e) => {
                                e.stopPropagation()
                                onToolClick?.(group.id, tool.name)
                              }}
                              sx={{
                                flexShrink: 0,
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 2,
                                py: 0.75,
                                fontSize: '0.8125rem',
                              }}
                            >
                              Open
                            </Button>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </Box>
        )}
      </Box>
    </Stack>
  )
}