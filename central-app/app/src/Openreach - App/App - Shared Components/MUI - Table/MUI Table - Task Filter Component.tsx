import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent, type SyntheticEvent } from 'react'
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
  Tab,
  Tabs,
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
import { TASK_STATUS_LABELS } from '../../App - Data Base/Task - Table'
import type { TaskSkillCode, TaskTableRow } from '../../App - Data Base/Task - Table'

export type TaskTableQueryState = {
  searchTerm: string
  divisions: TaskTableRow['division'][]
  domains: TaskTableRow['domainId'][]
  statuses: TaskTableRow['status'][]
  capabilities: TaskSkillCode[]
  responseCodes: TaskTableRow['responseCode'][]
  updatedFrom: string | null
  updatedTo: string | null
}

type TaskFilterTab = 'simple' | 'advanced'

const TASK_FILTER_TABS: Array<{ value: TaskFilterTab; label: string }> = [
  { value: 'simple', label: 'Simple view' },
  { value: 'advanced', label: 'Advanced view' },
]

const DEFAULT_STATUSES: TaskTableRow['status'][] = ['ACT', 'AWI', 'ISS', 'EXC', 'COM']
const STATUS_OPTION_LABELS: Record<TaskTableRow['status'], string> = {
  ACT: `ACT - ${TASK_STATUS_LABELS.ACT}`,
  AWI: `AWI - ${TASK_STATUS_LABELS.AWI}`,
  ISS: `ISS - ${TASK_STATUS_LABELS.ISS}`,
  EXC: `EXC - ${TASK_STATUS_LABELS.EXC}`,
  COM: `COM - ${TASK_STATUS_LABELS.COM}`,
}

export const buildDefaultTaskTableQuery = (): TaskTableQueryState => ({
  searchTerm: '',
  divisions: [],
  domains: [],
  statuses: [],
  capabilities: [],
  responseCodes: [],
  updatedFrom: null,
  updatedTo: null,
})

interface TaskTableQueryConfigProps {
  divisionOptions?: TaskTableRow['division'][]
  domainOptions?: TaskTableRow['domainId'][]
  statusOptions?: TaskTableRow['status'][]
  capabilityOptions?: TaskSkillCode[]
  responseCodeOptions?: TaskTableRow['responseCode'][]
  initialQuery?: TaskTableQueryState
  defaultQuery?: TaskTableQueryState
  onApply: (query: TaskTableQueryState) => void
}

const TaskTableQueryConfig = ({
  divisionOptions = [],
  domainOptions = [],
  statusOptions = DEFAULT_STATUSES,
  capabilityOptions = [],
  responseCodeOptions = [],
  initialQuery,
  defaultQuery,
  onApply,
}: TaskTableQueryConfigProps) => {
  const resolvedDefaultQuery = useMemo(() => defaultQuery ?? buildDefaultTaskTableQuery(), [defaultQuery])
  const resolvedInitialQuery = useMemo(() => initialQuery ?? resolvedDefaultQuery, [initialQuery, resolvedDefaultQuery])
  const [draftQuery, setDraftQuery] = useState<TaskTableQueryState>(resolvedInitialQuery)
  const [activeTab, setActiveTab] = useState<TaskFilterTab>('simple')

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

  const handleTabChange = (_event: SyntheticEvent, nextTab: TaskFilterTab) => {
    setActiveTab(nextTab)
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftQuery((prev) => ({
      ...prev,
      searchTerm: event.target.value,
    }))
  }

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as TaskTableRow['status'][]
    setDraftQuery((prev) => ({
      ...prev,
      statuses: value,
    }))
  }

  const handleDivisionsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as TaskTableRow['division'][]
    setDraftQuery((prev) => ({
      ...prev,
      divisions: value,
    }))
  }

  const handleDomainsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as TaskTableRow['domainId'][]
    setDraftQuery((prev) => ({
      ...prev,
      domains: value,
    }))
  }

  const handleCapabilitiesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as TaskSkillCode[]
    setDraftQuery((prev) => ({
      ...prev,
      capabilities: value,
    }))
  }

  const handleResponseCodesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as TaskTableRow['responseCode'][]
    setDraftQuery((prev) => ({
      ...prev,
      responseCodes: value,
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
        bgcolor: '#fff',
        p: 2.5,
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" allowScrollButtonsMobile>
            {TASK_FILTER_TABS.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} disableRipple />
            ))}
          </Tabs>
          <TextField
            label="Global search"
            placeholder="Task, resource, or ID"
            value={draftQuery.searchTerm}
            onChange={handleSearchChange}
            fullWidth
            sx={{
              maxWidth: { md: 320 },
              width: { xs: '100%', md: 'auto' },
            }}
          />
        </Stack>

        {activeTab === 'simple' && (
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
            <FormControl fullWidth>
              <InputLabel id="division-filter-label">Divisions</InputLabel>
              <Select
                labelId="division-filter-label"
                label="Divisions"
                multiple
                value={draftQuery.divisions}
                onChange={handleDivisionsChange}
                renderValue={renderMultiValue}
              >
                {divisionOptions.map((division) => (
                  <MenuItem key={division} value={division}>
                    <Checkbox checked={draftQuery.divisions.includes(division)} size="small" />
                    <Typography variant="body2">{division}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="domain-filter-label">Domains</InputLabel>
              <Select
                labelId="domain-filter-label"
                label="Domains"
                multiple
                value={draftQuery.domains}
                onChange={handleDomainsChange}
                renderValue={renderMultiValue}
              >
                {domainOptions.map((domain) => (
                  <MenuItem key={domain} value={domain}>
                    <Checkbox checked={draftQuery.domains.includes(domain)} size="small" />
                    <Typography variant="body2">{domain}</Typography>
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
                onChange={handleStatusChange}
                renderValue={renderMultiValue}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={draftQuery.statuses.includes(status)} size="small" />
                    <Typography variant="body2">
                      {STATUS_OPTION_LABELS[status] ?? status}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {activeTab === 'advanced' && (
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
            <FormControl fullWidth>
              <InputLabel id="capability-filter-label">Capabilities</InputLabel>
              <Select
                labelId="capability-filter-label"
                label="Capabilities"
                multiple
                value={draftQuery.capabilities}
                onChange={handleCapabilitiesChange}
                renderValue={renderMultiValue}
              >
                {capabilityOptions.map((capability) => (
                  <MenuItem key={capability} value={capability}>
                    <Checkbox checked={draftQuery.capabilities.includes(capability)} size="small" />
                    <Typography variant="body2">{capability}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="response-filter-label">Response codes</InputLabel>
              <Select
                labelId="response-filter-label"
                label="Response codes"
                multiple
                value={draftQuery.responseCodes}
                onChange={handleResponseCodesChange}
                renderValue={renderMultiValue}
              >
                {responseCodeOptions.map((responseCode) => (
                  <MenuItem key={responseCode} value={responseCode}>
                    <Checkbox checked={draftQuery.responseCodes.includes(responseCode)} size="small" />
                    <Typography variant="body2">{responseCode}</Typography>
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
        )}

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
  arraysEqual(a.divisions, b.divisions) &&
  arraysEqual(a.domains, b.domains) &&
  arraysEqual(a.statuses, b.statuses) &&
  arraysEqual(a.capabilities, b.capabilities) &&
  arraysEqual(a.responseCodes, b.responseCodes) &&
  a.updatedFrom === b.updatedFrom &&
  a.updatedTo === b.updatedTo

const arraysEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false
  }
  return left.every((value, index) => value === right[index])
}
