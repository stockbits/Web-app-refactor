import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent, type SyntheticEvent } from 'react'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  OutlinedInput,
  Paper,
  Popover,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material'
import { createFilterOptions, type AutocompleteInputChangeReason } from '@mui/material/Autocomplete'
import type { SxProps, Theme } from '@mui/material/styles'
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { TASK_STATUS_LABELS } from '../../App - Data Tables/Task - Table'
import type { TaskSkillCode, TaskTableRow } from '../../App - Data Tables/Task - Table'

export type TaskTableQueryState = {
  searchTerm: string
  divisions: TaskTableRow['division'][]
  domains: TaskTableRow['domainId'][]
  statuses: TaskTableRow['status'][]
  capabilities: TaskSkillCode[]
  responseCodes: TaskTableRow['responseCode'][]
  updatedFrom: string | null
  updatedTo: string | null
  impactOperator?: 'gt' | 'lt' | 'eq' | null
  impactValue?: number | null
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
  impactOperator: null,
  impactValue: null,
})

interface TaskTableQueryConfigProps {
  divisionOptions?: TaskTableRow['division'][]
  domainOptions?: TaskTableRow['domainId'][]
  statusOptions?: TaskTableRow['status'][]
  capabilityOptions?: TaskSkillCode[]
  responseCodeOptions?: TaskTableRow['responseCode'][]
  exactSearchValues?: string[]
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
  exactSearchValues = [],
  initialQuery,
  defaultQuery,
  onApply,
}: TaskTableQueryConfigProps) => {
  const resolvedDefaultQuery = useMemo(() => defaultQuery ?? buildDefaultTaskTableQuery(), [defaultQuery])
  const resolvedInitialQuery = useMemo(() => initialQuery ?? resolvedDefaultQuery, [initialQuery, resolvedDefaultQuery])
  const [draftQuery, setDraftQuery] = useState<TaskTableQueryState>(resolvedInitialQuery)
  const [activeTab, setActiveTab] = useState<TaskFilterTab>('simple')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [impactFocused, setImpactFocused] = useState(false)
  const exactSearchSet = useMemo(() => {
    if (!exactSearchValues.length) {
      return null
    }
    return new Set(exactSearchValues.map((value) => value.toLowerCase()))
  }, [exactSearchValues])

  useEffect(() => {
    setDraftQuery(resolvedInitialQuery)
    setValidationError(null)
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

  const divisionSelectOptions = useMemo(
    () => buildLabeledOptions(divisionOptions, (value) => value),
    [divisionOptions],
  )
  const domainSelectOptions = useMemo(
    () => buildLabeledOptions(domainOptions, (value) => value),
    [domainOptions],
  )
  const statusSelectOptions = useMemo(
    () => buildLabeledOptions(statusOptions, (value) => STATUS_OPTION_LABELS[value] ?? value),
    [statusOptions],
  )
  const capabilitySelectOptions = useMemo(
    () => buildLabeledOptions(capabilityOptions, (value) => value),
    [capabilityOptions],
  )
  const responseCodeSelectOptions = useMemo(
    () => buildLabeledOptions(responseCodeOptions, (value) => value),
    [responseCodeOptions],
  )

  const handleTabChange = (_event: SyntheticEvent, nextTab: TaskFilterTab) => {
    setActiveTab(nextTab)
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftQuery((prev) => ({
      ...prev,
      searchTerm: event.target.value,
    }))
    setValidationError(null)
  }

  const handleStatusChange = (value: TaskTableRow['status'][]) => {
    setDraftQuery((prev) => ({
      ...prev,
      statuses: value,
    }))
    setValidationError(null)
  }

  const handleDivisionsChange = (value: TaskTableRow['division'][]) => {
    setDraftQuery((prev) => ({
      ...prev,
      divisions: value,
    }))
    setValidationError(null)
  }

  const handleDomainsChange = (value: TaskTableRow['domainId'][]) => {
    setDraftQuery((prev) => ({
      ...prev,
      domains: value,
    }))
    setValidationError(null)
  }

  const handleCapabilitiesChange = (value: TaskSkillCode[]) => {
    setDraftQuery((prev) => ({
      ...prev,
      capabilities: value,
    }))
    setValidationError(null)
  }

  const handleResponseCodesChange = (value: TaskTableRow['responseCode'][]) => {
    setDraftQuery((prev) => ({
      ...prev,
      responseCodes: value,
    }))
    setValidationError(null)
  }

  const handleImpactOperatorChange = (_event: SyntheticEvent, next: 'gt' | 'lt' | 'eq' | null) => {
    setDraftQuery((prev) => ({ ...prev, impactOperator: next }))
    setValidationError(null)
  }

  const handleImpactValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\D/g, '').slice(0, 3)
    const val = raw === '' ? null : Number(raw)
    setDraftQuery((prev) => ({ ...prev, impactValue: val }))
    setValidationError(null)
  }

  const handleDateRangeChange = (nextRange: DateRangeValue) => {
    setDraftQuery((prev) => ({
      ...prev,
      updatedFrom: nextRange.start ? nextRange.start.toISOString() : null,
      updatedTo: nextRange.end ? nextRange.end.toISOString() : null,
    }))
  }

  const handleApply = () => {
    const trimmedSearch = draftQuery.searchTerm.trim()
    const hasGlobalSearch = trimmedSearch.length > 0
    const hasDivisionSelection = draftQuery.divisions.length > 0
    const hasDomainSelection = draftQuery.domains.length > 0
    const hasStatusSelection = draftQuery.statuses.length > 0
    const hasCompleteFilterSet = hasDivisionSelection && hasDomainSelection && hasStatusSelection
    const hasAnySimpleFilter = hasDivisionSelection || hasDomainSelection || hasStatusSelection

    if (!hasGlobalSearch) {
      if (!hasCompleteFilterSet) {
        setValidationError('Select at least one Division, Domain, and Status when no global search is provided.')
        return
      }
    } else {
      if (hasAnySimpleFilter) {
        setValidationError('Clear Division, Domain, and Status when using global search.')
        return
      }

      if (exactSearchSet && !exactSearchSet.has(trimmedSearch.toLowerCase())) {
        setValidationError('Global search must exactly match a Task ID, Work ID, or Resource ID.')
        return
      }
    }

    const nextQuery =
      hasGlobalSearch && trimmedSearch !== draftQuery.searchTerm
        ? {
            ...draftQuery,
            searchTerm: trimmedSearch,
          }
        : draftQuery

    setDraftQuery(nextQuery)
    setValidationError(null)
    onApply(nextQuery)
  }

  const handleReset = () => {
    setDraftQuery(resolvedDefaultQuery)
    setValidationError(null)
  }

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
            error={Boolean(validationError)}
            helperText={validationError ?? ' '}
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
                md: '2fr 2fr 2fr 2fr 1fr',
                lg: '2fr 2fr 2fr 2fr 1fr',
              },
            }}
          >
            <BulkSelectableMultiSelect
              label="Divisions"
              options={divisionSelectOptions}
              value={draftQuery.divisions}
              onChange={handleDivisionsChange}
            />
            <BulkSelectableMultiSelect
              label="Domains"
              options={domainSelectOptions}
              value={draftQuery.domains}
              onChange={handleDomainsChange}
            />
            <BulkSelectableMultiSelect
              label="Statuses"
              options={statusSelectOptions}
              value={draftQuery.statuses}
              onChange={handleStatusChange}
            />
            <TaskDateWindowField
              value={dateRangeValue}
              onChange={handleDateRangeChange}
              sx={{
                gridColumn: {
                  xs: 'span 1',
                  sm: 'span 1',
                  md: 'span 1',
                  lg: 'span 1',
                },
              }}
            />
            <FormControl
              size="small"
              variant="outlined"
              sx={{
                gridColumn: {
                  xs: 'span 1',
                  sm: 'span 1',
                  md: 'span 1',
                  lg: 'span 1',
                },
                width: { md: '110px', lg: '110px', xs: '100%' },
                minWidth: 0,
              }}
            >
              <InputLabel htmlFor="impact-score-input" shrink={impactFocused || Boolean(draftQuery.impactValue)}>
                Score
              </InputLabel>
              <OutlinedInput
                id="impact-score-input"
                label="Score"
                value={draftQuery.impactValue ?? ''}
                onChange={handleImpactValueChange}
                onFocus={() => setImpactFocused(true)}
                onBlur={() => setImpactFocused(false)}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 3 }}
                placeholder="999"
                startAdornment={
                  <InputAdornment position="start">
                    <Tooltip title={draftQuery.impactOperator === 'gt' ? 'Greater than' : draftQuery.impactOperator === 'lt' ? 'Less than' : 'Equal'}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const order: Array<'gt' | 'lt' | 'eq'> = ['gt', 'lt', 'eq']
                          const current = draftQuery.impactOperator ?? 'gt'
                          const next = order[(order.indexOf(current) + 1) % order.length]
                          setDraftQuery((prev) => ({ ...prev, impactOperator: next }))
                        }}
                        aria-label="Toggle impact operator"
                        tabIndex={-1}
                      >
                        {draftQuery.impactOperator === 'gt' ? '>' : draftQuery.impactOperator === 'lt' ? '<' : '='}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                }
              />
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
                md: 'repeat(5, minmax(0, 1fr))',
                lg: 'repeat(5, minmax(0, 1fr))',
              },
            }}
          >
            <BulkSelectableMultiSelect
              label="Capabilities"
              options={capabilitySelectOptions}
              value={draftQuery.capabilities}
              onChange={handleCapabilitiesChange}
            />
            <BulkSelectableMultiSelect
              label="Response codes"
              options={responseCodeSelectOptions}
              value={draftQuery.responseCodes}
              onChange={handleResponseCodesChange}
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
    const newRange = resolveRange(draftRange)
    setDraftRange(newRange)
    // Set active field to 'start' to show the start date in the calendar
    setActiveField('start')
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
          size="small"
          fullWidth
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
                // Hide the internal OK/CANCEL action bar — we use our own buttons below
                slots={{ actionBar: () => null }}
                // Defensive: also set slotProps/slotProps for different MUI X versions
                slotProps={{ actionBar: { sx: { display: 'none' } } } as any}
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
    // Always anchor forward shortcuts to the current system date
    resolveRange: (_context) => buildForwardWindowFrom({ start: new Date(), end: null }, { days: 7, allowSystemFallback: true }),
  },
  {
    label: 'Three months forward',
    hint: 'Quarter ahead',
    resolveRange: (_context) => buildForwardWindowFrom({ start: new Date(), end: null }, { months: 3, allowSystemFallback: true }),
  },
  {
    label: 'One week back',
    hint: 'Previous seven days',
    // Always anchor backward shortcuts to the current system date
    resolveRange: (_context) => buildBackwardWindowFrom({ start: null, end: new Date() }, { days: 7, allowSystemFallback: true }),
  },
  {
    label: 'Three months back',
    hint: 'Previous quarter',
    resolveRange: (_context) => buildBackwardWindowFrom({ start: null, end: new Date() }, { months: 3, allowSystemFallback: true }),
  },
  {
    label: 'Last Twelve months',
    hint: 'Rolling year',
    resolveRange: (_context) => buildBackwardWindowFrom({ start: null, end: new Date() }, { months: 12, allowSystemFallback: true }),
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
  a.updatedTo === b.updatedTo &&
  (a.impactOperator ?? null) === (b.impactOperator ?? null) &&
  (a.impactValue ?? null) === (b.impactValue ?? null)

const arraysEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false
  }
  return left.every((value, index) => value === right[index])
}

