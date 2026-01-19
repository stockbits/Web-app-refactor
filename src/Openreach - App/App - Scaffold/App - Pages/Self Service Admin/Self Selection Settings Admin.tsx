import { Box, Typography, Paper } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import PageContainer from '../../../App - Shared Components/Page Container'

const SelfSelectionSettingsAdminPage = () => (
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
        <SettingsIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        Self Selection Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for Self Selection Settings Admin administration. Wire real data pipelines here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default SelfSelectionSettingsAdminPage
