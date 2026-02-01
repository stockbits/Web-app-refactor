import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonIcon from '@mui/icons-material/Person'
import UpdateIcon from '@mui/icons-material/Update'
import type { TaskTableRow, TaskStatusCode } from '../App - Data Tables/Task - Table'
import { TASK_STATUS_LABELS } from '../App - Data Tables/Task - Table'
import type { ResourceTableRow } from '../App - Data Tables/Resource - Table'
import { RESOURCE_TABLE_ROWS } from '../App - Data Tables/Resource - Table'

interface ProgressTaskDialogProps {
  open: boolean
  onClose: () => void
  tasks: TaskTableRow[]
  onProgressComplete: () => void
}

// Define valid status transitions (workflow rules)
const STATUS_TRANSITIONS: Record<TaskStatusCode, TaskStatusCode[]> = {
  'ACT': ['AWI', 'ISS', 'COM'],
  'AWI': ['ACT', 'ISS', 'COM'],
  'ISS': ['ACT', 'COM'],
  'EXC': ['ACT', 'COM'],
  'COM': [], // Completed tasks cannot be changed
}

export function ProgressTaskDialog({ open, onClose, tasks, onProgressComplete }: ProgressTaskDialogProps) {
  const theme = useTheme()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusCode | ''>('')
  const [selectedResource, setSelectedResource] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const task = tasks[0] // For single task progression
  const isBulk = tasks.length > 1

  // Get available resources filtered by task domain and division
  const availableResources = RESOURCE_TABLE_ROWS.filter(
    resource => 
      resource.domainId === task?.domainId &&
      resource.division === task?.division &&
      resource.workingStatus === 'Signed on'
  )

  // Get valid next statuses based on current status
  const availableStatuses = task ? STATUS_TRANSITIONS[task.status] || [] : []

  // Reset form when dialog opens
  useEffect(() => {
    if (open && task) {
      setSelectedStatus('')
      setSelectedResource(task.resourceId || '')
      setError(null)
    }
  }, [open, task])

  const handleProgress = async () => {
    if (!task || !selectedStatus) return

    setLoading(true)
    setError(null)

    try {
      // Call backend API to progress the task
      const response = await fetch('/api/progress-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskIds: tasks.map(t => t.taskId),
          newStatus: selectedStatus,
          resourceId: selectedResource || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to progress task')
      }

      console.log('Task progressed successfully:', data)

      // Show success notification
      const notification = document.createElement('div')
      notification.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#4CAF50;color:white;padding:20px 40px;border-radius:8px;z-index:9999;text-align:center;border:2px solid #45a049'
      notification.innerHTML = `
        <div style="font-size:18px;font-weight:600;margin-bottom:8px">✓ Task${isBulk ? 's' : ''} Progressed</div>
        <div style="font-size:14px;opacity:0.9">${isBulk ? tasks.length + ' tasks' : task.taskId} updated to ${TASK_STATUS_LABELS[selectedStatus]}</div>
      `
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 3000)

      // Trigger data refresh
      onProgressComplete()
      onClose()
    } catch (err) {
      console.error('Error progressing task:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!task) return null

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <UpdateIcon sx={{ color: theme.openreach.energyAccent }} />
          <Typography variant="h6" fontWeight={600}>
            Progress Task{isBulk ? 's' : ''}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Task Info */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isBulk ? `${tasks.length} Tasks Selected` : 'Task Details'}
            </Typography>
            <Box sx={{ mt: 1, p: 2, bgcolor: theme.palette.background.default, borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
              {!isBulk && (
                <>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                    {task.taskId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {task.postCode} • {task.primarySkill}
                  </Typography>
                </>
              )}
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">Current Status:</Typography>
                <Chip 
                  label={TASK_STATUS_LABELS[task.status]}
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: theme.openreach.coreBlock,
                    color: theme.palette.common.white,
                  }}
                />
              </Stack>
            </Box>
          </Box>

          <Divider />

          {/* Status Selection */}
          <FormControl fullWidth>
            <InputLabel>New Status *</InputLabel>
            <Select
              value={selectedStatus}
              label="New Status *"
              onChange={(e) => setSelectedStatus(e.target.value as TaskStatusCode)}
              disabled={loading}
            >
              {availableStatuses.length === 0 ? (
                <MenuItem disabled>No valid transitions available</MenuItem>
              ) : (
                availableStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: theme.openreach.energyAccent }} />
                      <Typography>{TASK_STATUS_LABELS[status]}</Typography>
                    </Stack>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Resource Selection */}
          <FormControl fullWidth>
            <InputLabel>Assign Resource</InputLabel>
            <Select
              value={selectedResource}
              label="Assign Resource"
              onChange={(e) => setSelectedResource(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>Keep Current ({task.resourceName || 'Unassigned'})</em>
              </MenuItem>
              {availableResources.map((resource) => (
                <MenuItem key={resource.resourceId} value={resource.resourceId}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                    <Typography>{resource.resourceName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({resource.resourceId})
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {availableResources.length === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                No available resources in {task.domainId} ({task.division})
              </Typography>
            )}
          </FormControl>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Info */}
          <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
            {isBulk 
              ? `All ${tasks.length} tasks will be updated to the selected status${selectedResource ? ' and assigned to the selected resource' : ''}.`
              : `This will update the task status${selectedResource ? ' and resource assignment' : ''} in the system.`
            }
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        borderTop: `1px solid ${theme.palette.divider}`,
      }}>
        <Button 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleProgress}
          variant="contained"
          disabled={!selectedStatus || loading || availableStatuses.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : <UpdateIcon />}
          sx={{
            bgcolor: theme.openreach.energyAccent,
            '&:hover': {
              bgcolor: theme.openreach.coreBlock,
            }
          }}
        >
          {loading ? 'Progressing...' : `Progress Task${isBulk ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
