import { useMemo, useState, useCallback } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { alpha, useTheme } from '@mui/material/styles'
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded'
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import PublicRoundedIcon from '@mui/icons-material/PublicRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import { ThemeToggleButton } from './ThemeToggleButton'
import openreachLogo from '@central-logos/Openreach-Logo-White.png'
import openreachLogoColor from '@central-logos/Openreach-Logo.jpeg'

const CLIENT_BUILD = { label: 'Client build', date: '02.01.2026' }

export interface OpenreachNavItem {
  id: string
  label: string
  icon: ReactNode
  description?: string
  badge?: string
  active?: boolean
}

export interface OpenreachSideNavProps {
  open: boolean
  onClose: () => void
  navItems?: OpenreachNavItem[]
  footerSlot?: ReactNode
  headerSlot?: ReactNode
  onSearch?: (value: string) => void
  onSelect?: (item: OpenreachNavItem) => void
}

const fallbackNavItems: OpenreachNavItem[] = [
  { id: 'resource-management', label: 'Resource Management', icon: <ManageAccountsRoundedIcon />, description: 'Manage resources, teams, and assets.' },
  { id: 'task-management', label: 'Task Management', icon: <AssignmentRoundedIcon />, description: 'Oversee and assign operational tasks.' },
  { id: 'schedule-live', label: 'Schedule Live', icon: <BoltRoundedIcon />, description: 'Monitor and adjust live schedules.' },
  { id: 'callout-overview', label: 'Callout Overview', icon: <WarningAmberRoundedIcon />, description: 'Review ongoing callout events.' },
  { id: 'general-settings', label: 'General Settings', icon: <SettingsApplicationsRoundedIcon />, description: 'System preferences and integrations.' },
]

interface TaskforceMenuChild {
  id: string
  label: string
  description: string
}

interface TaskforceMenuGroup {
  id: string
  label: string
  icon: ReactNode
  children: TaskforceMenuChild[]
}

