import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import type { TaskTableRow } from '../../App - Data Base/Task - Table'

export type TaskTableQueryState = {
  searchTerm: string
  owners: string[]
  priorities: TaskTableRow['priority'][]
  statuses: TaskTableRow['status'][]
  updatedFrom: string | null
  updatedTo: string | null
}

const DEFAULT_PRIORITIES: TaskTableRow['priority'][] = ['Critical', 'High', 'Medium', 'Low']
const DEFAULT_STATUSES: TaskTableRow['status'][] = ['In Progress', 'Queued', 'Blocked', 'Complete']

export const buildDefaultTaskTableQuery = (): TaskTableQueryState => ({
  searchTerm: '',
  owners: [],
  priorities: [],
  statuses: [],
  updatedFrom: null,
  updatedTo: null,
})

interface TaskTableQueryConfigProps {
  ownerOptions: string[]
  priorityOptions?: TaskTableRow['priority'][]
  statusOptions?: TaskTableRow['status'][]
  initialQuery?: TaskTableQueryState
  defaultQuery?: TaskTableQueryState
  onApply: (query: TaskTableQueryState) => void
}

const TaskTableQueryConfig = ({
  ownerOptions,
  priorityOptions = DEFAULT_PRIORITIES,
  statusOptions = DEFAULT_STATUSES,
  initialQuery,
  defaultQuery,
  onApply,
}: TaskTableQueryConfigProps) => {
  const resolvedDefaultQuery = useMemo(() => defaultQuery ?? buildDefaultTaskTableQuery(), [defaultQuery])
  const resolvedInitialQuery = useMemo(() => initialQuery ?? resolvedDefaultQuery, [initialQuery, resolvedDefaultQuery])
  const [draftQuery, setDraftQuery] = useState<TaskTableQueryState>(resolvedInitialQuery)

  useEffect(() => {
    setDraftQuery(resolvedInitialQuery)
  }, [resolvedInitialQuery])

  const isDirty = useMemo(() => !areQueriesEqual(draftQuery, resolvedInitialQuery), [draftQuery, resolvedInitialQuery])
  const hasAppliedFilters = useMemo(
    () => !areQueriesEqual(resolvedInitialQuery, resolvedDefaultQuery),
    [resolvedInitialQuery, resolvedDefaultQuery],
  )
  const showClearAction = isDirty || hasAppliedFilters

  const handleTextChange = (field: keyof Pick<TaskTableQueryState, 'searchTerm' | 'updatedFrom' | 'updatedTo'>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value || null
      setDraftQuery((prev) => ({
        ...prev,
        [field]: field === 'searchTerm' ? event.target.value : value,
      }))
    }

  const handleMultiSelectChange = (field: keyof Pick<TaskTableQueryState, 'owners' | 'priorities' | 'statuses'>) =>
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value as string[]
      setDraftQuery((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

  const handleApply = () => {
    onApply(draftQuery)
  }

  const handleReset = () => {
    setDraftQuery(resolvedDefaultQuery)
    onApply(resolvedDefaultQuery)
  }

  const renderMultiValue = (selected: string[]) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {selected.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Any
        </Typography>
      ) : (
        selected.map((value) => (
          <Chip key={value} label={value} size="small" />
        ))
      )}
    </Box>
  )

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid rgba(7,59,76,0.12)',
        bgcolor: '#fff',
        p: 2.5,
      }}
    >
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(6, minmax(0, 1fr))',
            },
          }}
        >
          <TextField
            label="Keyword search"
            placeholder="Task, owner, or ID"
            value={draftQuery.searchTerm}
            onChange={handleTextChange('searchTerm')}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="owner-filter-label">Owners</InputLabel>
            <Select
              labelId="owner-filter-label"
              label="Owners"
              multiple
              value={draftQuery.owners}
              onChange={handleMultiSelectChange('owners')}
              renderValue={renderMultiValue}
            >
              {ownerOptions.map((owner) => (
                <MenuItem key={owner} value={owner}>
                  <Checkbox checked={draftQuery.owners.includes(owner)} size="small" />
                  <Typography variant="body2">{owner}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="priority-filter-label">Priorities</InputLabel>
            <Select
              labelId="priority-filter-label"
              label="Priorities"
              multiple
              value={draftQuery.priorities}
              onChange={handleMultiSelectChange('priorities')}
              renderValue={renderMultiValue}
            >
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  <Checkbox checked={draftQuery.priorities.includes(priority)} size="small" />
                  <Typography variant="body2">{priority}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">Statuses</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Statuses"
              multiple
              value={draftQuery.statuses}
              onChange={handleMultiSelectChange('statuses')}
              renderValue={renderMultiValue}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  <Checkbox checked={draftQuery.statuses.includes(status)} size="small" />
                  <Typography variant="body2">{status}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type="date"
            label="Updated from"
            InputLabelProps={{ shrink: true }}
            value={draftQuery.updatedFrom ?? ''}
            onChange={handleTextChange('updatedFrom')}
            fullWidth
          />
          <TextField
            type="date"
            label="Updated to"
            InputLabelProps={{ shrink: true }}
            value={draftQuery.updatedTo ?? ''}
            onChange={handleTextChange('updatedTo')}
            fullWidth
          />
        </Box>

        <Divider light />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="flex-end" alignItems="center">
          <Stack direction="row" spacing={1} width={{ xs: '100%', md: 'auto' }} justifyContent={{ xs: 'flex-end', md: 'flex-end' }}>
            {showClearAction && (
              <Button variant="text" color="inherit" onClick={handleReset}>
                Clear
              </Button>
            )}
            <Button variant="contained" onClick={handleApply} disabled={!isDirty}>
              Search
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default TaskTableQueryConfig

const areQueriesEqual = (a: TaskTableQueryState, b: TaskTableQueryState) =>
  a.searchTerm === b.searchTerm &&
  arraysEqual(a.owners, b.owners) &&
  arraysEqual(a.priorities, b.priorities) &&
  arraysEqual(a.statuses, b.statuses) &&
  a.updatedFrom === b.updatedFrom &&
  a.updatedTo === b.updatedTo

const arraysEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false
  }
  return left.every((value, index) => value === right[index])
}