type LabeledOption<TValue extends string> = {
  label: string
  value: TValue
}

const buildLabeledOptions = <TValue extends string>(
  values: TValue[],
  resolveLabel: (value: TValue) => string,
): LabeledOption<TValue>[] => values.map((value) => ({ value, label: resolveLabel(value) }))

type BulkSelectableMultiSelectProps<TValue extends string> = {
  label: string
  options: LabeledOption<TValue>[]
  value: TValue[]
  onChange: (value: TValue[]) => void
}

const BulkSelectableMultiSelect = <TValue extends string>({
  label,
  options,
  value,
  onChange,
}: BulkSelectableMultiSelectProps<TValue>) => {
  const [inputValue, setInputValue] = useState('')
  const [actionMode, setActionMode] = useState<'select' | 'clear'>('select')

  useEffect(() => {
    if (!value.length && actionMode !== 'select') {
      setActionMode('select')
    }
  }, [actionMode, value.length])

  const optionMap = useMemo(() => {
    const nextMap = new Map<TValue, LabeledOption<TValue>>()
    options.forEach((option) => nextMap.set(option.value, option))
    return nextMap
  }, [options])

  const selectedOptions = useMemo(() => {
    const mapped = value.map((selectedValue) => optionMap.get(selectedValue)).filter(Boolean)
    return mapped as LabeledOption<TValue>[]
  }, [optionMap, value])

  const filterOptions = useMemo(
    () =>
      createFilterOptions<LabeledOption<TValue>>({
        stringify: (option) => `${option.label} ${option.value}`,
        trim: true,
      }),
    [],
  )

  const selectAllCandidates = useMemo(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      return options
    }
    return filterOptions(options, {
      inputValue: trimmed,
      getOptionLabel: (option) => option.label,
    })
  }, [filterOptions, inputValue, options])

  const selectedSet = useMemo(() => new Set(value), [value])
  const bulkMatchCount = selectAllCandidates.length
  const bulkAlreadySelected = selectAllCandidates.every((option) => selectedSet.has(option.value))
  const hasSearchTerm = Boolean(inputValue.trim())
  const showBulkSelect = options.length > 0
  const isBulkActionDisabled = bulkMatchCount === 0 || bulkAlreadySelected
  const isAllSelected = options.length > 0 && value.length === options.length
  const shouldShowSelectAllIcon = actionMode === 'select' && showBulkSelect && bulkMatchCount > 0 && !isBulkActionDisabled
  const shouldShowClearIcon = actionMode === 'clear' && value.length > 0

  const handleBulkSelect = () => {
    if (isBulkActionDisabled) {
      return
    }
    const deduped = new Set<TValue>()
    const merged: TValue[] = []

    value.forEach((entry) => {
      if (!deduped.has(entry)) {
        deduped.add(entry)
        merged.push(entry)
      }
    })

    selectAllCandidates.forEach((option) => {
      if (!deduped.has(option.value)) {
        deduped.add(option.value)
        merged.push(option.value)
      }
    })

    onChange(merged)
    setActionMode('clear')
    setInputValue('')
  }

  const handleSelectionChange = (_event: SyntheticEvent, nextOptions: LabeledOption<TValue>[]) => {
    onChange(nextOptions.map((option) => option.value))
  }

  const handleInputChange = (
    _event: SyntheticEvent,
    nextValue: string,
    reason: AutocompleteInputChangeReason,
  ) => {
    if (reason === 'reset') {
      setInputValue('')
      setActionMode('select')
      return
    }
    if (reason === 'input') {
      setActionMode('select')
    }
    setInputValue(nextValue)
  }

  const handleClearSelection = () => {
    if (!value.length) {
      return
    }
    onChange([])
    setActionMode('select')
    setInputValue('')
  }

  const bulkTooltipLabel = !showBulkSelect
    ? ''
    : bulkMatchCount === 0
      ? 'No options available'
      : bulkAlreadySelected
        ? hasSearchTerm
          ? 'All matches already selected'
          : 'All options already selected'
        : hasSearchTerm
          ? `Select ${bulkMatchCount} matches`
          : `Select all ${bulkMatchCount} options`

  return (
    <Autocomplete
      multiple
      options={options}
      value={selectedOptions}
      onChange={handleSelectionChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      filterOptions={filterOptions}
      disableCloseOnSelect
      disableClearable
      fullWidth
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      getOptionLabel={(option) => option.label}
      renderTags={(tagValue, getTagProps) => {
        if (isAllSelected) {
          return (
            <Chip
              key="all-selected"
              size="small"
              label="All selected"
              variant="outlined"
              title="All selected"
              onDelete={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onChange([])
                setActionMode('select')
              }}
            />
          )
        }
        const MAX_VISIBLE_TAGS = 1
        const visibleTags = tagValue.slice(0, MAX_VISIBLE_TAGS)
        const hiddenCount = tagValue.length - visibleTags.length
        return (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              overflow: 'hidden',
              gap: 0.5,
              maxWidth: '100%',
            }}
          >
            {visibleTags.map((option, index) => (
              <Chip {...getTagProps({ index })} key={option.value} label={option.label} size="small" />
            ))}
            {hiddenCount > 0 && (
              <Chip
                size="small"
                label={`+${hiddenCount} more`}
                variant="outlined"
                onMouseDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onClick={(event) => {
                  // keep focus on input so the dropdown remains accessible while preventing accidental removal
                  event.preventDefault()
                  event.stopPropagation()
                }}
              />
            )}
          </Box>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={value.length ? undefined : 'Filter list'}
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {shouldShowSelectAllIcon && (
                  <Tooltip title={bulkTooltipLabel} placement="top">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleBulkSelect}
                        disabled={isBulkActionDisabled}
                        aria-label={hasSearchTerm ? 'Select all filtered options' : 'Select all options'}
                      >
                        <DoneAllRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {!shouldShowSelectAllIcon && shouldShowClearIcon && (
                  <Tooltip title="Clear selection" placement="top">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleClearSelection}
                        aria-label="Clear selection"
                        disabled={!value.length}
                      >
                        <CloseRoundedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
