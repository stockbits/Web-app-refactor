import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { alpha } from '@mui/material/styles'
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded'

const palette = {
  coreBlock: '#073B4C',
  supportingBlock: '#142032',
  energyAccent: '#00CCAD',
  fibreThreads: '#F5F4F5',
  surface: '#F5F4F5',
} as const

type StatusTone = 'default' | 'info' | 'success' | 'warning'

const statusChipStyles: Record<StatusTone, { bg: string; color: string; border?: string }> = {
  default: {
    bg: alpha('#FFFFFF', 0.12),
    color: palette.surface,
  },
  info: {
    bg: alpha(palette.energyAccent, 0.12),
    color: palette.energyAccent,
    border: `1px solid ${alpha(palette.energyAccent, 0.4)}`,
  },
  success: {
    bg: alpha('#3FB984', 0.16),
    color: '#3FB984',
  },
  warning: {
    bg: alpha('#FFB703', 0.2),
    color: '#FFB703',
  },
}

export interface OpenreachTopBannerProps {
  title: string
  subtitle?: string
  statusChip?: {
    label: string
    tone?: StatusTone
  }
  onMenuClick: () => void
  actions?: ReactNode
  userInitials?: string
  userName?: string
  userRole?: string
}

export const OpenreachTopBanner = ({
  title,
  subtitle,
  statusChip,
  onMenuClick,
  actions,
  userInitials = 'OR',
  userName,
  userRole = 'Fibre Operations',
}: OpenreachTopBannerProps) => {
  const chipTone = statusChip?.tone ?? 'default'
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null)
  const profileMenuOpen = Boolean(profileAnchorEl)

  const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => setProfileAnchorEl(null)

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: 3,
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        backgroundImage: `linear-gradient(120deg, ${palette.coreBlock}, ${palette.supportingBlock})`,
        color: palette.fibreThreads,
        boxShadow: '0 20px 40px rgba(2, 9, 20, 0.35)',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 4px, transparent 5px, transparent 16px)',
          opacity: 0.35,
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
        },
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          gap: 3,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Stack direction="row" gap={2} alignItems="center" sx={{ width: '100%', flex: 1, minWidth: 0 }}>
          <IconButton
            aria-label="Open navigation"
            onClick={onMenuClick}
            sx={{
              bgcolor: alpha('#FFFFFF', 0.12),
              color: palette.fibreThreads,
              '&:hover': { bgcolor: alpha('#FFFFFF', 0.24) },
            }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Box>
            <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center">
              <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
                {title}
              </Typography>
              {statusChip?.label && (
                <Chip
                  label={statusChip.label}
                  size="small"
                  sx={{
                    bgcolor: statusChipStyles[chipTone].bg,
                    color: statusChipStyles[chipTone].color,
                    border: statusChipStyles[chipTone].border,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                  }}
                />
              )}
            </Stack>
            {subtitle && (
              <Typography variant="body2" sx={{ mt: 0.5, color: alpha(palette.surface, 0.9) }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack
          direction="row"
          gap={1.5}
          alignItems="center"
          sx={{ flexShrink: 0, justifyContent: 'flex-end', flexWrap: 'nowrap' }}
        >
          {actions}

          <>
            <IconButton
              aria-label="Open profile menu"
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0,
                borderRadius: '50%',
                border: '2px solid rgba(245,244,245,0.35)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: palette.energyAccent,
                  boxShadow: '0 0 0 4px rgba(0,204,173,0.18)',
                },
              }}
            >
              <Avatar sx={{ bgcolor: palette.energyAccent, color: palette.coreBlock }}>
                <EngineeringRoundedIcon fontSize="small" />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={profileAnchorEl}
              open={profileMenuOpen}
              onClose={handleProfileMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    minWidth: 220,
                    px: 1,
                    bgcolor: palette.supportingBlock,
                    border: `1px solid ${alpha('#FFFFFF', 0.12)}`,
                    color: palette.fibreThreads,
                    boxShadow: '0 20px 40px rgba(2, 9, 20, 0.45)',
                  },
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: 1, cursor: 'default', whiteSpace: 'normal' }}>
                <Stack>
                  <Typography variant="body2" fontWeight={700} sx={{ color: palette.fibreThreads }}>
                    {userName ?? userInitials}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha(palette.fibreThreads, 0.75) }}>
                    {userRole}
                  </Typography>
                </Stack>
              </MenuItem>
            </Menu>
          </>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
