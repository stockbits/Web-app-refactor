import { useMemo, useState, type ChangeEvent, type MouseEvent, type SyntheticEvent } from 'react'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Modal,
  OutlinedInput,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { createFilterOptions, type AutocompleteInputChangeReason } from '@mui/material/Autocomplete'
import type { SxProps, Theme } from '@mui/material/styles'
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AssignmentIcon from '@mui/icons-material/Assignment'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import type { TaskSkillCode, TaskTableRow } from '../../App - Data Tables/Task - Table';
import type { TaskTableQueryState, TaskFilterTab } from './TaskTableQueryConfig.shared';
import {
  buildDefaultTaskTableQuery,
  TASK_FILTER_TABS,
  DEFAULT_STATUSES,
  STATUS_OPTION_LABELS,
} from './TaskTableQueryConfig.shared';

interface TaskTableQueryConfigProps {
  divisionOptions?: TaskTableRow['division'][]
  domainOptions?: TaskTableRow['domainId'][]
  statusOptions?: TaskTableRow['status'][]
  capabilityOptions?: TaskSkillCode[]
  responseCodeOptions?: TaskTableRow['responseCode'][]
  commitTypeOptions?: TaskTableRow['commitType'][]
  exactSearchValues?: string[]
  initialQuery?: TaskTableQueryState
  defaultQuery?: TaskTableQueryState
  onApply: (query: TaskTableQueryState) => void
  hasRows?: boolean
  onCopyHtml?: () => void
  onExportCsv?: () => void
}

