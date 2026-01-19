import { Box, Typography, Paper } from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import PageContainer from '../../../App - Shared Components/Page Container'

const UserAccountPage = () => (
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
        <AccountCircleIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        User Account Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for User Account administration. Wire real data pipelines here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default UserAccountPage
