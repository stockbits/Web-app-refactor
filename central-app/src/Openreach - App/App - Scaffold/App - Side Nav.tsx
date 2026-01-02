import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { alpha } from '@mui/material/styles'
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
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
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'

const palette = {
  coreBlock: '#073B4C',
  supportingBlock: '#142032',
  energyAccent: '#00CCAD',
  fibreThreads: '#F5F4F5',
  outline: '#ECECEC',
} as const

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
}

const fallbackNavItems: OpenreachNavItem[] = [
  { id: 'home', label: 'Home', icon: <HomeRoundedIcon />, active: true, description: "Today's fibre insight" },
  { id: 'overview', label: 'Programme Pulse', icon: <DashboardRoundedIcon />, description: 'Health & milestones' },
  { id: 'workstack', label: 'Workstack', icon: <AssignmentTurnedInRoundedIcon />, badge: '42', description: 'Orders queued' },
  { id: 'performance', label: 'Performance', icon: <TimelineRoundedIcon />, description: 'Live dashboards' },
  { id: 'settings', label: 'Settings', icon: <SettingsRoundedIcon />, description: 'Controls & access' },
]

export const OpenreachSideNav = ({ open, onClose, navItems, footerSlot, headerSlot }: OpenreachSideNavProps) => {
  const items = useMemo(() => (navItems && navItems.length > 0 ? navItems : fallbackNavItems), [navItems])

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'flex-start',
          p: { xs: 1.5, sm: 2 },
        },
      }}
    >
      <Box sx={{ width: { xs: 320, sm: 360 } }}>
        <Paper
          component="nav"
          elevation={0}
          sx={{
            width: '100%',
            bgcolor: palette.supportingBlock,
            color: palette.fibreThreads,
            borderRadius: 3,
            border: `1px solid ${alpha(palette.outline, 0.5)}`,
            boxShadow: '0 20px 40px rgba(2, 9, 20, 0.45)',
            position: 'relative',
            overflow: 'hidden',
            isolation: 'isolate',
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
          <Stack sx={{ p: 2, gap: 2, position: 'relative', zIndex: 1, height: '100%' }}>
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
                    <Typography variant="h6" fontWeight={700} sx={{ color: palette.fibreThreads }}>
                      Fibre Console
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

            <List component="div" disablePadding sx={{ flexGrow: 1 }}>
              {items.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={item.active}
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
                      bgcolor: alpha('#FFFFFF', 0.08),
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
                    primaryTypographyProps={{ fontWeight: 600 }}
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

            {footerSlot && <Divider sx={{ borderColor: alpha('#FFFFFF', 0.08) }} />}
            {footerSlot && <Box>{footerSlot}</Box>}
          </Stack>
        </Paper>
      </Box>
    </Drawer>
  )
}
