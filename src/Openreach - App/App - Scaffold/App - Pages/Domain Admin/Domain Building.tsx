import { Box, Typography, Paper } from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import { PageContainer } from '../../../App - Shared Components/Page Container'

const DomainBuildingPage = () => (
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
        <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        Domain Building Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for Domain Building administration. Wire real data pipelines here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default DomainBuildingPage