const taskforceMenuGroups: TaskforceMenuGroup[] = [
  {
    id: 'operations-management',
    label: 'Operations Management',
    icon: <ManageAccountsRoundedIcon fontSize="small" />, 
    children: [
      { id: 'resource-management', label: 'Resource Management', description: 'Manage all available resources, teams, and assets.' },
      { id: 'task-management', label: 'Task Management', description: 'Oversee and assign operational tasks efficiently.' },
    ],
  },
  {
    id: 'operations-live',
    label: 'Live Operations',
    icon: <BoltRoundedIcon fontSize="small" />,
    children: [
      { id: 'schedule-live', label: 'Schedule Live', description: 'Monitor and adjust live schedules in real-time.' },
      { id: 'schedule-explorer', label: 'Schedule Explorer', description: 'Browse and analyse upcoming schedules and plans.' },
      { id: 'callout-overview', label: 'Callout Overview', description: 'Review all ongoing and past callout events.' },
    ],
  },
  {
    id: 'general-settings',
    label: 'General Settings',
    icon: <SettingsApplicationsRoundedIcon fontSize="small" />,
    children: [
      { id: 'system-preferences', label: 'System Preferences', description: 'Modify user-level settings, preferences, and themes.' },
      { id: 'notification-channels', label: 'Notification Channels', description: 'Configure alerting channels for teams.' },
      { id: 'theme-builder', label: 'Theme Builder', description: 'Adjust branding tokens and palettes.' },
      { id: 'api-keys', label: 'API Keys', description: 'Manage access tokens and integrations.' },
    ],
  },
  {
    id: 'task-admin',
    label: 'Task Admin',
    icon: <AssignmentRoundedIcon fontSize="small" />,
    children: [
      { id: 'task-type', label: 'Task Type', description: 'Define and manage task categories and types.' },
      { id: 'task-routing', label: 'Task Routing', description: 'Configure routing and escalation rules.' },
      { id: 'task-importance', label: 'Task Importance', description: 'Set and manage task priority levels.' },
    ],
  },
  {
    id: 'jeopardy-admin',
    label: 'Jeopardy Admin',
    icon: <WarningAmberRoundedIcon fontSize="small" />,
    children: [
      { id: 'alert-definitions', label: 'Alert Definitions', description: 'Define and manage all alert templates.' },
      { id: 'alert-actions', label: 'Alert Action Definition', description: 'Configure automated or manual alert responses.' },
      { id: 'alert-parameters', label: 'Alert Parameter Definition', description: 'Set up alert thresholds and parameters.' },
      { id: 'alert-ranking', label: 'Alert Ranking', description: 'Prioritise alerts by severity or impact.' },
      { id: 'alert-exclusion', label: 'Alert Exclusion', description: 'Manage exceptions and exclusion rules.' },
    ],
  },
  {
    id: 'resource-admin',
    label: 'Resource Admin',
    icon: <GroupsRoundedIcon fontSize="small" />,
    children: [
      { id: 'rota-day-record', label: 'Rota Day Record', description: 'Manage and track individual rota day records.' },
      { id: 'rota-week-record', label: 'Rota Week Record', description: 'Oversee weekly rota summaries and tracking.' },
      { id: 'rota-template', label: 'Rota Template Record', description: 'Design and configure rota templates.' },
      { id: 'closure-user-group', label: 'Closure User Group', description: 'Administer closure groups for specific operations.' },
      { id: 'access-restriction', label: 'Access Restriction', description: 'Set user and role-based access limitations.' },
      { id: 'personal-overtime', label: 'Personal Overtime', description: 'Monitor individual overtime records.' },
      { id: 'business-overtime', label: 'Business Overtime', description: 'Review business-wide overtime data.' },
    ],
  },
  {
    id: 'self-service-admin',
    label: 'Self Service Admin',
    icon: <BuildCircleRoundedIcon fontSize="small" />,
    children: [
      { id: 'self-selection-settings', label: 'Self Selection Settings Admin', description: 'Configure system-wide self-selection settings.' },
      { id: 'self-selection-rating', label: 'Self Selection Task Rating Admin', description: 'Manage task rating parameters.' },
      { id: 'self-selection-patch', label: 'Self Selection Patch Admin', description: 'Handle patch management for self-selection.' },
      { id: 'self-selection-worktype', label: 'Self Selection Work Type Admin', description: 'Control available work types.' },
    ],
  },
  {
    id: 'user-admin',
    label: 'User Admin',
    icon: <AdminPanelSettingsRoundedIcon fontSize="small" />,
    children: [
      { id: 'user-account', label: 'User Account', description: 'Create and manage system user accounts.' },
      { id: 'user-id', label: 'User ID', description: 'View and assign unique identification numbers.' },
      { id: 'unbar-user', label: 'Unbar User', description: 'Unblock or reinstate restricted user accounts.' },
      { id: 'user-role-profile', label: 'User Role Profile', description: 'Define user roles and associated permissions.' },
      { id: 'supervisor-password', label: 'Supervisor Change Password', description: 'Allow supervisors to reset passwords.' },
    ],
  },
  {
    id: 'domain-admin',
    label: 'Domain Admin',
    icon: <PublicRoundedIcon fontSize="small" />,
    children: [
      { id: 'domain-building', label: 'Domain Building', description: 'Configure and structure operational domains.' },
      { id: 'post-areas', label: 'Post Areas', description: 'Define post boundaries, checkpoints, and zones.' },
      { id: 'travel-areas', label: 'Travel Areas', description: 'Set travel regions and mobility zones.' },
      { id: 'asset', label: 'Asset', description: 'Manage fixed and movable assets.' },
      { id: 'workforce', label: 'Workforce', description: 'Assign and monitor domain workforce allocations.' },
      { id: 'division', label: 'Division', description: 'Oversee structural divisions.' },
    ],
  },
  {
    id: 'schedule-admin',
    label: 'Schedule Admin',
    icon: <CalendarMonthRoundedIcon fontSize="small" />,
    children: [
      { id: 'mss-admin', label: 'MSS Admin', description: 'Manage and configure the Master Schedule System.' },
      { id: 'srm-admin', label: 'SRM Admin', description: 'Administer SRM modules and permissions.' },
      { id: 'srm-audit', label: 'SRM Audit', description: 'Audit SRM changes and scheduling history.' },
    ],
  },
  {
    id: 'system-admin',
    label: 'System Admin',
    icon: <MemoryRoundedIcon fontSize="small" />,
    children: [
      { id: 'algorithm-parameters', label: 'Algorithm Parameters', description: 'Configure algorithm behaviours and weights.' },
      { id: 'system-code-editor', label: 'System Code Editor', description: 'Maintain scripts, triggers, and automation.' },
      { id: 'record-audit', label: 'Record Audit', description: 'Review detailed audit trails.' },
      { id: 'public-holiday', label: 'Public Holiday', description: 'Manage holiday dates affecting schedules.' },
      { id: 'general-travel-times', label: 'General Travel Times', description: 'Configure default travel time settings.' },
    ],
  },
]

