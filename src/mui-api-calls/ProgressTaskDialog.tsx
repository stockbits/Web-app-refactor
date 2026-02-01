import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Autocomplete,
  TextField,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import UpdateIcon from '@mui/icons-material/Update'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { TaskTableRow, TaskStatusCode } from '../Openreach - App/App - Data Tables/Task - Table'
import { TASK_STATUS_LABELS } from '../Openreach - App/App - Data Tables/Task - Table'
import { RESOURCE_TABLE_ROWS } from '../Openreach - App/App - Data Tables/Resource - Table'
import { getTaskStatusLabel } from '../Openreach - App/App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import '../AppCentralTheme' // Import theme types for TypeScript

interface ProgressTaskDialogProps {
  open: boolean
  onClose: () => void
  tasks: TaskTableRow[]
  onProgressComplete: (
    updatedTaskIds: string[], 
    newStatus: TaskStatusCode, 
    resourceId?: string,
    resourceName?: string,
    awaitingConfirmation?: 'Y' | 'N',
    serverUpdates?: Array<{
      taskId: string;
      progressNote?: { id: string; author: string; createdAt: string; text: string };
    }>
  ) => void;
}

// Define combined status option (includes ACT sub-states)
type CombinedStatusValue = 
  | 'ACT-assigned' 
  | 'ACT-not-assigned' 
  | 'ACT-waiting-confirmation'
  | TaskStatusCode

interface StatusOption {
  value: CombinedStatusValue
  label: string
  status: TaskStatusCode
  awaitingConfirmation?: 'Y' | 'N'
  requiresResource?: boolean
  clearsResource?: boolean
}

// Define valid status transitions (workflow rules)
const STATUS_TRANSITIONS: Record<TaskStatusCode, TaskStatusCode[]> = {
  ACT: ['AWI', 'ISS', 'EXC', 'COM', 'FUR', 'CMN', 'HPD', 'HLD', 'CPD', 'DLG', 'CAN'],
  AWI: ['ACT', 'ISS', 'EXC', 'COM', 'FUR', 'CMN', 'HPD', 'HLD', 'CPD', 'DLG', 'CAN'],
  ISS: ['ACT', 'AWI', 'EXC', 'COM', 'FUR', 'CMN', 'HPD', 'HLD', 'CPD', 'DLG', 'CAN'],
  EXC: ['ACT', 'AWI', 'ISS', 'COM', 'FUR', 'CMN', 'HPD', 'HLD', 'CPD', 'DLG', 'CAN'],
  COM: ['ACT'], // Completed tasks can be reopened
  FUR: ['ACT', 'AWI', 'ISS', 'EXC', 'COM', 'CMN', 'HPD', 'HLD', 'CPD', 'DLG', 'CAN'],
  CMN: ['ACT', 'AWI', 'ISS', 'EXC', 'COM', 'FUR', 'HPD', 'HLD', 'CPD', 'DLG', 'CAN'],
  HPD: ['ACT', 'AWI', 'ISS', 'EXC', 'COM', 'FUR', 'CMN', 'HLD', 'CPD', 'DLG', 'CAN'],
  HLD: ['ACT', 'AWI', 'ISS', 'EXC', 'COM', 'FUR', 'CMN', 'HPD', 'CPD', 'DLG', 'CAN'],
  CPD: ['ACT', 'AWI', 'ISS', 'EXC', 'COM', 'FUR', 'CMN', 'HPD', 'HLD', 'DLG', 'CAN'],
  DLG: ['ACT', 'AWI', 'ISS', 'EXC', 'COM', 'FUR', 'CMN', 'HPD', 'HLD', 'CPD', 'CAN'],
  CAN: ['ACT'], // Cancelled tasks can be reopened
}

