import { Box, Typography, Paper } from '@mui/material'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { PageContainer } from '../../../App - Shared Components/Page Container'

const UnbarUserPage = () => (
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
        <LockOpenIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        Unbar User
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for Unbar User administration. Wire real data pipelines here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default UnbarUserPage
