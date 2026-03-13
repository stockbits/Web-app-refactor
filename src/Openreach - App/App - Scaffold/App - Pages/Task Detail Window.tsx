import { useMemo, useState } from 'react'
import { Box, Typography, IconButton, alpha, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { TaskDetails } from '../../App - Shared Components/MUI - More Info Component/App - Task Details'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'

/**
 * Standalone Task Detail Window
 * Opens in a new browser window to display single task details with expand/collapse
 */
export default function TaskDetailWindow() {
  const theme = useTheme()
  
  // Parse task data from URL parameters (once on mount)
  const task = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const taskDataParam = params.get('task')
    
    if (taskDataParam) {
      try {
        return JSON.parse(decodeURIComponent(taskDataParam)) as TaskTableRow
      } catch (error) {
        console.error('Error parsing task data:', error)
      }
    }
    return null
  }, [])
  
  const [fieldNotesExpanded, setFieldNotesExpanded] = useState(true)
  const [progressNotesExpanded, setProgressNotesExpanded] = useState(true)

  const handleClose = () => {
    window.close()
  }

  if (!task) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No task data found
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Task Details - {task.taskId}
        </Typography>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
        }}
      >
        <TaskDetails 
          task={task}
          fieldNotesExpanded={fieldNotesExpanded}
          progressNotesExpanded={progressNotesExpanded}
          onFieldNotesExpandedChange={setFieldNotesExpanded}
          onProgressNotesExpandedChange={setProgressNotesExpanded}
        />
      </Box>
    </Box>
  )
}
