import { Box, Typography, Paper } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { PageContainer } from '../../../App - Shared Components/Page Container'

const AlertRankingPage = () => (
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
        <TrendingUpIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        Alert Ranking
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for Alert Ranking administration. Wire real data pipelines here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default AlertRankingPage
