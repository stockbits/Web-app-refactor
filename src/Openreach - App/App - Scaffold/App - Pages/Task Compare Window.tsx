import { useEffect, useState } from 'react'
import { Box, CircularProgress, Typography, IconButton, Grid, alpha, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { TaskDetails } from '../../App - Shared Components/MUI - More Info Component/App - Task Details'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'

/**
 * Standalone Task Comparison Window
 * Opens in a new browser window to display multiple tasks side-by-side with expand/collapse
 */
export default function TaskCompareWindow() {
  const theme = useTheme()
  const [tasks, setTasks] = useState<TaskTableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fieldNotesExpanded, setFieldNotesExpanded] = useState(false)
  const [progressNotesExpanded, setProgressNotesExpanded] = useState(false)

  useEffect(() => {
    // Parse tasks data from URL parameters
    const params = new URLSearchParams(window.location.search)
    const tasksDataParam = params.get('tasks')
    
    if (tasksDataParam) {
      try {
        const tasksData = JSON.parse(decodeURIComponent(tasksDataParam))
        setTasks(Array.isArray(tasksData) ? tasksData : [tasksData])
      } catch (error) {
        console.error('Error parsing tasks data:', error)
      }
    }
    setLoading(false)
  }, [])

  const handleClose = () => {
    window.close()
  }

  if (loading) {
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
        <CircularProgress />
      </Box>
    )
  }

  if (!tasks || tasks.length === 0) {
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
          Task Comparison - {tasks.length} Task{tasks.length > 1 ? 's' : ''}
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

      {/* Content - Side by Side Grid */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
        }}
      >
        <Grid container spacing={2}>
          {tasks.map((task, index) => (
            <Grid 
              size={{ 
                xs: 12, 
                md: tasks.length > 1 ? 6 : 12, 
                lg: tasks.length > 2 ? 4 : tasks.length > 1 ? 6 : 12 
              }} 
              key={task.taskId || index}
            >
              <Box
                sx={{
                  height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                }}
              >
                {/* Task Header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {task.taskId}
                  </Typography>
                </Box>
                
                {/* Task Details */}
                <Box sx={{ p: 2 }}>
                  <TaskDetails 
                    task={task}
                    compact={tasks.length > 1}
                    fieldNotesExpanded={fieldNotesExpanded}
                    progressNotesExpanded={progressNotesExpanded}
                    onFieldNotesExpandedChange={setFieldNotesExpanded}
                    onProgressNotesExpandedChange={setProgressNotesExpanded}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
