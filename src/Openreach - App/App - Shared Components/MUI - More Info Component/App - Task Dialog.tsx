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
import { TaskDetails } from './TaskDetails'
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="task-dialog-title">
      <DialogContent dividers sx={{ bgcolor: theme.palette.background.default, p: 0 }}>
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

export default AppTaskDialog