export function ProgressTaskDialog({ open, onClose, tasks, onProgressComplete }: ProgressTaskDialogProps) {
  const [selectedCombinedStatus, setSelectedCombinedStatus] = useState<CombinedStatusValue | ''>('')
  const [selectedResource, setSelectedResource] = useState<{ resourceId: string; resourceName: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null)
  const task = tasks[0] // For single task progression
  const isBulk = tasks.length > 1
  
  // Handle status selection and auto-clear resource for ACT - Not Assigned
  const handleStatusChange = (value: CombinedStatusValue) => {
    setSelectedCombinedStatus(value)
    // Auto-clear resource when ACT - Not Assigned is selected
    if (value === 'ACT-not-assigned') {
      setSelectedResource(null)
    }
  }

  // Get available resources filtered by task domain and division
  const availableResources = RESOURCE_TABLE_ROWS.filter(
    resource => 
      resource.domainId === task?.domainId &&
      resource.division === task?.division &&
      (resource.workingStatus === 'Signed on' || resource.workingStatus === 'Signed on no work')
  )

  // Build combined status options
  const getStatusOptions = (currentStatus: TaskStatusCode): StatusOption[] => {
    const validNextStatuses = STATUS_TRANSITIONS[currentStatus] || []
    const options: StatusOption[] = []
    
    // ACT sub-states
    if (currentStatus === 'ACT' || validNextStatuses.includes('ACT')) {
      options.push(
        {
          value: 'ACT-assigned',
          label: 'Assigned',
          status: 'ACT',
          awaitingConfirmation: 'N',
          requiresResource: true,
        },
        {
          value: 'ACT-waiting-confirmation',
          label: 'Waiting for Confirmation',
          status: 'ACT',
          awaitingConfirmation: 'Y',
          requiresResource: true,
        },
        {
          value: 'ACT-not-assigned',
          label: 'Not Assigned',
          status: 'ACT',
          awaitingConfirmation: 'N',
          clearsResource: true,
        }
      )
    }
    
    // All other statuses
    const allStatuses: TaskStatusCode[] = ['AWI', 'ISS', 'EXC', 'COM', 'FUR', 'HPD', 'HLD', 'CPD', 'CMN', 'DLG', 'CAN']
    allStatuses.forEach(status => {
      if (validNextStatuses.includes(status)) {
        options.push({
          value: status,
          label: TASK_STATUS_LABELS[status],
          status,
          awaitingConfirmation: 'N',
        })
      }
    })
    
    return options
  }

  const availableStatusOptions = task ? getStatusOptions(task.status) : []

  // Reset form when dialog opens
  useEffect(() => {
    if (open && task) {
      setSelectedCombinedStatus('')
      const currentResource = task.resourceId 
        ? availableResources.find(r => r.resourceId === task.resourceId) || null
        : null
      setSelectedResource(currentResource)
      setError(null)
    }
  }, [open, task])

  const handleProgress = async () => {
    if (!task || !selectedCombinedStatus) return
    
    setLoading(true)
    setError(null)

    try {
      // Find the selected status option
      const selectedOption = availableStatusOptions.find(opt => opt.value === selectedCombinedStatus)
      if (!selectedOption) {
        setError('Invalid status selection')
        setLoading(false)
        return
      }

      const finalStatus = selectedOption.status
      const finalAwaitingConfirmation = selectedOption.awaitingConfirmation || 'N'
      
      // Handle resource validation
      let finalResourceId: string | undefined = selectedResource?.resourceId
      let finalResourceName: string | undefined = selectedResource?.resourceName
      
      // If status requires resource, validate
      if (selectedOption.requiresResource && !selectedResource) {
        setError(`${selectedOption.label} requires a resource to be selected`)
        setLoading(false)
        return
      }
      
      // If status clears resource, explicitly set to undefined
      if (selectedOption.clearsResource) {
        finalResourceId = undefined
        finalResourceName = undefined
      }
      
      // If no new resource selected and not clearing, preserve existing
      if (!selectedResource && !selectedOption.clearsResource && task.resourceId) {
        finalResourceId = task.resourceId
        finalResourceName = task.resourceName
      }

      // Call backend API to progress the task
      const response = await fetch('/api/progress-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskIds: tasks.map(t => t.taskId),
          newStatus: finalStatus,
          resourceId: finalResourceId,
          resourceName: finalResourceName,
          userName: 'User', // In real app, get from auth context
          awaitingConfirmation: finalAwaitingConfirmation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to progress task')
      }

      console.log('Task progressed successfully:', data)

      // Trigger data refresh with updated task info and progress notes from server
      onProgressComplete(
        tasks.map(t => t.taskId), 
        finalStatus,
        finalResourceId,
        finalResourceName,
        finalAwaitingConfirmation,
        Array.isArray(data?.updates) ? data.updates : undefined // Pass server response with progress notes
      )
      onClose()
    } catch (err) {
      console.error('Error progressing task:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!task) return null

  const infoOpen = Boolean(infoAnchorEl)
  const selectedOption = availableStatusOptions.find(opt => opt.value === selectedCombinedStatus)

  return (
    <>
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: { xs: '95vh', sm: '90vh', md: '85vh' },
          m: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' }
        }
      }}
    >
      <DialogTitle sx={{ pb: 2, pt: 2.5, px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="h6" sx={{ flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isBulk ? `${tasks.length} Tasks` : task.taskId}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => setInfoAnchorEl(e.currentTarget)}
            sx={{ color: 'primary.main', flexShrink: 0 }}
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 3, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          {/* Status Selection - Moved to top */}
          <Box sx={{ pt: 1 }}>
            <Autocomplete
              value={availableStatusOptions.find(opt => opt.value === selectedCombinedStatus) || null}
              onChange={(_, newValue) => {
                if (newValue) {
                  handleStatusChange(newValue.value)
                }
              }}
              options={availableStatusOptions}
              getOptionLabel={(option) => option.label}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="New Status *"
                  placeholder="Select status..."
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      backgroundColor: 'background.paper',
                      px: 0.5,
                      ml: -0.5
                    }
                  }}
                />
              )}
            />
          </Box>

          {/* Resource Selection */}
          <Box>
            <Autocomplete
              options={availableResources}
              getOptionLabel={(option) => `${option.resourceName} (${option.resourceId})`}
              value={selectedResource}
              onChange={(_, newValue) => setSelectedResource(newValue)}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pin to Resource"
                  placeholder="Type to search..."
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      backgroundColor: 'background.paper',
                      px: 0.5,
                      ml: -0.5
                    }
                  }}
                />
              )}
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase()
                return options.filter(
                  option =>
                    option.resourceName.toLowerCase().includes(searchTerm) ||
                    option.resourceId.toLowerCase().includes(searchTerm)
                )
              }}
            />
          </Box>

          {/* Task List Preview */}
          {isBulk && (
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 500 }}>
                Tasks being updated: {tasks.length}
              </Typography>
              <Stack 
                spacing={0.75} 
                sx={{ 
                  maxHeight: tasks.length > 4 ? '200px' : 'auto',
                  overflowY: tasks.length > 4 ? 'auto' : 'visible',
                  pr: tasks.length > 4 ? 1 : 0,
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'action.hover',
                    borderRadius: '4px'
                  }
                }}
              >
                {[...tasks]
                  .sort((a, b) => {
                    // Sort by status to group similar states together
                    const statusOrder: Record<string, number> = {
                      'ACT': 1, 'AWI': 2, 'ISS': 3, 'EXC': 4, 'COM': 5,
                      'FUR': 6, 'CMN': 7, 'HPD': 8, 'HLD': 9, 'CPD': 10, 'DLG': 11, 'CAN': 12
                    }
                    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
                  })
                  .map((t) => (
                    <Box 
                      key={t.taskId}
                      sx={{ 
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: { xs: 0.5, sm: 2 },
                        py: { xs: 1, sm: 0.75 },
                        px: { xs: 1.5, sm: 1.5 },
                        bgcolor: 'action.hover',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ flexShrink: 0 }}>
                        {t.taskId}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 0.75, sm: 1 }, 
                        flexWrap: 'wrap',
                        width: { xs: '100%', sm: 'auto' }
                      }}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            minWidth: { xs: 'auto', sm: '140px' }, 
                            textAlign: { xs: 'left', sm: 'right' }
                          }}
                        >
                          {getTaskStatusLabel(t)}
                        </Typography>
                        {selectedOption && (
                          <>
                            <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.secondary', mx: { xs: 0, sm: 0.5 } }} />
                            <Typography variant="caption" fontWeight={600}>
                              {selectedOption.label}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  ))}
              </Stack>
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, px: { xs: 2, sm: 3 }, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} disabled={loading} sx={{ minWidth: { xs: '100px', sm: '80px' } }}>
          Cancel
        </Button>
        <Button 
          onClick={handleProgress}
          variant="contained"
          disabled={!selectedCombinedStatus || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <UpdateIcon />}
          sx={{ minWidth: { xs: '100px', sm: '100px' } }}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Status Info Popover */}
    <Popover
      open={infoOpen}
      anchorEl={infoAnchorEl}
      onClose={() => setInfoAnchorEl(null)}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: { maxWidth: 450, maxHeight: 500 }
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Task Status Guide
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Understanding what each status means and when to use it.
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Active (ACT)</Typography>}
              secondary={
                <Box component="span">
                  <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                    • <strong>Assigned:</strong> Task scheduled with a resource
                  </Typography>
                  <Typography variant="body2" component="div">
                    • <strong>Waiting for Confirmation:</strong> Pre-assigned, awaiting resource acceptance
                  </Typography>
                  <Typography variant="body2" component="div">
                    • <strong>Not Assigned:</strong> Task available but no resource assigned yet
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Awaiting Issue (AWI)</Typography>}
              secondary="Task is ready to be issued to the resource for work to begin"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Issued (ISS)</Typography>}
              secondary="Task has been issued to the resource and work can commence"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Executing (EXC)</Typography>}
              secondary="Resource is actively working on the task"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Completed (COM)</Typography>}
              secondary="Task has been successfully completed"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Furthered (FUR)</Typography>}
              secondary="Work sent back for additional action or information"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Comment (CMN)</Typography>}
              secondary="Task has a note or comment that requires attention"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Held Pending (HPD)</Typography>}
              secondary="Task temporarily on hold awaiting information or resources"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>On Hold (HLD)</Typography>}
              secondary="Task paused and cannot proceed at this time"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Copied (CPD)</Typography>}
              secondary="Task has been duplicated for tracking or reference"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Delegated (DLG)</Typography>}
              secondary="Task has been reassigned to another team or department"
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle2" fontWeight={600}>Cancelled (CAN)</Typography>}
              secondary="Task has been cancelled and will not be completed"
            />
          </ListItem>
        </List>
      </Box>
    </Popover>
    </>
  )
}
