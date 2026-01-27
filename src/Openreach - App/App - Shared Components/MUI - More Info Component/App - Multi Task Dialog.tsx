import { type ReactNode, useState, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  useTheme,
  Typography,
  Box,
  Stack,
} from '@mui/material'
import CallToActionRoundedIcon from '@mui/icons-material/CallToActionRounded'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'
import { TaskDetails } from './App - Task Details'

export interface MultiTaskDialogProps {
  open: boolean
  onClose: () => void
  tasks: (TaskTableRow | null)[]
  actions?: ReactNode
  onMinimize?: () => void
  onAddNote?: (taskId: string, type: 'field' | 'progress', text: string) => void
}

export function MultiTaskDialog({
  open,
  onClose,
  tasks,
  actions,
  onMinimize,
  onAddNote,
}: MultiTaskDialogProps) {
  const theme = useTheme()
  const modeTokens = useMemo(
    () => (theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens),
    [theme.palette.mode, theme.openreach]
  )

  const [fieldNotesExpanded, setFieldNotesExpanded] = useState(false)
  const [progressNotesExpanded, setProgressNotesExpanded] = useState(false)

  const handleAddNote = useCallback(
    (index: number, type: 'field' | 'progress', text: string) => {
      const task = tasks[index]
      if (task) {
        onAddNote?.(task.taskId, type, text)
      }
    },
    [tasks, onAddNote]
  )

  return (
    <Dialog key={open ? 'open' : 'closed'} open={open} onClose={onClose} fullWidth maxWidth="xl" aria-labelledby="multi-task-dialog-title">
      <DialogTitle id="multi-task-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Typography variant="h6" component="div" fontWeight={700}>
          Task Comparison ({tasks.length} tasks)
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: theme.palette.background.default, p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap>
          {tasks.map((task, index) => (
            <Box
              key={task?.taskId || index}
              sx={{
                flex: 1,
                border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: theme.palette.background.paper,
              }}
            >
              <TaskDetails
                task={task}
                onAddNote={onAddNote ? (type, text) => handleAddNote(index, type, text) : undefined}
                compact={tasks.length > 1}
                fieldNotesExpanded={fieldNotesExpanded}
                progressNotesExpanded={progressNotesExpanded}
                onFieldNotesExpandedChange={setFieldNotesExpanded}
                onProgressNotesExpandedChange={setProgressNotesExpanded}
              />
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, gap: 1.5, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}` }}>
        {actions}
        <Box sx={{ flex: 1 }} />
        {onMinimize && (
          <Button
            onClick={onMinimize}
            variant="outlined"
            color="primary"
            startIcon={
              <CallToActionRoundedIcon
                sx={{
                  fontSize: 24,
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
          sx={{ minWidth: 100 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MultiTaskDialog