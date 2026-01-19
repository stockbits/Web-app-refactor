import { Box, Typography, Paper } from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import PageContainer from '../../../App - Shared Components/Page Container'

const SystemCodeEditorPage = () => (
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
        <CodeIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
        System Code Editor
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Placeholder content for System Code Editor administration. Wire real data pipelines here.
      </Typography>
    </Paper>
  </PageContainer>
)

export default SystemCodeEditorPage
