import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { alpha, useTheme } from '@mui/material/styles'
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'

export interface DockedPanel {
  id: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
}

export interface OpenreachTopBannerProps {
  title: string
  subtitle?: string
  onMenuClick: () => void
  actions?: ReactNode
  userInitials?: string
  userName?: string
  userRole?: string
}

export const OpenreachTopBanner = ({
  title,
  subtitle,
  onMenuClick,
  actions,
  userInitials = 'OR',
  userName,
  userRole = 'Fibre Operations',
}: OpenreachTopBannerProps) => {
  const theme = useTheme()
  const brand = theme.openreach
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
        borderRadius: 0,
        px: 0,
        py: 0,
        minHeight: { xs: 64, md: 80 },
        backgroundColor: theme.openreach.brand.primary,
        color: theme.openreach.brand.white,
        // More dense, layered shadow for top banner
        boxShadow: theme.palette.mode === 'dark'
          ? '0 6px 24px 0 rgba(0,0,0,0.5), 0 1.5px 8px 0 rgba(0,0,0,0.3)'
          : '0 6px 24px 0 rgba(20,32,50,0.15), 0 1.5px 8px 0 rgba(20,32,50,0.08)',
        borderBottom: theme.palette.mode === 'dark'
          ? '1px solid rgba(255,255,255,0.15)'
          : '1px solid rgba(20,32,50,0.2)',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent 65%)',
          opacity: 0.3,
          pointerEvents: 'none',
        },
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          pl: 'var(--page-gutter)',
          pr: 'var(--page-gutter)',
          py: { xs: 0.5, md: 0.85 },
          gap: 1.5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Stack direction="row" gap={1.5} alignItems="center" sx={{ width: '100%', flex: 1, minWidth: 0 }}>
          <IconButton
            aria-label="Open navigation"
            onClick={onMenuClick}
            sx={{
              bgcolor: 'transparent',
              color: theme.openreach.brand.success,
              p: 0.6,
              '&:hover': { bgcolor: alpha(theme.openreach.brand.white, 0.12) },
              '&:active': { bgcolor: alpha(theme.openreach.brand.white, 0.2) },
            }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: { xs: 32, md: 40 } }}>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.4}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ mt: 0.25, color: alpha(brand.fibreThreads, 0.85) }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack
          direction="row"
          gap={1.5}
          alignItems="center"
          sx={{ flexShrink: 0, justifyContent: 'flex-end' }}
        >


          {actions}

          <>
            <IconButton
              aria-label="Open profile menu"
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0,
                borderRadius: '50%',
                border: `2px solid ${alpha(brand.fibreThreads, 0.35)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: brand.energyAccent,
                  boxShadow: '0 0 0 4px rgba(0,204,173,0.18)',
                },
              }}
            >
              <Avatar sx={{ bgcolor: brand.energyAccent, color: brand.fibreThreads }}>
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
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary,
                    boxShadow: theme.shadows[8],
                    borderRadius: 0,
                  },
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: 1, cursor: 'default', whiteSpace: 'normal' }}>
                <Stack>
                  <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                    {userName ?? userInitials}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
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
