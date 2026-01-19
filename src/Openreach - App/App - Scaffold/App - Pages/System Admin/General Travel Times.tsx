import { Box, Typography, Paper } from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PageContainer from '../../../App - Shared Components/Page Container'

const GeneralTravelTimesPage = () => (
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
        <DirectionsCarIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        General Travel Times Configuration
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for General Travel Times administration. Wire real data pipelines here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default GeneralTravelTimesPage
