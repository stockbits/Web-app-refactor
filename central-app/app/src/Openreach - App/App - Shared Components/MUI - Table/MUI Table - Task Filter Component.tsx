import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  MenuItem,
  OutlinedInput,
  Paper,
  Popover,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { SelectChangeEvent } from '@mui/material/Select'
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
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
  const dateRangeValue = useMemo<DateRangeValue>(
    () => ({
      start: draftQuery.updatedFrom ? new Date(draftQuery.updatedFrom) : null,
      end: draftQuery.updatedTo ? new Date(draftQuery.updatedTo) : null,
    }),
    [draftQuery.updatedFrom, draftQuery.updatedTo],
  )

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftQuery((prev) => ({
      ...prev,
      searchTerm: event.target.value,
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

  const handleDateRangeChange = (nextRange: DateRangeValue) => {
    setDraftQuery((prev) => ({
      ...prev,
      updatedFrom: nextRange.start ? nextRange.start.toISOString() : null,
      updatedTo: nextRange.end ? nextRange.end.toISOString() : null,
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
            onChange={handleSearchChange}
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
          <TaskDateWindowField
            value={dateRangeValue}
            onChange={handleDateRangeChange}
            sx={{
              gridColumn: {
                xs: 'span 1',
                sm: 'span 2',
                md: 'span 3',
                lg: 'span 2',
              },
            }}
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

type DateRangeValue = {
  start: Date | null
  end: Date | null
}

type TaskDateShortcut = {
  label: string
  hint?: string
  resolveRange: (context: DateRangeValue) => DateRangeValue
}

interface TaskDateWindowFieldProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  shortcuts?: TaskDateShortcut[]
  sx?: SxProps<Theme>
}

const TaskDateWindowField = ({ value, onChange, shortcuts = DEFAULT_DATE_SHORTCUTS, sx }: TaskDateWindowFieldProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [activeField, setActiveField] = useState<'start' | 'end'>('start')
  const [draftRange, setDraftRange] = useState<DateRangeValue>(value)

  useEffect(() => {
    if (!anchorEl) {
      setDraftRange(value)
    }
  }, [value, anchorEl])

  const handleDateChange = (nextDate: Date | null) => {
    if (!nextDate) {
      setDraftRange((prev) => ({ ...prev, [activeField]: null }))
      return
    }

    const existing = draftRange[activeField]
    const updated = new Date(nextDate)

    if (existing) {
      updated.setHours(existing.getHours(), existing.getMinutes(), existing.getSeconds(), existing.getMilliseconds())
    } else if (activeField === 'start') {
      updated.setHours(0, 0, 0, 0)
    } else {
      updated.setHours(23, 59, 59, 999)
    }

    setDraftRange((prev) => ({ ...prev, [activeField]: updated }))
  }

  const handleTimeChange = (field: 'start' | 'end') => (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value
    if (!rawValue) {
      setDraftRange((prev) => ({ ...prev, [field]: null }))
      return
    }

    const [hoursStr, minutesStr] = rawValue.split(':')
    const hours = Number(hoursStr)
    const minutes = Number(minutesStr)

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return
    }

    const reference = draftRange[field] ?? new Date()
    const next = new Date(reference)
    next.setHours(hours, minutes, field === 'end' ? 59 : 0, field === 'end' ? 999 : 0)
    setDraftRange((prev) => ({ ...prev, [field]: next }))
  }

  const handleShortcut = (resolveRange: TaskDateShortcut['resolveRange']) => () => {
    setDraftRange(resolveRange(draftRange))
  }

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setDraftRange(value)
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const handleClear = () => {
    setDraftRange({ start: null, end: null })
  }

  const handleApplySelection = () => {
    onChange(draftRange)
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const summaryLabel = buildSummaryLabel(value)

  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <OutlinedInput
          value={summaryLabel}
          readOnly
          onClick={handleOpen}
          placeholder="Date Time Picker"
          endAdornment={
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleOpen} aria-label="Edit date window">
                <CalendarMonthRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          }
        />

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ sx: { p: 2, borderRadius: 2, maxWidth: 720 } }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
            <List
              dense
              subheader={<ListSubheader component="div">Shortcuts</ListSubheader>}
              sx={{ minWidth: 200, bgcolor: 'rgba(7,59,76,0.03)', borderRadius: 2 }}
            >
              {shortcuts.map((shortcut) => (
                <ListItemButton key={shortcut.label} onClick={handleShortcut(shortcut.resolveRange)}>
                  <ListItemText primary={shortcut.label} secondary={shortcut.hint} primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              ))}
              <Divider sx={{ my: 0.5 }} />
              <ListItemButton onClick={handleClear}>
                <ListItemText primary="Clear window" />
              </ListItemButton>
            </List>
            <Stack spacing={2} flexGrow={1}>
              <ToggleButtonGroup
                value={activeField}
                exclusive
                onChange={(_event, next) => {
                  if (next) setActiveField(next)
                }}
                size="small"
              >
                <ToggleButton value="start">Start date</ToggleButton>
                <ToggleButton value="end">End date</ToggleButton>
              </ToggleButtonGroup>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={draftRange[activeField]}
                onChange={handleDateChange}
                slotProps={{
                  actionBar: { actions: [] },
                }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Start time"
                  type="time"
                  value={formatTimeInput(draftRange.start)}
                  onChange={handleTimeChange('start')}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  fullWidth
                />
                <TextField
                  label="End time"
                  type="time"
                  value={formatTimeInput(draftRange.end)}
                  onChange={handleTimeChange('end')}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  fullWidth
                />
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
            <Button color="inherit" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="contained" onClick={handleApplySelection}>
              Apply
            </Button>
          </Stack>
        </Popover>
      </LocalizationProvider>
    </Box>
  )
}

const DEFAULT_DATE_SHORTCUTS: TaskDateShortcut[] = [
  {
    label: 'Today',
    hint: 'Current calendar day',
    resolveRange: () => buildSingleDayWindow(0),
  },
  {
    label: 'Tomorrow',
    hint: 'Next calendar day',
    resolveRange: () => buildSingleDayWindow(1),
  },
  {
    label: 'One week forward',
    hint: 'Seven days ahead',
    resolveRange: (context) => buildForwardWindowFrom(context, { days: 7 }),
  },
  {
    label: 'Three months forward',
    hint: 'Quarter ahead',
    resolveRange: (context) => buildForwardWindowFrom(context, { months: 3, allowSystemFallback: true }),
  },
  {
    label: 'One week back',
    hint: 'Previous seven days',
    resolveRange: (context) => buildBackwardWindowFrom(context, { days: 7 }),
  },
  {
    label: 'Three months back',
    hint: 'Previous quarter',
    resolveRange: (context) => buildBackwardWindowFrom(context, { months: 3, allowSystemFallback: true }),
  },
  {
    label: 'Last Twelve months',
    hint: 'Rolling year',
    resolveRange: (context) => buildBackwardWindowFrom(context, { months: 12, allowSystemFallback: true }),
  },
]

const buildSingleDayWindow = (offsetDays: number): DateRangeValue => {
  const target = addDays(new Date(), offsetDays)
  return {
    start: startOfDay(target),
    end: endOfDay(target),
  }
}

const buildForwardWindowFrom = (
  context: DateRangeValue,
  { days = 0, months = 0, allowSystemFallback = false }: { days?: number; months?: number; allowSystemFallback?: boolean },
) => {
  const anchor = context.start ?? context.end ?? (allowSystemFallback ? new Date() : null)
  if (!anchor) {
    return { ...context }
  }
  const endDate = months ? addMonths(anchor, months) : addDays(anchor, days)
  return {
    start: startOfDay(anchor),
    end: endOfDay(endDate),
  }
}

const buildBackwardWindowFrom = (
  context: DateRangeValue,
  { days = 0, months = 0, allowSystemFallback = false }: { days?: number; months?: number; allowSystemFallback?: boolean },
) => {
  const anchor = context.end ?? context.start ?? (allowSystemFallback ? new Date() : null)
  if (!anchor) {
    return { ...context }
  }
  const startDate = months ? addMonths(anchor, -months) : addDays(anchor, -days)
  return {
    start: startOfDay(startDate),
    end: endOfDay(anchor),
  }
}

const addDays = (base: Date, amount: number) => {
  const result = new Date(base)
  result.setDate(result.getDate() + amount)
  return result
}

const addMonths = (base: Date, amount: number) => {
  const result = new Date(base)
  result.setMonth(result.getMonth() + amount)
  return result
}

const startOfDay = (value: Date) => {
  const next = new Date(value)
  next.setHours(0, 0, 0, 0)
  return next
}

const endOfDay = (value: Date) => {
  const next = new Date(value)
  next.setHours(23, 59, 59, 999)
  return next
}

const formatDateTimeLabel = (value: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)

const formatTimeInput = (value: Date | null) => {
  if (!value) {
    return ''
  }
  const hours = value.getHours().toString().padStart(2, '0')
  const minutes = value.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const buildSummaryLabel = (value: DateRangeValue) => {
  if (value.start && value.end) {
    return `${formatDateTimeLabel(value.start)} – ${formatDateTimeLabel(value.end)}`
  }
  if (value.start) {
    return `From ${formatDateTimeLabel(value.start)}`
  }
  if (value.end) {
    return `Until ${formatDateTimeLabel(value.end)}`
  }
  return 'Date Time Picker'
}

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