const TaskTableQueryConfig = ({
  divisionOptions = [],
  domainOptions = [],
  statusOptions = DEFAULT_STATUSES,
  capabilityOptions = [],
  responseCodeOptions = [],
  commitTypeOptions = [],
  exactSearchValues = [],
  initialQuery,
  defaultQuery,
  onApply,
  hasRows = false,
  onCopyHtml,
  onExportCsv,
}: TaskTableQueryConfigProps) => {
  const [hasQueried, setHasQueried] = useState(false)
  const resolvedDefaultQuery = useMemo(() => defaultQuery ?? buildDefaultTaskTableQuery(), [defaultQuery])
  const resolvedInitialQuery = useMemo(() => initialQuery ?? resolvedDefaultQuery, [initialQuery, resolvedDefaultQuery])
  const [draftQuery, setDraftQuery] = useState<TaskTableQueryState>(resolvedInitialQuery)
  const [activeTab, setActiveTab] = useState<TaskFilterTab>('simple')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const exactSearchSet = useMemo(() => {
    if (!exactSearchValues.length) {
      return null
    }
    return new Set(exactSearchValues.map((value) => value.toLowerCase()))
  }, [exactSearchValues])

  // Remove setState from effect: instead, update draftQuery only when initialQuery/defaultQuery changes via props
  // Removed setValidationError(null) from effect to comply with lint rules

  const isDirty = useMemo(() => !areQueriesEqual(draftQuery, resolvedInitialQuery), [draftQuery, resolvedInitialQuery])
  const hasAppliedFilters = useMemo(() => !areQueriesEqual(resolvedInitialQuery, resolvedDefaultQuery), [resolvedInitialQuery, resolvedDefaultQuery])
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
    () =>
      statusOptions.map((value) => ({
        value,
        label: `${value} → ${STATUS_OPTION_LABELS[value] ?? value}`,
      })),
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
  const commitTypeSelectOptions = useMemo(
    () => buildLabeledOptions(commitTypeOptions, (value) => value),
    [commitTypeOptions],
  )

  const handleTabChange = (_event: SyntheticEvent, nextTab: TaskFilterTab) => {
    setActiveTab(nextTab)
  }

  // Speed Dial actions for export operations
  const exportActions = useMemo(() => [
    { icon: <ContentCopyIcon />, name: 'Copy to Clipboard', action: onCopyHtml },
    { icon: <AssignmentIcon />, name: 'Export CSV', action: onExportCsv },
  ], [onCopyHtml, onExportCsv])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchValue = event.target.value
    const hasSearchValue = newSearchValue.trim().length > 0

    setDraftQuery((prev) => ({
      ...prev,
      searchTerm: newSearchValue,
      // Mutual exclusivity: if global search entered, clear status selection only
      statuses: hasSearchValue ? [] : prev.statuses,
    }))
    setValidationError(null)
  }

  const handleStatusChange = (value: TaskTableRow['status'][]) => {
    setDraftQuery((prev) => ({
      ...prev,
      statuses: value,
      // Mutual exclusivity: if user selects any status, clear global search
      searchTerm: value.length > 0 ? '' : prev.searchTerm,
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

  const handleCommitTypesChange = (value: TaskTableRow['commitType'][]) => {
    setDraftQuery((prev) => ({
      ...prev,
      commitTypes: value,
    }))
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
    setHasQueried(true)
    const trimmedSearch = draftQuery.searchTerm.trim()
    const hasGlobalSearch = trimmedSearch.length > 0
    const hasStatusSelection = draftQuery.statuses.length > 0

    // New validation: require either a global search OR a status selection.
    // Division and Domain can coexist with either; they are optional.
    if (!hasGlobalSearch && !hasStatusSelection) {
      setValidationError('Enter a global search or select at least one Status.')
      return
    }

    // If global search is present, enforce exact match when exact set provided.
    if (hasGlobalSearch && exactSearchSet && !exactSearchSet.has(trimmedSearch.toLowerCase())) {
      setValidationError('Global search must exactly match a Task ID, Work ID, or Resource ID.')
      return
    }

    const nextQuery = hasGlobalSearch && trimmedSearch !== draftQuery.searchTerm
      ? { ...draftQuery, searchTerm: trimmedSearch }
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
    <Box
      sx={{
        borderRadius: 0,
        bgcolor: 'transparent',
        p: 0,
        boxShadow: 'none',
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 0,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease-in-out',
              },
            }}
          >
            {TASK_FILTER_TABS.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} disableRipple />
            ))}
          </Tabs>
          <TextField
            size="small"
            placeholder="Global search..."
            value={draftQuery.searchTerm}
            onChange={handleSearchChange}
            sx={{
              flex: 1,
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
            InputProps={{
              startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
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
                md: '3.5fr 2fr 2.8fr 2fr 1.2fr',
                lg: '3.5fr 2fr 2.8fr 2fr 1.2fr',
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
            <TextField
              label="Score"
              size="small"
              value={draftQuery.impactValue ?? ''}
              onChange={handleImpactValueChange}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 3 }}
              placeholder="999"
              sx={{
                gridColumn: {
                  xs: 'span 1',
                  sm: 'span 1',
                  md: 'span 1',
                  lg: 'span 1',
                },
                width: { md: '160px', lg: '160px', xs: '100%' },
                minWidth: 0,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignItems: 'center' }}>
                    <Tooltip title={draftQuery.impactOperator === 'gt' ? 'Greater than' : draftQuery.impactOperator === 'lt' ? 'Less than' : 'Equal'}>
                      <IconButton
                        size="small"
                        sx={{ mt: 0.5 }}
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
                ),
              }}
            />
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
            <BulkSelectableMultiSelect
              label="Commit types"
              options={commitTypeSelectOptions}
              value={draftQuery.commitTypes}
              onChange={handleCommitTypesChange}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} light />

        {validationError && (
          <Typography
            variant="body2"
            color="error.main"
            sx={{
              px: 0.5,
              py: 1,
              backgroundColor: 'rgba(229, 57, 53, 0.08)',
              borderRadius: 0,
              pl: 1.5,
            }}
          >
            {validationError}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          sx={{ pt: 1.5, pb: 2 }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            {hasRows && (onCopyHtml || onExportCsv) && (
              <SpeedDial
                ariaLabel="Export actions"
                sx={{ 
                  '& .MuiSpeedDial-fab': { 
                    width: 40, 
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    minHeight: 'auto'
                  },
                  '& .MuiSpeedDialIcon-root': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                }}
                icon={<SpeedDialIcon />}
                onClose={() => setSpeedDialOpen(false)}
                onOpen={() => setSpeedDialOpen(true)}
                open={speedDialOpen}
                direction="right"
              >
                {exportActions.map((action) => (
                  <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={() => {
                      action.action?.()
                      setSpeedDialOpen(false)
                    }}
                  />
                ))}
              </SpeedDial>
            )}
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
            {showClearAction && (
              <Button
                variant="text"
                color="inherit"
                onClick={handleReset}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Clear
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={!isDirty && !hasQueried}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Search
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}

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

  // Remove setState from effect: update draftRange only on user interaction, not in effect

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
              <IconButton 
                size="small" 
                onClick={handleOpen} 
                aria-label="Edit date window"
                sx={{
                  width: { xs: 40, sm: 32 }, // Larger touch target on mobile
                  height: { xs: 40, sm: 32 },
                }}
              >
                <CalendarMonthRoundedIcon 
                  fontSize="small"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1rem' }, // Larger icon on mobile
                  }}
                />
              </IconButton>
            </InputAdornment>
          }
          sx={{
            '& .MuiOutlinedInput-input': {
              fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive input text
              py: { xs: 1.5, sm: 1 }, // More padding on mobile for touch
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
        />

        <Modal
          open={open}
          onClose={handleClose}
          disablePortal={false}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
          }}
        >
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, // Responsive padding inside modal
            borderRadius: { xs: 1, sm: 2 }, // Smaller border radius on mobile
            maxWidth: { xs: '95vw', sm: '90vw', md: 720 }, // Responsive max width
            width: '100%', // Full width on mobile
            maxHeight: { xs: '90vh', sm: '85vh' }, // Prevent overflow on small screens
            overflow: 'auto', // Allow scrolling if needed
            bgcolor: 'background.paper', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            outline: 'none',
          }}>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={{ xs: 2, sm: 3 }} // Responsive spacing
              alignItems="stretch"
            >
            <Box sx={{ 
              flex: 1,
              minWidth: 0, // Allow shrinking
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive font size
                }}
              >
                Select Dates & Times
              </Typography>
              <Stack spacing={{ xs: 2, sm: 3 }}>
                <ToggleButtonGroup
                  value={activeField}
                  exclusive
                  onChange={(_event, next) => {
                    if (next) setActiveField(next)
                  }}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 1,
                      px: { xs: 1.5, sm: 2 }, // Responsive padding
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive font size
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="start">Start date</ToggleButton>
                  <ToggleButton value="end">End date</ToggleButton>
                </ToggleButtonGroup>
                <Box sx={{ 
                  '& .MuiPickersCalendarHeader-root': {
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                  '& .MuiDayCalendar-root': {
                    width: '100%',
                  },
                  '& .MuiPickersCalendarHeader-label': {
                    fontSize: { xs: '1rem', sm: '1.125rem' }, // Responsive calendar header
                  },
                  '& .MuiPickersDay-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive day buttons
                  },
                }}>
                  <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    value={draftRange[activeField]}
                    onChange={handleDateChange}
                    // Hide the internal OK/CANCEL action bar — we use our own buttons below
                    slots={{ actionBar: () => null }}
                    // Defensive: also set slotProps/slotProps for different MUI X versions
                    slotProps={{ actionBar: { sx: { display: 'none' } } }}
                  />
                </Box>
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 600, 
                      color: 'text.primary',
                      fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive font size
                    }}
                  >
                    Time Range
                  </Typography>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2}
                  >
                    <TextField
                      label="Start time"
                      type="time"
                      value={formatTimeInput(draftRange.start)}
                      onChange={handleTimeChange('start')}
                      onFocus={() => setActiveField('start')}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive label size
                        },
                        '& .MuiOutlinedInput-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive input size
                        },
                      }}
                    />
                    <TextField
                      label="End time"
                      type="time"
                      value={formatTimeInput(draftRange.end)}
                      onChange={handleTimeChange('end')}
                      onFocus={() => setActiveField('end')}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive label size
                        },
                        '& .MuiOutlinedInput-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive input size
                        },
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
            <Box sx={{ 
              minWidth: { xs: '100%', sm: 220 }, // Full width on mobile, fixed on larger screens
              mt: { xs: 2, md: 0 }, // Top margin on mobile when stacked
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive font size
                }}
              >
                Quick Select
              </Typography>
              <Stack spacing={1}>
                {shortcuts.map((shortcut) => (
                  <Button
                    key={shortcut.label}
                    variant="outlined"
                    size="small"
                    onClick={handleShortcut(shortcut.resolveRange)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderRadius: 1,
                      py: { xs: 1, sm: 1.5 }, // Responsive padding
                      px: { xs: 1.5, sm: 2 }, // Responsive padding
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive font size
                      fontWeight: 500,
                      textTransform: 'none',
                      borderColor: 'divider',
                      color: 'text.primary',
                      minHeight: { xs: 44, sm: 36 }, // Touch-friendly height on mobile
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'inherit', 
                          lineHeight: 1.2,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive font size
                        }}
                      >
                        {shortcut.label}
                      </Typography>
                      {shortcut.hint && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.7, 
                            lineHeight: 1.2, 
                            display: 'block', 
                            mt: 0.25,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }, // Responsive font size
                          }}
                        >
                          {shortcut.hint}
                        </Typography>
                      )}
                    </Box>
                  </Button>
                ))}
              </Stack>
            </Box>
          </Stack>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} // Stack buttons vertically on mobile
            justifyContent="flex-end" 
            spacing={2} 
            mt={3} 
            pt={2} 
            borderTop={1} 
            borderColor="divider"
            sx={{
              '& .MuiButton-root': {
                width: { xs: '100%', sm: 'auto' }, // Full width buttons on mobile
                minHeight: { xs: 44, sm: 36 }, // Touch-friendly height
              },
            }}
          >
            <Button 
              color="inherit" 
              onClick={handleClear}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 1,
                px: 3,
              }}
            >
              Clear
            </Button>
            <Button 
              variant="contained" 
              onClick={handleApplySelection}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1,
                px: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              Apply Selection
            </Button>
          </Stack>
          </Box>
        </Modal>
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
    resolveRange: () => buildForwardWindowFrom({ start: new Date(), end: null }, { days: 7, allowSystemFallback: true }),
  },
  {
    label: 'Three months forward',
    hint: 'Quarter ahead',
    resolveRange: () => buildForwardWindowFrom({ start: new Date(), end: null }, { months: 3, allowSystemFallback: true }),
  },
  {
    label: 'One week back',
    hint: 'Previous seven days',
    // Always anchor backward shortcuts to the current system date
    resolveRange: () => buildBackwardWindowFrom({ start: null, end: new Date() }, { days: 7, allowSystemFallback: true }),
  },
  {
    label: 'Three months back',
    hint: 'Previous quarter',
    resolveRange: () => buildBackwardWindowFrom({ start: null, end: new Date() }, { months: 3, allowSystemFallback: true }),
  },
  {
    label: 'Last Twelve months',
    hint: 'Rolling year',
    resolveRange: () => buildBackwardWindowFrom({ start: null, end: new Date() }, { months: 12, allowSystemFallback: true }),
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
  const theme = useTheme();
  const tokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens;
  const [inputValue, setInputValue] = useState('')
  const [actionMode, setActionMode] = useState<'select' | 'clear'>('select')

  // Remove setState from effect: update actionMode only on user interaction, not in effect

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
  // Ensure the bulk-select control is always available when nothing is selected
  const effectiveActionMode = value.length === 0 ? 'select' : actionMode
  const shouldShowSelectAllIcon = effectiveActionMode === 'select' && showBulkSelect && bulkMatchCount > 0 && !isBulkActionDisabled
  const shouldShowClearIcon = effectiveActionMode === 'clear' && value.length > 0

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
      sx={{
        // Add spacing between custom icons and chevron popup indicator
        '& .MuiAutocomplete-endAdornment': {
          gap: '4px',
        },
        '& .MuiAutocomplete-popupIndicator': {
          marginLeft: '4px',
        },
      }}
      renderTags={(tagValue, getTagProps) => {
        if (isAllSelected) {
          return (
            <Chip
              key="all-selected"
              size="small"
              label="All selected"
              variant="outlined"
              title="All selected"
              sx={{
                borderColor: tokens?.state.info || '#5488C7',
                color: tokens?.state.info || '#5488C7',
                backgroundColor: tokens?.background.alt || '#F3F4F7',
                fontWeight: 500,
                '& .MuiChip-deleteIcon': {
                  color: tokens?.state.info || '#5488C7',
                  transition: 'none',
                  '&:hover': {
                    color: tokens?.state.info || '#5488C7',
                    opacity: 0.8,
                  },
                  '&:active': {
                    color: tokens?.state.info || '#5488C7',
                    opacity: 0.6,
                  },
                },
              }}
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
              alignItems: 'center',
            }}
          >
            {visibleTags.map((option, index) => (
              <Chip {...getTagProps({ index })} key={option.value} label={option.label} size="small"
                sx={{
                  borderColor: tokens?.state.info || '#5488C7',
                  color: tokens?.state.info || '#5488C7',
                  backgroundColor: tokens?.background.alt || '#F3F4F7',
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: tokens?.state.info || '#5488C7',
                    transition: 'none',
                    '&:hover': {
                      color: tokens?.state.info || '#5488C7',
                      opacity: 0.8,
                    },
                    '&:active': {
                      color: tokens?.state.info || '#5488C7',
                      opacity: 0.6,
                    },
                  },
                }}
              />
            ))}
            {hiddenCount > 0 && (
              <Chip
                size="small"
                label={`+${hiddenCount} more`}
                variant="outlined"
                sx={{
                  borderColor: tokens?.state.info || '#5488C7',
                  color: tokens?.state.info || '#5488C7',
                  backgroundColor: tokens?.background.alt || '#F3F4F7',
                  fontWeight: 500,
                }}
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
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {shouldShowSelectAllIcon && (
                  <Tooltip title={bulkTooltipLabel} placement="top">
                    <span>
                      <IconButton
                        onClick={handleBulkSelect}
                        disabled={isBulkActionDisabled}
                        aria-label={hasSearchTerm ? 'Select all filtered options' : 'Select all options'}
                        sx={{ padding: '4px' }}
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
                        onClick={handleClearSelection}
                        aria-label="Clear selection"
                        disabled={!value.length}
                        sx={{ padding: '4px' }}
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

export default TaskTableQueryConfig

export { BulkSelectableMultiSelect, TaskDateWindowField }
export type { LabeledOption, DateRangeValue }
