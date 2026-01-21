import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material'
import { TASK_TABLE_ROWS, TASK_STATUS_LABELS } from '../../../App - Data Tables/Task - Table'
import type { TaskSkillCode, TaskStatusCode, TaskResponseCode, TaskCommitType } from '../../../App - Data Tables/Task - Table'
import { BulkSelectableMultiSelect, TaskDateWindowField } from '../../../App - Shared Components/MUI - Table/MUI Table - Task Filter Component'

interface AppSearchToolProps {
  open: boolean
  onClose: () => void
  onSearch?: (filters: SearchFilters) => void
  currentSearchTerm?: string
  clearTrigger?: number
}

export interface SearchFilters {
  statuses?: TaskStatusCode[]
  capabilities?: TaskSkillCode[]
  responseCodes?: TaskResponseCode[]
  commitTypes?: TaskCommitType[]
  updatedFrom?: string | null
  updatedTo?: string | null
  impactOperator?: 'gt' | 'lt' | 'eq' | null
  impactValue?: number | null
}

const AppSearchTool: React.FC<AppSearchToolProps> = ({ open, onClose, onSearch, currentSearchTerm = '', clearTrigger = 0 }) => {
  const theme = useTheme()
  const tokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatusCode[]>([])
  const [selectedCapabilities, setSelectedCapabilities] = useState<TaskSkillCode[]>([])
  const [selectedResponseCodes, setSelectedResponseCodes] = useState<TaskResponseCode[]>([])
  const [selectedCommitTypes, setSelectedCommitTypes] = useState<TaskCommitType[]>([])
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })
  const [impactOperator, setImpactOperator] = useState<'gt' | 'lt' | 'eq' | null>(null)
  const [impactValue, setImpactValue] = useState<number | null>(null)

  // Reset all filters when clearTrigger changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (clearTrigger > 0) {
      setSelectedStatuses([])
      setSelectedCapabilities([])
      setSelectedResponseCodes([])
      setSelectedCommitTypes([])
      setDateRange({ start: null, end: null })
      setImpactOperator(null)
      setImpactValue(null)
    }
  }, [clearTrigger])

  // Extract unique options from DB data
  const statusOptions = React.useMemo(() =>
    Object.entries(TASK_STATUS_LABELS).map(([code, label]) => ({
      value: code as TaskStatusCode,
      label: label
    })),
  [])

  const capabilityOptions = React.useMemo(() => {
    const codes = new Set<TaskSkillCode>()
    TASK_TABLE_ROWS.forEach(row => {
      codes.add(row.primarySkill)
      row.capabilities.forEach(cap => codes.add(cap))
    })
    return Array.from(codes).sort().map(code => ({
      value: code,
      label: code
    }))
  }, [])

  const responseCodeOptions = React.useMemo(() =>
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.responseCode))).sort().map(code => ({
      value: code,
      label: code
    })),
  [])

  const commitTypeOptions = React.useMemo(() =>
    Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.commitType))).sort().map(type => ({
      value: type,
      label: type
    })),
  [])

  // Check if any filters have been modified from their default state
  const hasActiveFilters = React.useMemo(() => {
    return selectedStatuses.length > 0 ||
           selectedCapabilities.length > 0 ||
           selectedResponseCodes.length > 0 ||
           selectedCommitTypes.length > 0 ||
           dateRange.start !== null ||
           dateRange.end !== null ||
           impactOperator !== null ||
           impactValue !== null
  }, [selectedStatuses, selectedCapabilities, selectedResponseCodes, selectedCommitTypes, dateRange, impactOperator, impactValue])

  const handleSearch = () => {
    const filters: SearchFilters = {
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      capabilities: selectedCapabilities.length > 0 ? selectedCapabilities : undefined,
      responseCodes: selectedResponseCodes.length > 0 ? selectedResponseCodes : undefined,
      commitTypes: selectedCommitTypes.length > 0 ? selectedCommitTypes : undefined,
      updatedFrom: dateRange.start ? dateRange.start.toISOString().split('T')[0] : null,
      updatedTo: dateRange.end ? dateRange.end.toISOString().split('T')[0] : null,
      impactOperator: impactOperator,
      impactValue: impactValue,
    }
    onSearch?.(filters)
    onClose()
  }

  const handleClear = () => {
    setSelectedStatuses([])
    setSelectedCapabilities([])
    setSelectedResponseCodes([])
    setSelectedCommitTypes([])
    setDateRange({ start: null, end: null })
    setImpactOperator(null)
    setImpactValue(null)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      disableEnforceFocus
      disableAutoFocus
      PaperProps={{
        sx: {
          minHeight: 500,
          maxHeight: { xs: '90vh', sm: '80vh' },
          m: { xs: 1, sm: 2 },
        }
      }}
    >
        <DialogTitle>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            justifyContent: { xs: 'flex-start', sm: 'space-between' }, 
            width: '100%',
            gap: { xs: 2, sm: 0 }
          }}>
            <Typography variant="h6" component="div" sx={{ flexShrink: 0 }}>
              Advanced Search Tool
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'flex-end', sm: 'flex-start' }
            }}>
              <TextField
                label="Score"
                value={impactValue ?? ''}
                onChange={(e) => setImpactValue(e.target.value ? Number(e.target.value) : null)}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 3 }}
                placeholder="999"
                sx={{
                  width: { xs: '100%', sm: '160px' },
                  minWidth: 0,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignItems: 'center' }}>
                      <Tooltip title={impactOperator === 'gt' ? 'Greater than' : impactOperator === 'lt' ? 'Less than' : 'Equal'}>
                        <IconButton
                          sx={{ mt: 0.5 }}
                          onClick={() => {
                            const order: Array<'gt' | 'lt' | 'eq'> = ['gt', 'lt', 'eq']
                            const current = impactOperator ?? 'gt'
                            const next = order[(order.indexOf(current) + 1) % order.length]
                            setImpactOperator(next)
                          }}
                          aria-label="Toggle impact operator"
                          tabIndex={-1}
                        >
                          {impactOperator === 'gt' ? '>' : impactOperator === 'lt' ? '<' : '='}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {currentSearchTerm && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Global Search:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium', bgcolor: 'action.hover', p: 1, borderRadius: 'inherit' }}>
                  "{currentSearchTerm}"
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                },
                px: { xs: 1, sm: 0 },
              }}
            >
              <Box>
                <BulkSelectableMultiSelect
                  label="Task Status"
                  options={statusOptions}
                  value={selectedStatuses}
                  onChange={setSelectedStatuses}
                />
              </Box>

              <Box>
                <BulkSelectableMultiSelect
                  label="Capabilities/Skills"
                  options={capabilityOptions}
                  value={selectedCapabilities}
                  onChange={setSelectedCapabilities}
                />
              </Box>

              <Box>
                <BulkSelectableMultiSelect
                  label="Response Codes"
                  options={responseCodeOptions}
                  value={selectedResponseCodes}
                  onChange={setSelectedResponseCodes}
                />
              </Box>

              <Box>
                <BulkSelectableMultiSelect
                  label="Commit Types"
                  options={commitTypeOptions}
                  value={selectedCommitTypes}
                  onChange={setSelectedCommitTypes}
                />
              </Box>

              <Box>
                <TaskDateWindowField
                  value={dateRange}
                  onChange={setDateRange}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 3, sm: 3 }, pb: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 2 } }}>
          {hasActiveFilters && (
            <Button 
              onClick={handleClear} 
              sx={{ 
                color: tokens?.text.primary,
                mr: { xs: 1, sm: 2 }
              }}
            >
              Clear
            </Button>
          )}
          <Button onClick={handleSearch} variant="contained" color="primary" size="large">
            Search
          </Button>
        </DialogActions>
      </Dialog>
  )
}

export default AppSearchTool