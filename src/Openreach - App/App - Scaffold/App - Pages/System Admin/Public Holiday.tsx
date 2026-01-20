import { Box, Typography, Paper } from '@mui/material'
import EventIcon from '@mui/icons-material/Event'
import { PageContainer } from '../../../App - Shared Components/Page Container'

const PublicHolidayPage = () => (
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
        <EventIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        Public Holiday Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for Public Holiday administration. Wire real data pipelines here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default PublicHolidayPage
