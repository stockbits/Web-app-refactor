import { useMemo, useState, type ReactNode } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  Button,
  useTheme,
  TextField,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import RoomRoundedIcon from '@mui/icons-material/RoomRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded'
import { TaskIcon, type TaskIconVariant } from '../MUI - Icon and Key/MUI - Icon'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'

// Using theme.openreach tokens directly

export interface AppTaskDialogProps {
  open: boolean
  onClose: () => void
  task?: TaskTableRow | null
  loading?: boolean
  actions?: ReactNode
  onMinimize?: () => void
  onAddNote?: (type: 'field' | 'progress', text: string) => void
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Status pill removed; commit-type icon color now reflects commit type

export function AppTaskDialog({ open, onClose, task, loading = false, actions, onMinimize, onAddNote }: AppTaskDialogProps) {
  const theme = useTheme()
  const modeTokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens

  const [fieldNoteDraft, setFieldNoteDraft] = useState('')
  const [progressNoteDraft, setProgressNoteDraft] = useState('')

  // Status pill removed from header

  const dialogIconVariant = useMemo<TaskIconVariant>(() => {
    switch (task?.commitType) {
      case 'START BY':
        return 'startBy'
      case 'COMPLETE BY':
        return 'completeBy'
      case 'TAIL':
        return 'failedSLA'
      default:
        return 'appointment'
    }
  }, [task?.commitType])

  const fieldNotesList = useMemo(() => {
    const notes = task?.fieldNotes ?? []
    return [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [task?.fieldNotes])
  const progressNotesList = useMemo(() => {
    const notes = task?.progressNotes ?? []
    return [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [task?.progressNotes])

  const addNote = (type: 'field' | 'progress') => {
    const text = type === 'field' ? fieldNoteDraft.trim() : progressNoteDraft.trim()
    if (!text) return
    onAddNote?.(type, text)
    if (type === 'field') {
      setFieldNoteDraft('')
    } else {
      setProgressNoteDraft('')
    }
  }

  const renderSkeleton = (width: number | string = '100%') => <Skeleton variant="rounded" width={width} height={18} />

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="task-dialog-title">
      <DialogTitle id="task-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 6, pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" flex={1} minWidth={0}>
          <TaskIcon variant={dialogIconVariant} size={32} />
          <Stack spacing={0.25} minWidth={0} flex={1}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {task?.taskId ?? 'Task details'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" divider={<Divider flexItem orientation="vertical" />}>
              <Typography variant="body2" color="text.secondary" noWrap>
                {task?.workId ?? '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Updated {task?.updatedAt ? formatDate(task.updatedAt) : '—'}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
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

      <DialogContent dividers sx={{ bgcolor: theme.palette.background.default, p: 0 }}>
        <Stack spacing={0}>
          <Stack spacing={2.5} sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="flex-start">
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <AccessTimeRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Schedule
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Commit type
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {loading ? renderSkeleton(120) : task?.commitType ?? '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Commit date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {loading ? renderSkeleton(160) : formatDate(task?.commitDate)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <RoomRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Location
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Postcode
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {loading ? renderSkeleton(120) : task?.postCode ?? '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Coordinates
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {loading
                        ? renderSkeleton(140)
                        : task
                        ? `Lat ${task.taskLatitude.toFixed(4)}, Lon ${task.taskLongitude.toFixed(4)}`
                        : '—'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <PersonRoundedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Assigned team
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} divider={<Divider flexItem orientation="vertical" />}>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Resource
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {loading ? renderSkeleton(160) : task?.resourceName || 'Unassigned'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Division
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {loading ? renderSkeleton(120) : task?.division ?? '—'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>

          <Accordion
            defaultExpanded={false}
            sx={{
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" width="100%">
                <Stack direction="row" spacing={1} alignItems="center">
                  <StickyNote2RoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Field notes
                  </Typography>
                </Stack>
                <Chip size="small" label={loading ? '…' : `${fieldNotesList.length}`} variant="outlined" />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.25}>
                <Stack spacing={0.75} sx={{ maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
                  {loading ? (
                    <>{renderSkeleton('100%')}{renderSkeleton('85%')}</>
                  ) : fieldNotesList.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <StickyNote2RoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No field notes yet
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Add notes to track field activities
                      </Typography>
                    </Box>
                  ) : (
                    fieldNotesList.map((note) => (
                      <Box key={note.id} sx={{ p: 1.5, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                          {note.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {note.author} • {formatDate(note.createdAt)}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>
                {onAddNote && !loading && (
                  <Stack spacing={0.5}>
                    <TextField
                      value={fieldNoteDraft}
                      onChange={(e) => setFieldNoteDraft(e.target.value)}
                      placeholder="Add a field note..."
                      size="small"
                      multiline
                      minRows={2}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: theme.palette.background.default } }}
                    />
                    <Stack direction="row" justifyContent="flex-end">
                      <Button onClick={() => addNote('field')} size="small" variant="contained" color="primary" disabled={!fieldNoteDraft.trim()}>
                        Add note
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion
            defaultExpanded={false}
            sx={{
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" width="100%">
                <Stack direction="row" spacing={1} alignItems="center">
                  <TimelineRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Progress notes
                  </Typography>
                </Stack>
                <Chip size="small" label={loading ? '…' : `${progressNotesList.length}`} variant="outlined" />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.25}>
                <Stack spacing={0.75} sx={{ maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
                  {loading ? (
                    <>{renderSkeleton('100%')}{renderSkeleton('85%')}</>
                  ) : progressNotesList.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <TimelineRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No progress notes yet
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Track task progress and updates
                      </Typography>
                    </Box>
                  ) : (
                    progressNotesList.map((note) => (
                      <Box key={note.id} sx={{ p: 1.5, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                          {note.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {note.author} • {formatDate(note.createdAt)}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>
                {onAddNote && !loading && (
                  <Stack spacing={0.5}>
                    <TextField
                      value={progressNoteDraft}
                      onChange={(e) => setProgressNoteDraft(e.target.value)}
                      placeholder="Add a progress note..."
                      size="small"
                      multiline
                      minRows={2}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: theme.palette.background.default } }}
                    />
                    <Stack direction="row" justifyContent="flex-end">
                      <Button onClick={() => addNote('progress')} size="small" variant="contained" color="primary" disabled={!progressNoteDraft.trim()}>
                        Add note
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}` }}>
        {actions}
        <Box sx={{ flex: 1 }} />
        {onMinimize && (
          <Button
            onClick={() => {
              onMinimize()
              onClose()
            }}
            variant="outlined"
            color="primary"
            startIcon={<MinimizeRoundedIcon />}
            sx={{ minWidth: 140 }}
          >
            Minimise Task
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
