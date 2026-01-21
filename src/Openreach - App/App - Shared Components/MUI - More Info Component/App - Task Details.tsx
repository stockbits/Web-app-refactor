import { useMemo, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
  Button,
  useTheme,
  TextField,
} from '@mui/material'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import RoomRoundedIcon from '@mui/icons-material/RoomRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import type { TaskTableRow } from '../../App - Data Tables/Task - Table'

export interface TaskDetailsProps {
  task?: TaskTableRow | null
  loading?: boolean
  onAddNote?: (type: 'field' | 'progress', text: string) => void
  compact?: boolean
  fieldNotesExpanded?: boolean
  progressNotesExpanded?: boolean
  onFieldNotesExpandedChange?: (expanded: boolean) => void
  onProgressNotesExpandedChange?: (expanded: boolean) => void
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

const renderSkeleton = (width: number | string = '100%') => <Skeleton variant="rounded" width={width} height={18} />

export function TaskDetails({ task, loading = false, onAddNote, compact = false, fieldNotesExpanded, progressNotesExpanded, onFieldNotesExpandedChange, onProgressNotesExpandedChange }: TaskDetailsProps) {
  const theme = useTheme()
  const modeTokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens

  const [fieldNoteDraft, setFieldNoteDraft] = useState('')
  const [progressNoteDraft, setProgressNoteDraft] = useState('')

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

  const spacing = compact ? 1 : 1.5
  const padding = compact ? 1 : 1.5
  const notesHeight = compact ? 120 : 150

  return (
    <Stack spacing={0} sx={{ minWidth: 0 }}>
      {/* Task Header */}
      <Box sx={{
        p: { xs: padding * 0.75, sm: padding },
        borderBottom: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`
      }}>
        <Stack spacing={0.5}>
          <Typography
            variant="h6"
            fontWeight={700}
            noWrap
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              lineHeight: 1.2,
              color: 'text.primary'
            }}
          >
            {task?.taskId ?? 'Task details'}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.25, sm: 1 }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            divider={compact ? undefined : <Divider flexItem orientation="vertical" />}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 500
              }}
            >
              Work ID: {task?.workId ?? '—'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 500
              }}
            >
              Updated: {task?.updatedAt ? formatDate(task.updatedAt) : '—'}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content */}
      <Stack spacing={{ xs: spacing * 0.75, sm: spacing }} sx={{ p: { xs: padding * 0.75, sm: padding } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: spacing * 0.75, sm: spacing }} alignItems="flex-start">
          <Box
            sx={{
              flex: 1,
              p: { xs: padding * 0.75, sm: padding },
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <AccessTimeRoundedIcon fontSize="small" color="primary" />
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Schedule
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={0.5}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Commit type
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {loading ? renderSkeleton(120) : task?.commitType ?? '—'}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={0.5}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Commit date
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {loading ? renderSkeleton(160) : formatDate(task?.commitDate)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: { xs: padding * 0.75, sm: padding },
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <RoomRoundedIcon fontSize="small" color="primary" />
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Location
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={0.5}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Postcode
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {loading ? renderSkeleton(120) : task?.postCode ?? '—'}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={0.5}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Coordinates
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    wordBreak: 'break-all'
                  }}
                >
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
            p: { xs: padding * 0.75, sm: padding },
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <PersonRoundedIcon fontSize="small" color="primary" />
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Assigned team
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 1 }}
            divider={compact ? undefined : <Divider flexItem orientation="vertical" />}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                mb={0.5}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Resource
              </Typography>
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  wordBreak: 'break-word'
                }}
              >
                {loading ? renderSkeleton(160) : task?.resourceName || 'Unassigned'}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                mb={0.5}
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Division
              </Typography>
              <Typography
                variant="body1"
                fontWeight={600}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  wordBreak: 'break-word'
                }}
              >
                {loading ? renderSkeleton(120) : task?.division ?? '—'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      {/* Notes Accordions */}
      <Accordion
        expanded={fieldNotesExpanded}
        onChange={(_, expanded) => onFieldNotesExpandedChange?.(expanded)}
        sx={{
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
          '&:before': { display: 'none' },
          '&:not(:last-child)': { mb: 1 },
          mx: { xs: -0.5, sm: 0 },
          boxShadow: 'none',
        }}
      >
        <AccordionSummary
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            minHeight: { xs: 48, sm: 56 },
            '& .MuiAccordionSummary-content': {
              my: { xs: 0, sm: 1 },
            },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" width="100%">
            <Stack direction="row" spacing={1} alignItems="center">
              <StickyNote2RoundedIcon fontSize="small" color="primary" />
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Field notes
              </Typography>
            </Stack>
            <Chip
              label={loading ? '…' : `${fieldNotesList.length}`}
              variant="outlined"
              sx={{
                borderColor: modeTokens?.state.info || '#5488C7',
                color: modeTokens?.state.info || '#5488C7',
                backgroundColor: modeTokens?.background.alt || '#F3F4F7',
                fontWeight: 500,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: '20px', sm: '24px' },
              }}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Stack spacing={1.25}>
            <Stack
              spacing={0.75}
              sx={{
                height: { xs: 120, sm: notesHeight },
                overflowY: 'auto',
                pr: 0.5,
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '2px',
                },
              }}
            >
              {loading ? (
                <>{renderSkeleton('100%')}{renderSkeleton('85%')}</>
              ) : fieldNotesList.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 2 } }}>
                  <StickyNote2RoundedIcon
                    sx={{
                      fontSize: { xs: 28, sm: 32 },
                      color: 'text.disabled',
                      mb: 1
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    No field notes yet
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Add notes to track field activities
                  </Typography>
                </Box>
              ) : (
                fieldNotesList.map((note) => (
                  <Box
                    key={note.id}
                    sx={{
                      p: { xs: 1, sm: 1.5 },
                      bgcolor: theme.palette.action.hover,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        mb: 0.5,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        lineHeight: 1.4
                      }}
                    >
                      {note.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        display: 'block'
                      }}
                    >
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
                  multiline
                  minRows={1}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.palette.background.default,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }
                  }}
                />
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    onClick={() => addNote('field')}
                    variant="contained"
                    color="primary"
                    disabled={!fieldNoteDraft.trim()}
                    sx={{
                      minHeight: { xs: '36px', sm: '32px' },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      px: { xs: 2, sm: 1.5 },
                    }}
                  >
                    Add note
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={progressNotesExpanded}
        onChange={(_, expanded) => onProgressNotesExpandedChange?.(expanded)}
        sx={{
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${modeTokens.border?.soft ?? '#E8EAF0'}`,
          '&:before': { display: 'none' },
          mx: { xs: -0.5, sm: 0 },
          boxShadow: 'none',
        }}
      >
        <AccordionSummary
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            minHeight: { xs: 48, sm: 56 },
            '& .MuiAccordionSummary-content': {
              my: { xs: 0, sm: 1 },
            },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" width="100%">
            <Stack direction="row" spacing={1} alignItems="center">
              <TimelineRoundedIcon fontSize="small" color="primary" />
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Progress notes
              </Typography>
            </Stack>
            <Chip
              label={loading ? '…' : `${progressNotesList.length}`}
              variant="outlined"
              sx={{
                borderColor: modeTokens?.state.info || '#5488C7',
                color: modeTokens?.state.info || '#5488C7',
                backgroundColor: modeTokens?.background.alt || '#F3F4F7',
                fontWeight: 500,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: '20px', sm: '24px' },
              }}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Stack spacing={1.25}>
            <Stack
              spacing={0.75}
              sx={{
                height: { xs: 120, sm: notesHeight },
                overflowY: 'auto',
                pr: 0.5,
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '2px',
                },
              }}
            >
              {loading ? (
                <>{renderSkeleton('100%')}{renderSkeleton('85%')}</>
              ) : progressNotesList.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 2 } }}>
                  <TimelineRoundedIcon
                    sx={{
                      fontSize: { xs: 28, sm: 32 },
                      color: 'text.disabled',
                      mb: 1
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    No progress notes yet
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Track task progress and updates
                  </Typography>
                </Box>
              ) : (
                progressNotesList.map((note) => (
                  <Box
                    key={note.id}
                    sx={{
                      p: { xs: 1, sm: 1.5 },
                      bgcolor: theme.palette.action.hover,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        mb: 0.5,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        lineHeight: 1.4
                      }}
                    >
                      {note.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        display: 'block'
                      }}
                    >
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
                  multiline
                  minRows={1}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.palette.background.default,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }
                  }}
                />
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    onClick={() => addNote('progress')}
                    variant="contained"
                    color="primary"
                    disabled={!progressNoteDraft.trim()}
                    sx={{
                      minHeight: { xs: '36px', sm: '32px' },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      px: { xs: 2, sm: 1.5 },
                    }}
                  >
                    Add note
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  )
}

export default TaskDetails