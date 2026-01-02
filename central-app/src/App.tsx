import { useState } from 'react'
import './App.css'
import { Box, Button, CssBaseline, Stack, Typography } from '@mui/material'
import { OpenreachSideNav } from './Openreach - App/App - Scaffold/App - Side Nav'
import { OpenreachTopBanner } from './Openreach - App/App - Scaffold/App - Top Banner'

function App() {
  const [navOpen, setNavOpen] = useState(false)

  const openNav = () => setNavOpen(true)
  const closeNav = () => setNavOpen(false)

  return (
    <>
      <CssBaseline />
      <OpenreachSideNav
        open={navOpen}
        onClose={closeNav}
        footerSlot={
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderColor: 'rgba(245, 244, 245, 0.4)',
              color: '#F5F4F5',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#00CCAD',
                color: '#00CCAD',
              },
            }}
          >
            Support Desk
          </Button>
        }
      />

      <Box className="app-stage">
        <Stack gap={3} width="100%">
          <OpenreachTopBanner
            title="Fibre Build Console"
            subtitle="Track civils blockers, live PON progress, and build window alerts from one view."
            statusChip={{ label: 'LIVE STATUS', tone: 'success' }}
            userInitials="JD"
            userRole="Delivery Lead"
            onMenuClick={openNav}
            onSearch={(value) => console.log('Search query:', value)}
            actions={
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: '#00CCAD',
                  color: '#073B4C',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#00b598' },
                }}
              >
                Raise Workstack
              </Button>
            }
          />

          <Box className="app-canvas">
            <Typography variant="overline" className="canvas-label">
              ACTIVE BUILD LANES
            </Typography>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Metro South — Stage 3
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Drop your module content here. The scaffold keeps spacing, elevation, and theming aligned with the
              January 2026 Openreach refresh so downstream teams can focus on data instead of layout plumbing.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </>
  )
}

export default App
