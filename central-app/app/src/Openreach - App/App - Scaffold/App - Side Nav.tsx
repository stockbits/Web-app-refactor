import { useMemo, useState } from 'react'
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
import openreachLogo from '@central-logos/Openreach-Logo-White.png'

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

interface TaskForceMenuChild {
  id: string
  label: string
  description: string
}

interface TaskForceMenuGroup {
  id: string
  label: string
  icon: ReactNode
  children: TaskForceMenuChild[]
}

const taskForceMenuGroups: TaskForceMenuGroup[] = [
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
      { id: 'callout-launch', label: 'Callout Launch', description: 'Initiate and configure new callout operations.' },
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
  const white = theme.palette.common.white
  const items = useMemo(() => (navItems && navItems.length > 0 ? navItems : fallbackNavItems), [navItems])
  const [query, setQuery] = useState('')
  const trimmedQuery = query.trim()
  const hasCustomItems = Boolean(navItems && navItems.length > 0)
  const showTreeResults = !hasCustomItems || Boolean(trimmedQuery)

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedQuery) return
    onSearch?.(trimmedQuery)
  }

  const filteredGroups = useMemo(() => {
    if (!trimmedQuery) {
      return taskForceMenuGroups
    }
    const value = trimmedQuery.toLowerCase()
    return taskForceMenuGroups
      .map((group) => ({
        ...group,
        children: group.children.filter(
          (child) =>
            child.label.toLowerCase().includes(value) ||
            child.description.toLowerCase().includes(value)
        ),
      }))
      .filter((group) => group.children.length > 0)
  }, [query])

  const noMatches = showTreeResults && filteredGroups.length === 0

  const footerContent = footerSlot ?? (
    <Stack gap={0.75} alignItems="flex-start">
      <Box
        component="img"
        src={openreachLogo}
        alt="Openreach brand mark"
        sx={{ width: 96, height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))' }}
      />
      <Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap">
        <Chip
          label={CLIENT_BUILD.label}
          size="small"
          variant="outlined"
          sx={{
            height: 22,
            borderColor: alpha(palette.fibreThreads, 0.3),
            color: alpha(palette.fibreThreads, 0.85),
            '& .MuiChip-label': {
              px: 0.75,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
          }}
        />
        <Typography variant="caption" sx={{ color: alpha(palette.fibreThreads, 0.7) }}>
          {CLIENT_BUILD.date}
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ color: alpha(palette.fibreThreads, 0.55) }}>
        Last sync · 06:00 UTC
      </Typography>
    </Stack>
  )

  const handleGroupSelect = (group: TaskForceMenuGroup) => {
    onSelect?.({
      id: group.id,
      label: group.label,
      icon: group.icon,
      description: `${group.children.length} tools`,
    })
    onClose()
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          backgroundColor: palette.supportingBlock,
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'stretch',
          p: 0,
          height: '100vh',
          maxHeight: '100vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        },
      }}
    >
      <Box sx={{ width: { xs: 320, sm: 360 }, height: '100%' }}>
        <Paper
          component="nav"
          elevation={0}
          sx={{
            width: '100%',
            bgcolor: palette.supportingBlock,
            color: palette.fibreThreads,
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
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.08) 20%, transparent 20%)',
              opacity: 0.5,
              pointerEvents: 'none',
            },
          }}
        >
          <Stack sx={{ p: 2, gap: 2, position: 'relative', zIndex: 1, height: '100%', minHeight: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Box sx={{ textAlign: 'left' }}>
                {headerSlot ? (
                  headerSlot
                ) : (
                  <>
                    <Typography
                      variant="overline"
                      sx={{
                        color: palette.energyAccent,
                        letterSpacing: 2,
                        fontWeight: 700,
                      }}
                    >
                      OPENREACH
                    </Typography>
                  </>
                )}
              </Box>

              <Tooltip title="Close navigation">
                <IconButton
                  aria-label="Close navigation"
                  onClick={onClose}
                  sx={{ color: palette.fibreThreads, '&:hover': { color: palette.energyAccent } }}
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
                bgcolor: alpha(white, 0.08),
                borderRadius: 999,
                px: 2,
                py: 0.5,
              }}
            >
              <SearchRoundedIcon fontSize="small" sx={{ color: alpha(white, 0.8) }} />
              <InputBase
                placeholder="Search menu and tools"
                value={query}
                sx={{ ml: 1, color: palette.fibreThreads, width: '100%' }}
                onChange={(event) => setQuery(event.target.value)}
                inputProps={{ 'aria-label': 'Search Openreach workspace' }}
              />
              {trimmedQuery && (
                <IconButton
                  aria-label="Clear search"
                  size="small"
                  onClick={() => setQuery('')}
                  sx={{ color: alpha(white, 0.8), ml: 1 }}
                >
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5, minHeight: 0 }}>
              {!showTreeResults && (
                <List component="div" disablePadding>
                  {items.map((item) => (
                    <ListItemButton
                      key={item.id}
                      selected={item.active}
                      onClick={() => {
                        onSelect?.(item)
                        onClose()
                      }}
                      sx={{
                        mb: 0.5,
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                        color: palette.fibreThreads,
                        '&.Mui-selected': {
                          bgcolor: palette.coreBlock,
                          '&:hover': { bgcolor: palette.coreBlock },
                        },
                        '&:hover': {
                          bgcolor: alpha(white, 0.08),
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: palette.fibreThreads,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.description}
                        primaryTypographyProps={{ fontWeight: 600, color: palette.fibreThreads }}
                        secondaryTypographyProps={{ color: alpha(palette.fibreThreads, 0.75) }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            ml: 1,
                            bgcolor: alpha(palette.energyAccent, 0.16),
                            color: palette.energyAccent,
                            border: `1px solid ${alpha(palette.energyAccent, 0.4)}`,
                          }}
                        />
                      )}
                    </ListItemButton>
                  ))}
                </List>
              )}

              {showTreeResults && (
                <Stack gap={2.5}>
                  {noMatches && (
                    <Typography variant="body2" sx={{ color: alpha(palette.fibreThreads, 0.8) }}>
                      No menus match “{trimmedQuery}”. Try another term.
                    </Typography>
                  )}
                  {filteredGroups.map((group, index) => (
                    <Box key={group.id}>
                      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: alpha(white, 0.08),
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          {group.icon}
                        </Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: palette.fibreThreads }}>
                          {group.label}
                        </Typography>
                      </Stack>

                      <List disablePadding>
                        {group.children.map((child) => (
                          <ListItemButton
                            key={child.id}
                            onClick={() => handleGroupSelect(group)}
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
                              pl: 3.5,
                              pr: 1.25,
                              py: 1,
                              alignItems: 'flex-start',
                              color: palette.fibreThreads,
                              '&:hover': {
                                bgcolor: alpha(white, 0.08),
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 28,
                                mt: 0.2,
                                color: alpha(palette.fibreThreads, 0.7),
                              }}
                            >
                              <ChevronRightRoundedIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              secondary={child.description}
                              primaryTypographyProps={{ fontWeight: 600, color: palette.fibreThreads }}
                              secondaryTypographyProps={{ color: alpha(palette.fibreThreads, 0.7) }}
                            />
                          </ListItemButton>
                        ))}
                      </List>

                      {index < filteredGroups.length - 1 && (
                        <Divider sx={{ mt: 2, borderColor: alpha(white, 0.08) }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {footerContent && (
              <Box
                mt="auto"
                pt={1.75}
                pb="env(safe-area-inset-bottom, 0px)"
              >
                <Divider sx={{ mb: 1, borderColor: alpha(white, 0.08) }} />
                {footerContent}
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
    </Drawer>
  )
}
