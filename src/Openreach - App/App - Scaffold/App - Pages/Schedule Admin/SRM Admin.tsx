import { Box, Typography, Paper } from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { PageContainer } from '../../../App - Shared Components/Page Container'

const SRMAdminPage = () => (
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
        <AdminPanelSettingsIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        SRM Administration
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for SRM Admin administration. Wire real data pipelines here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default SRMAdminPage