export const OpenreachSideNav = ({ open, onClose, navItems, footerSlot, headerSlot, onSearch, onSelect }: OpenreachSideNavProps) => {
  const theme = useTheme()
  const palette = theme.openreach
  const isLightMode = theme.palette.mode === 'light'
  const navBg = isLightMode ? theme.palette.background.paper : theme.openreach.brandColors.networkNavy
  const logoSrc = isLightMode ? openreachLogoColor : openreachLogo
  const items = useMemo(() => (navItems && navItems.length > 0 ? navItems : fallbackNavItems), [navItems])
  const [query, setQuery] = useState('')
  const trimmedQuery = query.trim()
  const hasCustomItems = Boolean(navItems && navItems.length > 0)
  const showTreeResults = !hasCustomItems || Boolean(trimmedQuery)

  const submitSearch = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedQuery) return
    onSearch?.(trimmedQuery)
  }, [trimmedQuery, onSearch])

  const filteredGroups = useMemo(() => {
    if (!trimmedQuery) {
      return taskforceMenuGroups
    }
    const value = trimmedQuery.toLowerCase()
    return taskforceMenuGroups
      .map((group) => ({
        ...group,
        children: group.children.filter(
          (child) =>
            child.label.toLowerCase().includes(value) ||
            child.description.toLowerCase().includes(value)
        ),
      }))
      .filter((group) => group.children.length > 0)
  }, [trimmedQuery])

  const noMatches = showTreeResults && filteredGroups.length === 0

  const handleChildSelect = useCallback((child: TaskforceMenuChild, group: TaskforceMenuGroup) => {
    onSelect?.({
      id: child.id,
      label: child.label,
      icon: group.icon,
      description: child.description,
    })
    onClose()
  }, [onSelect, onClose])

  const footerContent = footerSlot ?? (
    <Stack gap={0.5} alignItems="stretch" sx={{ px: 2, pb: 1 }}>
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between" 
        gap={1} 
        sx={{ 
          width: '100%',
          flexWrap: 'wrap', // Allow wrapping on very small screens
        }}
      >
        <Chip
          label={CLIENT_BUILD.label}
          variant="outlined"
          sx={{
            height: 22,
            borderColor: isLightMode ? theme.openreach?.lightTokens?.state.info : theme.openreach?.darkTokens?.state.info,
            color: isLightMode ? theme.openreach?.lightTokens?.state.info : theme.openreach?.darkTokens?.state.info,
            backgroundColor: isLightMode ? theme.openreach?.lightTokens?.background.alt : theme.openreach?.darkTokens?.background.alt,
            fontWeight: 500,
            '& .MuiChip-label': {
              px: 0.75,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
            flexShrink: 0, // Prevent chip from shrinking
          }}
        />
        <Typography 
          variant="caption" 
          sx={{ 
            color: alpha(isLightMode ? theme.palette.text.secondary : palette.fibreThreads, 0.7), 
            fontWeight: 600,
            fontSize: '0.7rem', // Slightly larger for better readability
            flexShrink: 0, // Prevent date from shrinking
          }}
        >
          {CLIENT_BUILD.date}
        </Typography>
      </Stack>
      <Typography 
        variant="caption" 
        sx={{ 
          color: alpha(isLightMode ? theme.palette.text.secondary : palette.fibreThreads, 0.55),
          fontSize: '0.7rem', // Slightly larger for better readability
          lineHeight: 1.3, // Better line height
          wordBreak: 'break-word', // Prevent overflow
        }}
      >
        Last sync · 06:00 UTC
      </Typography>
    </Stack>
  )

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          backgroundColor: navBg,
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'stretch',
          p: 0,
          height: '100vh',
          maxHeight: '100vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          maxWidth: '100vw', // Prevent overflow on small screens
        },
      }}
    >
      <Box sx={{ 
        width: { xs: '90vw', sm: 320, md: 360 }, // Responsive width: 90% of viewport on mobile, fixed on larger screens
        maxWidth: { xs: 320, sm: 360 }, // Cap maximum width
        height: '100%', 
        bgcolor: navBg,
        minWidth: 280, // Minimum width to prevent too narrow on very small screens
      }}>
        <Paper
          component="nav"
          elevation={0}
          sx={{
            width: '100%',
            bgcolor: navBg,
            color: isLightMode ? theme.palette.text.primary : '#FFFFFF',
            borderRadius: 0,
            border: 'none',
            boxShadow: 'none',
            position: 'relative',
            overflow: 'hidden',
            isolation: 'isolate',
            height: '100%',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: 'none',
              opacity: 0,
              pointerEvents: 'none',
            },
          }}
        >
          <Stack sx={{ 
            p: 2, 
            gap: 2, 
            position: 'relative', 
            zIndex: 1, 
            height: '100%', 
            minHeight: 0, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden', // Prevent any overflow from the stack itself
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ minHeight: 48 }}>
              <Box sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
                {headerSlot ? (
                  headerSlot
                ) : (
                  <Box
                    component="img"
                    src={logoSrc}
                    alt="Openreach brand mark"
                    sx={{ width: 132, height: 'auto', display: 'block', filter: isLightMode ? 'none' : 'drop-shadow(0 4px 18px rgba(0,0,0,0.35))' }}
                  />
                )}
              </Box>

              <Tooltip title="Close navigation">
                <IconButton
                  aria-label="Close navigation"
                  onClick={onClose}
                  sx={{
                    color: isLightMode ? theme.palette.text.primary : palette.energyAccent,
                    '&:hover': { color: isLightMode ? theme.palette.primary.main : palette.energyAccent, opacity: 0.8 },
                    alignSelf: 'center',
                    width: 40,
                    height: 40,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack
              component="form"
              direction="row"
              onSubmit={submitSearch}
              alignItems="center"
              sx={{
                bgcolor: isLightMode ? theme.palette.background.paper : alpha(palette.energyAccent, 0.12),
                border: `1px solid ${isLightMode ? theme.palette.divider : alpha(palette.energyAccent, 0.35)}`,
                boxShadow: isLightMode ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.18)}` : `0 0 0 1px ${alpha(palette.energyAccent, 0.18)}`,
                borderRadius: theme.shape.borderRadius,
                px: 2,
                py: 0.5,
                transition: 'border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
                '&:focus-within': {
                  borderColor: isLightMode ? theme.palette.primary.main : palette.energyAccent,
                  boxShadow: isLightMode ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.24)}` : `0 0 0 2px ${alpha(palette.energyAccent, 0.24)}`,
                  bgcolor: isLightMode ? theme.palette.background.paper : alpha(palette.energyAccent, 0.16),
                },
              }}
            >
              <SearchRoundedIcon fontSize="small" sx={{ color: palette.energyAccent }} />
              <InputBase
                placeholder="Search menu and tools"
                value={query}
                sx={{ ml: 1, color: isLightMode ? theme.palette.text.primary : palette.fibreThreads, width: '100%' }}
                onChange={(event) => setQuery(event.target.value)}
                inputProps={{ 'aria-label': 'Search Openreach workspace' }}
              />
              {trimmedQuery && (
                <IconButton
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  sx={{ color: isLightMode ? theme.palette.text.secondary : palette.energyAccent, ml: 1 }}
                >
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              pr: 0.5, 
              minHeight: 0,
              pb: 2, // Add bottom padding to ensure content doesn't touch footer
            }}>
              {!showTreeResults && (
                <List component="div" disablePadding>
                  {items.map((item) => (
                    <ListItemButton
                      key={item.id}
                      onClick={() => {
                        onSelect?.(item)
                        onClose()
                      }}
                      sx={{
                        mb: 0.5,
                        borderRadius: 0,
                        px: 1.5,
                        py: 1,
                        color: isLightMode ? theme.palette.text.primary : palette.fibreThreads,
                        '&:hover': {
                          bgcolor: alpha(isLightMode ? theme.palette.primary.main : palette.energyAccent, 0.16),
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: palette.energyAccent,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.description}
                        primaryTypographyProps={{ fontWeight: 600, color: isLightMode ? theme.palette.text.primary : palette.fibreThreads }}
                        secondaryTypographyProps={{ color: alpha(isLightMode ? theme.palette.text.secondary : palette.fibreThreads, 0.75) }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          sx={{
                            ml: 1,
                            borderColor: isLightMode ? theme.openreach?.lightTokens?.state.info : theme.openreach?.darkTokens?.state.info,
                            color: isLightMode ? theme.openreach?.lightTokens?.state.info : theme.openreach?.darkTokens?.state.info,
                            backgroundColor: isLightMode ? theme.openreach?.lightTokens?.background.alt : theme.openreach?.darkTokens?.background.alt,
                            fontWeight: 500,
                          }}
                        />
                      )}
                    </ListItemButton>
                  ))}
                </List>
              )}

              {showTreeResults && (
                <Stack gap={2}>
                  {noMatches && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: alpha(isLightMode ? theme.palette.text.secondary : palette.fibreThreads, 0.8),
                        textAlign: 'center',
                        py: 4,
                      }}
                    >
                      No menus match “{trimmedQuery}”. Try another term.
                    </Typography>
                  )}
                  {filteredGroups.map((group, index) => (
                    <Box key={group.id}>
                      {/* Group Header */}
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        gap={1.5} 
                        sx={{ 
                          mb: 1.25,
                          pl: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(palette.energyAccent, 0.12),
                            color: palette.energyAccent,
                            flexShrink: 0,
                          }}
                        >
                          {group.icon}
                        </Box>
                        <Typography 
                          variant="overline" 
                          fontWeight={700} 
                          sx={{ 
                            letterSpacing: 0.75,
                            color: isLightMode ? theme.palette.text.primary : palette.fibreThreads,
                            fontSize: '0.7rem',
                            lineHeight: 1.2,
                          }}
                        >
                          {group.label}
                        </Typography>
                      </Stack>

                      {/* Child Menu Items */}
                      <List disablePadding>
                        {group.children.map((child) => (
                          <ListItemButton
                            key={child.id}
                            onClick={() => handleChildSelect(child, group)}
                            sx={{
                              borderRadius: 1.5,
                              mb: 0.75,
                              pl: 2,
                              pr: 1.5,
                              py: 1.25,
                              alignItems: 'flex-start',
                              color: isLightMode ? theme.palette.text.primary : palette.fibreThreads,
                              border: `1px solid ${alpha(isLightMode ? theme.palette.divider : palette.energyAccent, 0.2)}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: alpha(isLightMode ? theme.palette.primary.main : palette.energyAccent, 0.12),
                                borderColor: isLightMode ? theme.palette.primary.main : palette.energyAccent,
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 24,
                                mt: 0.25,
                                color: isLightMode ? theme.palette.primary.main : palette.energyAccent,
                              }}
                            >
                              <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              secondary={child.description}
                              primaryTypographyProps={{ 
                                fontWeight: 600, 
                                fontSize: '0.9rem',
                                color: isLightMode ? theme.palette.text.primary : palette.fibreThreads,
                                lineHeight: 1.4,
                              }}
                              secondaryTypographyProps={{ 
                                color: alpha(isLightMode ? theme.palette.text.secondary : palette.fibreThreads, 0.75),
                                fontSize: '0.8125rem',
                                lineHeight: 1.5,
                                mt: 0.25,
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>

                      {index < filteredGroups.length - 1 && (
                        <Divider 
                          sx={{ 
                            my: 2.5, 
                            borderColor: alpha(isLightMode ? theme.palette.divider : palette.energyAccent, 0.2) 
                          }} 
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Theme Toggle Button */}
            <Box
              sx={{
                mt: 'auto',
                pt: 2,
                pb: 1.5,
                px: 2,
                display: 'flex',
                justifyContent: 'center',
                bgcolor: navBg,
              }}
            >
              <ThemeToggleButton />
            </Box>

            {footerContent && (
              <Box
                sx={{
                  mt: 'auto',
                  pt: 1.75,
                  pb: { xs: 'max(env(safe-area-inset-bottom, 16px), 16px)', sm: 'env(safe-area-inset-bottom, 0px)' }, // Ensure minimum padding on mobile
                  pl: 'env(safe-area-inset-left, 0px)',
                  pr: 'env(safe-area-inset-right, 0px)',
                  position: 'relative', // Changed from sticky to relative for better mobile compatibility
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  bgcolor: navBg,
                  zIndex: 2,
                  flexShrink: 0, // Prevent footer from shrinking
                }}
              >
                <Divider sx={{ mb: 1, borderColor: alpha(isLightMode ? theme.palette.divider : palette.energyAccent, 0.2) }} />
                {footerContent}
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
    </Drawer>
  )
}
