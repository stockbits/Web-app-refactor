import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { alpha } from '@mui/material/styles'
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import openreachLogo from '@central-logos/Openreach-Logo.jpeg'

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
  onSearch?: (value: string) => void
  actions?: ReactNode
  userInitials?: string
  userRole?: string
  showSupportShortcut?: boolean
}

export const OpenreachTopBanner = ({
  title,
  subtitle,
  statusChip,
  onMenuClick,
  onSearch,
  actions,
  userInitials = 'OR',
  userRole = 'Fibre Operations',
  showSupportShortcut = true,
}: OpenreachTopBannerProps) => {
  const [query, setQuery] = useState('')

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!query.trim()) return
    onSearch?.(query.trim())
  }

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
          component="form"
          direction="row"
          onSubmit={submitSearch}
          alignItems="center"
          sx={{
            bgcolor: alpha('#FFFFFF', 0.12),
            borderRadius: 999,
            px: 2,
            py: 0.5,
            width: { xs: '100%', md: 360 },
          }}
        >
          <SearchRoundedIcon fontSize="small" sx={{ color: alpha('#FFFFFF', 0.8) }} />
          <InputBase
            placeholder="Search programmes, exchanges, jobs"
            value={query}
            sx={{ ml: 1, color: palette.surface, width: '100%' }}
            onChange={(event) => setQuery(event.target.value)}
            inputProps={{ 'aria-label': 'Search Openreach workspace' }}
          />
        </Stack>

        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          sx={{ width: { xs: '100%', xl: 'auto' }, justifyContent: { xs: 'flex-end', xl: 'flex-start' }, flexWrap: 'wrap' }}
        >
          <Tooltip title="Notifications">
            <IconButton
              aria-label="Notifications"
              sx={{ color: palette.fibreThreads, '&:hover': { color: palette.energyAccent } }}
            >
              <NotificationsNoneRoundedIcon />
            </IconButton>
          </Tooltip>

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

          <Divider flexItem orientation="vertical" light sx={{ borderColor: alpha('#FFFFFF', 0.24) }} />

          <Stack direction="row" gap={1} alignItems="center" flexWrap="nowrap">
            <Avatar sx={{ bgcolor: palette.energyAccent, color: palette.coreBlock, fontWeight: 700 }}>
              {userInitials}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {userInitials}
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
