import { Box, Typography, Paper } from '@mui/material'
import PaletteIcon from '@mui/icons-material/Palette'
import { PageContainer } from '../../../App - Shared Components/Page Container'

const ThemeBuilderPage = () => (
  <PageContainer maxWidth="lg" spacing={3}>
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Box sx={{ mb: 2 }}>
        <PaletteIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        Theme Builder
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for Theme Builder. Customize application themes and colors here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default ThemeBuilderPage
