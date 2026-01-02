import type { ReactNode } from 'react'
import { alpha } from '@mui/material/styles'
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded'
import openreachLogo from '@central-logos/Openreach-Logo-White.png'

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
  showSupportShortcut?: boolean
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
  showSupportShortcut = true,
}: OpenreachTopBannerProps) => {
  const chipTone = statusChip?.tone ?? 'default'

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
          gap: { xs: 2, md: 3 },
          flexDirection: { xs: 'column', xl: 'row' },
          alignItems: { xs: 'stretch', xl: 'center' },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Stack direction="row" gap={2} alignItems="center" sx={{ width: '100%' }}>
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
          gap={1}
          alignItems="center"
          sx={{ width: { xs: '100%', xl: 'auto' }, justifyContent: { xs: 'flex-end', xl: 'flex-start' }, flexWrap: 'wrap' }}
        >
          {showSupportShortcut && (
            <Tooltip title="Help & Support">
              <IconButton
                aria-label="Help"
                sx={{ color: palette.fibreThreads, '&:hover': { color: palette.energyAccent } }}
              >
                <HelpOutlineRoundedIcon />
              </IconButton>
            </Tooltip>
          )}

          {actions}

          <Stack direction="row" gap={1} alignItems="center" flexWrap="nowrap">
            <Avatar sx={{ bgcolor: palette.energyAccent, color: palette.coreBlock }}>
              <EngineeringRoundedIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {userName ?? userInitials}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.8) }}>
                {userRole}
              </Typography>
            </Box>
          </Stack>

          <Box
            component="img"
            src={openreachLogo}
            alt="Openreach brand mark"
            sx={{
              width: { xs: 88, sm: 120 },
              height: 'auto',
              ml: { xs: 'auto', xl: 2 },
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.35))',
            }}
          />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
