import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import type { TaskTableRow } from '../Openreach - App/App - Data Tables/Task - Table'

interface QuickAddNotesDialogProps {
  open: boolean
  onClose: () => void
  tasks: TaskTableRow[]
  onNotesAdded: (
    taskIds: string[],
    serverUpdates?: Array<{
      taskId: string;
      progressNote?: { id: string; author: string; createdAt: string; text: string };
    }>
  ) => void
}

export function QuickAddNotesDialog({ open, onClose, tasks, onNotesAdded }: QuickAddNotesDialogProps) {
  const [note, setNote] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isBulk = tasks.length > 1

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNote('')
      setError(null)
    }
  }, [open])

  const handleSubmit = async () => {
    const trimmedNote = note.trim()
    
    if (!trimmedNote) {
      setError('Please enter a note')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call backend API to add notes
      const response = await fetch('/api/add-task-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskIds: tasks.map(t => t.taskId),
          note: trimmedNote,
          userName: 'User', // In real app, get from auth context
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add notes')
      }

      console.log('Notes added successfully:', data)

      // Trigger data refresh
      onNotesAdded(
        tasks.map(t => t.taskId),
        Array.isArray(data?.updates) ? data.updates : undefined
      )
      onClose()
    } catch (err) {
      console.error('Error adding notes:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle Enter key to submit (Ctrl/Cmd + Enter for multiline)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (tasks.length === 0) return null

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={window.innerWidth < 600}
      PaperProps={{
        sx: {
          height: { xs: '100%', sm: 'auto' },
          maxHeight: { xs: '100%', sm: '90vh' },
          m: 0
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAddIcon color="primary" />
          <Typography variant="h6" component="span">
            Quick Add Note
          </Typography>
        </Box>
        {isBulk && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Adding note to {tasks.length} tasks
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={4}
          label="Note *"
          placeholder={isBulk ? "This note will be added to all selected tasks..." : "Enter your note..."}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          inputProps={{ maxLength: 500 }}
          helperText={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>{note.length}/500 characters</span>
              <span style={{ opacity: 0.7 }}>Ctrl+Enter to submit</span>
            </Box>
          }
          error={!!error && !note.trim()}
          sx={{
            '& .MuiOutlinedInput-root': {
              minHeight: { xs: '120px', sm: '100px' }
            }
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ minWidth: { xs: '100px', sm: '80px' } }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!note.trim() || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <NoteAddIcon />}
          sx={{ minWidth: { xs: '100px', sm: '100px' } }}
        >
          {loading ? 'Adding...' : 'Add Note'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
