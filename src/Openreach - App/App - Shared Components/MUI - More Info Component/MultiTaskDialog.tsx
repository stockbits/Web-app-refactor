import { type ReactNode, useState } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  useTheme,
  Typography,
  Box,
  Stack,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import CallToActionRoundedIcon from '@mui/icons-material/CallToActionRounded'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'
import { TaskDetails } from './TaskDetails'

export interface MultiTaskDialogProps {
  open: boolean
  onClose: () => void
  tasks: (TaskTableRow | null)[]
  loading?: boolean
  actions?: ReactNode
  onMinimize?: () => void
  onAddNote?: (taskId: string, type: 'field' | 'progress', text: string) => void
}

export function MultiTaskDialog({
  open,
  onClose,
  tasks,
  loading = false,
  actions,
  onMinimize,
  onAddNote,
}: MultiTaskDialogProps) {
  const theme = useTheme()
  const modeTokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens

  // Shared expansion state for synchronized note sections
  const [fieldNotesExpanded, setFieldNotesExpanded] = useState(false)
  const [progressNotesExpanded, setProgressNotesExpanded] = useState(false)

  const handleAddNote = (index: number, type: 'field' | 'progress', text: string) => {
    const task = tasks[index]
    if (task) {
      onAddNote?.(task.taskId, type, text)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" aria-labelledby="multi-task-dialog-title">
      <DialogTitle id="multi-task-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 6, pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Task Comparison ({tasks.length} tasks)
        </Typography>
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: theme.palette.text.secondary,
            bgcolor: 'transparent',
            '&:hover': { color: theme.palette.text.primary, bgcolor: 'transparent' },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
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
                loading={loading}
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
            startIcon={<CallToActionRoundedIcon />}
            sx={{ minWidth: 140 }}
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