import { useMemo, useState } from 'react'
import type { ElementType } from 'react'
import './App.css'
import {
  Box,
  Chip,
  Card,
  CardActionArea,
  CardContent,
  CssBaseline,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded'
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded'
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded'
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import PublicRoundedIcon from '@mui/icons-material/PublicRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded'
import { OpenreachSideNav } from './Openreach - App/App - Scaffold/App - Side Nav'
import { OpenreachTopBanner } from './Openreach - App/App - Scaffold/App - Top Banner'

interface MenuCardTile {
  name: string
  description: string
}

interface MenuGroup {
  id: string
  label: string
  description: string
  icon: ElementType
  cards: MenuCardTile[]
  accessLabel: string
}

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'operation-toolkit',
    label: 'Operation Toolkit',
    description: 'Live scheduling and callout controls.',
    icon: BuildCircleRoundedIcon,
    accessLabel: 'Full access',
    cards: [
      { name: 'Schedule Live', description: 'Monitor and adjust live schedules in real-time.' },
      { name: 'Schedule Explorer', description: 'Browse and analyse upcoming schedules and plans.' },
      { name: 'Callout Overview', description: 'Review all ongoing and past callout events.' },
      { name: 'Callout Launch', description: 'Initiate and configure new callout operations.' },
    ],
  },
  {
    id: 'operations-management',
    label: 'Operations Management',
    description: 'Coordinate resources and delivery tasks across every exchange.',
    icon: PeopleAltRoundedIcon,
    accessLabel: 'Full access',
    cards: [
      {
        name: 'Resource Management',
        description: 'Manage all engineers, depots, and physical assets.',
      },
      {
        name: 'Task Management',
        description: 'Oversee and assign operational tasks efficiently.',
      },
    ],
  },
  {
    id: 'general-settings',
    label: 'General Settings',
    description: 'Preferences, notifications, and API access.',
    icon: SettingsSuggestRoundedIcon,
    accessLabel: 'Editor access',
    cards: [
      { name: 'System Preferences', description: 'Modify user-level settings, preferences, and themes.' },
      { name: 'Notification Channels', description: 'Configure alert destinations and channels.' },
      { name: 'Theme Builder', description: 'Adjust palettes and typography tokens.' },
      { name: 'API Keys', description: 'Manage access tokens and integrations securely.' },
    ],
  },
  {
    id: 'task-admin',
    label: 'Task Admin',
    description: 'Core definitions that shape work routing.',
    icon: ChecklistRoundedIcon,
    accessLabel: 'Editor access',
    cards: [
      { name: 'Task Type', description: 'Define and manage task categories and types.' },
      { name: 'Task Routing', description: 'Configure routing and escalation rules.' },
      { name: 'Task Importance', description: 'Set and manage task priority and importance levels.' },
    ],
  },
  {
    id: 'jeopardy-admin',
    label: 'Jeopardy Admin',
    description: 'Alert templates, actions, and thresholds.',
    icon: WarningAmberRoundedIcon,
    accessLabel: 'Editor access',
    cards: [
      { name: 'Alert Definitions', description: 'Define and manage all alert templates.' },
      { name: 'Alert Action Definition', description: 'Configure automated or manual alert responses.' },
      { name: 'Alert Parameter Definition', description: 'Set up variable parameters and alert thresholds.' },
      { name: 'Alert Ranking', description: 'Prioritise alerts by severity or impact.' },
      { name: 'Alert Exclusion', description: 'Manage exceptions and exclusion rules for alerts.' },
    ],
  },
  {
    id: 'resource-admin',
    label: 'Resource Admin',
    description: 'Rota governance and overtime controls.',
    icon: AccountTreeRoundedIcon,
    accessLabel: 'Full access',
    cards: [
      { name: 'Rota Day Record', description: 'Manage and track individual rota day records.' },
      { name: 'Rota Week Record', description: 'Oversee weekly rota summaries and status tracking.' },
      { name: 'Rota Template Record', description: 'Design and configure rota templates for scheduling.' },
      { name: 'Closure User Group', description: 'Administer closure groups for specific operations.' },
      { name: 'Access Restriction', description: 'Set user and role-based access limitations.' },
      { name: 'Personal Overtime', description: 'Monitor and manage personal overtime records.' },
      { name: 'Business Overtime', description: 'Control and review business-wide overtime data.' },
    ],
  },
  {
    id: 'self-service-admin',
    label: 'Self Service Admin',
    description: 'Self-selection policy and scoring.',
    icon: HandshakeRoundedIcon,
    accessLabel: 'Requester only',
    cards: [
      { name: 'Self Selection Settings Admin', description: 'Configure system-wide self-selection settings.' },
      { name: 'Self Selection Task Rating Admin', description: 'Manage task rating parameters.' },
      { name: 'Self Selection Patch Admin', description: 'Handle patch management for self-selection.' },
      { name: 'Self Selection Work Type Admin', description: 'Control available work types.' },
    ],
  },
  {
    id: 'user-admin',
    label: 'User Admin',
    description: 'Identity, roles, and access.',
    icon: AdminPanelSettingsRoundedIcon,
    accessLabel: 'Restricted',
    cards: [
      { name: 'User Account', description: 'Create and manage system user accounts and credentials.' },
      { name: 'User ID', description: 'View and assign unique user identification numbers.' },
      { name: 'Unbar User', description: 'Unblock or reinstate restricted user accounts.' },
      { name: 'User Role Profile', description: 'Define user roles and associated permissions.' },
      { name: 'Supervisor Change Password', description: 'Allow supervisors to reset/change passwords.' },
    ],
  },
  {
    id: 'domain-admin',
    label: 'Domain Admin',
    description: 'Geography, assets, and workforce coverage.',
    icon: PublicRoundedIcon,
    accessLabel: 'Full access',
    cards: [
      { name: 'Domain Building', description: 'Configure and structure operational domains.' },
      { name: 'Post Areas', description: 'Define post boundaries, checkpoints, and zones.' },
      { name: 'Travel Areas', description: 'Set travel regions and mobility zones.' },
      { name: 'Asset', description: 'Manage fixed and movable assets.' },
      { name: 'Workforce', description: 'Assign and monitor domain workforce allocations.' },
      { name: 'Division', description: 'Oversee structural divisions.' },
    ],
  },
  {
    id: 'schedule-admin',
    label: 'Schedule Admin',
    description: 'Master schedule & SRM governance.',
    icon: CalendarMonthRoundedIcon,
    accessLabel: 'Editor access',
    cards: [
      { name: 'MSS Admin', description: 'Manage and configure the Master Schedule System.' },
      { name: 'SRM Admin', description: 'Administer SRM modules & permissions.' },
      { name: 'SRM Audit', description: 'Audit SRM changes and scheduling history.' },
    ],
  },
  {
    id: 'system-admin',
    label: 'System Admin',
    description: 'Algorithms, audits, and holiday tables.',
    icon: MemoryRoundedIcon,
    accessLabel: 'Read only',
    cards: [
      { name: 'Algorithm Parameters', description: 'Configure algorithm behaviours & weights.' },
      { name: 'System Code Editor', description: 'Maintain scripts, triggers & automation.' },
      { name: 'Record Audit', description: 'Review detailed audit trails.' },
      { name: 'Public Holiday', description: 'Manage holiday dates affecting schedules.' },
      { name: 'General Travel Times', description: 'Configure default travel time settings.' },
    ],
  },
]

