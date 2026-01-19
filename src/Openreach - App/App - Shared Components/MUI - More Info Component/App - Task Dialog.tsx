import { type ReactNode } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  useTheme,
  Box,
} from '@mui/material'
import CallToActionRoundedIcon from '@mui/icons-material/CallToActionRounded'
import { TaskDetails } from './App - Task Details'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'

export interface AppTaskDialogProps {
  open: boolean
  onClose: () => void
  task?: TaskTableRow | null
  loading?: boolean
  actions?: ReactNode
  onMinimize?: () => void
  onAddNote?: (type: 'field' | 'progress', text: string) => void
}

export function AppTaskDialog({ open, onClose, task, loading = false, actions, onMinimize, onAddNote }: AppTaskDialogProps) {
  const theme = useTheme()
  const modeTokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens

  const dialogTitle = task ? `Task ${task.taskId}` : 'Task Details'

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md" 
      aria-labelledby="task-dialog-title"
      aria-describedby="task-dialog-content"
      scroll="paper"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: theme.shape.borderRadius,
        }
      }}
    >
      <Box 
        id="task-dialog-title" 
        sx={{ 
          position: 'absolute', 
          left: -10000, 
          top: 'auto', 
          width: 1, 
          height: 1, 
          overflow: 'hidden' 
        }}
      >
        {dialogTitle}
      </Box>
      <DialogContent 
        id="task-dialog-content"
        dividers 
        sx={{ 
          bgcolor: theme.palette.background.default, 
          p: 0,
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
          }
        }}
      >
        <TaskDetails task={task} loading={loading} onAddNote={onAddNote} />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, gap: 1.5, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}` }}>
        {actions}
        <Box sx={{ flex: 1 }} />
        {onMinimize && (
          <Button
            onClick={onMinimize}
            variant="outlined"
            color="primary"
            aria-label="Minimize task dialog"
            startIcon={
              <CallToActionRoundedIcon
                sx={{
                  transition: 'none', // Prevent icon color transitions
                  '&:hover': {
                    opacity: 0.8,
                  },
                  '&:active': {
                    opacity: 0.6,
                  },
                }}
              />
            }
            sx={{
              minWidth: 140,
              '& .MuiButton-startIcon': {
                transition: 'none', // Prevent icon container transitions
              },
            }}
          >
            Minimise
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          aria-label="Close task dialog"
          sx={{ minWidth: 100 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AppTaskDialog