const TOTAL_TOOL_COUNT = MENU_GROUPS.reduce((total, group) => total + group.cards.length, 0)

function App() {
  const [navOpen, setNavOpen] = useState(false)
  const [selectedMenuId, setSelectedMenuId] = useState(MENU_GROUPS[0].id)
  const [showWelcome, setShowWelcome] = useState(true)

  const openNav = () => setNavOpen(true)
  const closeNav = () => setNavOpen(false)

  const selectedMenu = useMemo(
    () => MENU_GROUPS.find((group) => group.id === selectedMenuId) ?? MENU_GROUPS[0],
    [selectedMenuId]
  )

  const navItems = useMemo(
    () =>
      MENU_GROUPS.map((group) => {
        const Icon = group.icon
        return {
          id: group.id,
          label: group.label,
          icon: <Icon fontSize='small' />,
          description: group.description,
          active: group.id === selectedMenuId,
        }
      }),
    [selectedMenuId]
  )

  const handleNavSelection = (itemId: string) => {
    setSelectedMenuId(itemId)
    setShowWelcome(false)
  }

  return (
    <>
      <CssBaseline />
      <OpenreachSideNav
        open={navOpen}
        onClose={closeNav}
        onSearch={(value) => console.log('Search query:', value)}
        navItems={navItems}
        onSelect={(item) => handleNavSelection(item.id)}
      />

      <Box className='app-stage'>
        <Stack gap={3} width='100%'>
          <OpenreachTopBanner
            title='Task Force'
            subtitle='Day-to-day operational tool for Openreach operations.'
            statusChip={{ label: 'LIVE STATUS', tone: 'success' }}
            userInitials='JD'
            userName='Jordan Davies'
            userRole='Delivery Lead'
            onMenuClick={openNav}
          />

          <Box
            className='app-canvas'
            sx={
              showWelcome
                ? {
                    background: 'linear-gradient(135deg, #052432, #0f1f33)',
                    color: '#F5F4F5',
                    borderColor: 'rgba(245,244,245,0.15)',
                  }
                : undefined
            }
          >
            {showWelcome ? (
              <Stack gap={3}>
                <Stack gap={1}>
                  <Typography variant='overline' sx={{ letterSpacing: 4, color: 'rgba(0,204,173,0.9)' }}>
                    OPENREACH TASK FORCE
                  </Typography>
                  <Typography variant='h4' fontWeight={700}>
                    Access overview
                  </Typography>
                  <Typography variant='body1' sx={{ color: 'rgba(245,244,245,0.85)' }}>
                    Hi Jordan, you have access to {MENU_GROUPS.length} programmes and {TOTAL_TOOL_COUNT} tools. Use the
                    left navigation to jump straight into a workspace.
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  }}
                >
                  {MENU_GROUPS.map((group) => {
                    const Icon = group.icon
                    return (
                      <Paper
                        key={group.id}
                        component='section'
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: '1px solid rgba(255,255,255,0.12)',
                          backgroundColor: 'rgba(4, 11, 18, 0.35)',
                          backdropFilter: 'blur(6px)',
                        }}
                      >
                        <Stack direction='row' gap={1.5} alignItems='flex-start'>
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
                            <Icon fontSize='small' />
                          </Box>
                          <Box flexGrow={1} minWidth={0}>
                            <Typography variant='subtitle1' fontWeight={600} sx={{ color: '#F5F4F5' }}>
                              {group.label}
                            </Typography>
                            <Typography variant='body2' sx={{ color: 'rgba(245,244,245,0.75)' }}>
                              {group.description}
                            </Typography>
                          </Box>
                          <Chip
                            label={group.accessLabel}
                            size='small'
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
                              size='small'
                              variant='outlined'
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

                <Typography variant='body2' sx={{ color: 'rgba(245,244,245,0.75)' }}>
                  Tip: tap the Task Force menu icon to open navigation and move between programmes.
                </Typography>
              </Stack>
            ) : (
              <>
                <Stack gap={1} mb={2}>
                  <Typography variant='overline' className='canvas-label'>
                    MENU • {selectedMenu.label}
                  </Typography>
                  <Typography variant='h5' fontWeight={700} gutterBottom>
                    {selectedMenu.label}
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    {selectedMenu.description}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                      xs: 'repeat(1, minmax(0, 1fr))',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      md: 'repeat(3, minmax(0, 1fr))',
                    },
                  }}
                >
                  {selectedMenu.cards.map((card) => (
                    <Card className='menu-card' key={card.name}>
                      <CardActionArea>
                        <CardContent>
                          <Typography variant='subtitle1' fontWeight={600} gutterBottom>
                            {card.name}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {card.description}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Stack>
      </Box>
    </>
  )
}

export default App
