import { useMemo, useState } from 'react'
import { Box, Chip, Stack, TextField, Typography, useTheme } from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import type { GridColDef } from '@mui/x-data-grid'
import SharedMuiTable from '../../../App - Shared Components/MUI - Table/MUI Table - Table Shell'
import TaskTableQueryConfig from '../../../App - Shared Components/MUI - Table/MUI Table - Task Filter Component'
import type { TaskTableQueryState } from '../../../App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import { buildDefaultTaskTableQuery } from '../../../App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import { TASK_STATUS_LABELS, TASK_TABLE_ROWS, type TaskSkillCode, type TaskTableRow } from '../../../App - Data Tables/Task - Table'

const TaskManagementPage = () => {
  const theme = useTheme()
  const tokens = theme.palette.mode === 'dark' ? theme.openreach.darkTokens : theme.openreach.lightTokens
  const [globalSearch, setGlobalSearch] = useState('')
  
  const statusMetadata: Record<TaskTableRow['status'], { color: string; bg: string; label: string }> = {
    ACT: { label: TASK_STATUS_LABELS.ACT, ...tokens.taskStatus.ACT },
    AWI: { label: TASK_STATUS_LABELS.AWI, ...tokens.taskStatus.AWI },
    ISS: { label: TASK_STATUS_LABELS.ISS, ...tokens.taskStatus.ISS },
    EXC: { label: TASK_STATUS_LABELS.EXC, ...tokens.taskStatus.EXC },
    COM: { label: TASK_STATUS_LABELS.COM, ...tokens.taskStatus.COM },
  }

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const commitDateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const commitTypeLabels: Record<TaskTableRow['commitType'], string> = {
    APPOINTMENT: 'Appointment',
    'START BY': 'Start by',
    'COMPLETE BY': 'Complete by',
    TAIL: 'Tail',
  }

  const linkedTaskLabels: Record<TaskTableRow['linkedTask'], string> = {
    Y: 'Yes',
    N: 'No',
  }

  const columns: GridColDef<TaskTableRow>[] = [
    {
      field: 'taskId',
      headerName: 'Task ID',
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>
          {params.row.taskId}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Task status',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => {
        const meta = statusMetadata[params.row.status]
        return (
          <Chip
            label={`${meta.label} (${params.row.status})`}
            size="small"
            sx={{
              bgcolor: meta.bg,
              color: meta.color,
              fontWeight: 600,
            }}
          />
        )
      },
    },
    {
      field: 'primarySkill',
      headerName: 'Primary skill',
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} noWrap>
          {params.row.primarySkill}
        </Typography>
      ),
    },
    {
      field: 'capabilities',
      headerName: 'Capabilities',
      flex: 1.1,
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" gap={0.5} flexWrap="wrap">
          {params.row.capabilities.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          ) : (
            params.row.capabilities.map((capability) => (
              <Chip key={capability} label={capability} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
            ))
          )}
        </Stack>
      ),
    },
    {
      field: 'responseCode',
      headerName: 'Response code',
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} noWrap>
          {params.row.responseCode}
        </Typography>
      ),
    },
    {
      field: 'linkedTask',
      headerName: 'Linked task',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={linkedTaskLabels[params.row.linkedTask]}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'commitType',
      headerName: 'Commit type',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} noWrap>
          {commitTypeLabels[params.row.commitType]}
        </Typography>
      ),
    },
    {
      field: 'commitDate',
      headerName: 'Commit date',
      flex: 0.9,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {commitDateFormatter.format(new Date(params.row.commitDate))}
        </Typography>
      ),
    },
    {
      field: 'workId',
      headerName: 'Work ID',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>
          {params.row.workId}
        </Typography>
      ),
    },
    {
      field: 'domainId',
      headerName: 'Domain',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} noWrap>
          {params.row.domainId}
        </Typography>
      ),
    },
    {
      field: 'impactScore',
      headerName: 'Impact score',
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} noWrap>
          {params.row.impactScore}
        </Typography>
      ),
    },
    {
      field: 'resourceId',
      headerName: 'Resource ID',
      flex: 0.9,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>
          {params.row.resourceId}
        </Typography>
      ),
    },
    {
      field: 'resourceName',
      headerName: 'Resource name',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="body2" color={params.row.resourceName ? 'text.primary' : 'text.secondary'} noWrap>
          {params.row.resourceName || '—'}
        </Typography>
      ),
    },
    {
      field: 'division',
      headerName: 'Division',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Chip
          label={params.row.division}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'postCode',
      headerName: 'Post code',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} noWrap>
          {params.row.postCode}
        </Typography>
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Last update',
      flex: 0.9,
      minWidth: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {dateFormatter.format(new Date(params.row.updatedAt))}
          </Typography>
        </Box>
      ),
    },
  ]

  const divisionOptions = useMemo(() => Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.division))).sort(), [])

  const domainOptions = useMemo(() => Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.domainId))).sort((a, b) => a.localeCompare(b)), [])

  const capabilityOptions = useMemo<TaskSkillCode[]>(() => {
    const codes = new Set<TaskSkillCode>()
    TASK_TABLE_ROWS.forEach((row) => {
      codes.add(row.primarySkill)
      row.capabilities.forEach((capability) => codes.add(capability))
    })
    return Array.from(codes).sort((a, b) => a.localeCompare(b))
  }, [])

  const responseCodeOptions = useMemo(
    () => Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.responseCode))).sort((a, b) => a.localeCompare(b)),
    [],
  )

  const exactSearchValues = useMemo(() => {
    const tokens = new Set<string>()
    TASK_TABLE_ROWS.forEach((row) => {
      const candidates = [
        row.taskId,
        row.workId,
        row.resourceId,
        row.resourceName,
        row.domainId,
        row.division,
      ]
      candidates.forEach((value) => {
        if (value == null) {
          return
        }
        tokens.add(value.toString().toLowerCase())
      })
    })
    return Array.from(tokens)
  }, [])

  const defaultQuery = useMemo(() => buildDefaultTaskTableQuery(), [])
  const [activeQuery, setActiveQuery] = useState<TaskTableQueryState>(defaultQuery)
  const [hasAppliedQuery, setHasAppliedQuery] = useState(false)

  const filteredRows = useMemo(() => {
    if (!hasAppliedQuery) return []
    
    let rows = applyTaskFilters(TASK_TABLE_ROWS, activeQuery)
    
    // Apply global search filter
    if (globalSearch.trim()) {
      const searchTerm = globalSearch.trim().toLowerCase()
      rows = rows.filter((row) => {
        return [
          row.taskId,
          row.workId,
          row.resourceId,
          row.resourceName,
          row.domainId,
          row.division,
          row.primarySkill,
          row.status,
          ...row.capabilities,
        ].some((value) => {
          if (value == null) return false
          return value.toString().toLowerCase().includes(searchTerm)
        })
      })
    }
    
    return rows
  }, [hasAppliedQuery, activeQuery, globalSearch])

  const handleApplyQuery = (nextQuery: TaskTableQueryState) => {
    setActiveQuery(nextQuery)
    setHasAppliedQuery(true)
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
      width: '100%',
    }}>
      {/* Global Search Bar */}
      <Box 
        sx={{ 
          flexShrink: 0, 
          p: 2, 
          pb: 1,
          bgcolor: 'background.default',
        }}
      >
        <TextField
          size="small"
          sx={{ flex: 1, maxWidth: 400 }}
          placeholder="Global search..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.primary', fontSize: 20 }} />,
          }}
        />
      </Box>

      <Box sx={{ flexShrink: 0, px: 2, pb: 2 }}>
        <TaskTableQueryConfig
          initialQuery={activeQuery}
          defaultQuery={defaultQuery}
          divisionOptions={divisionOptions}
          domainOptions={domainOptions}
          capabilityOptions={capabilityOptions}
          responseCodeOptions={responseCodeOptions}
          exactSearchValues={exactSearchValues}
          onApply={handleApplyQuery}
        />
      </Box>
      <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {hasAppliedQuery ? (
          <SharedMuiTable<TaskTableRow>
            columns={columns}
            rows={filteredRows}
            getRowId={(row) => row.taskId}
            density="compact"
            enableQuickFilter
            showFooterControls
            initialPageSize={20}
            pageSizeOptions={[20, 30, 50, 100]}
            maxHeight="800px"
          />
        ) : (
          <Box
            sx={{
              borderRadius: 2,
              border: '1px dashed rgba(7,59,76,0.3)',
              bgcolor: 'rgba(7,59,76,0.02)',
              p: 4,
              textAlign: 'center',
              height: 'auto',
              maxHeight: '800px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Run a query to load tasks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the filters above to define your search, then hit Search to fetch matching rows.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default TaskManagementPage

const applyTaskFilters = (rows: TaskTableRow[], query: TaskTableQueryState): TaskTableRow[] => {
  const fromDate = query.updatedFrom ? new Date(query.updatedFrom) : null
  const toDate = query.updatedTo ? new Date(query.updatedTo) : null
  const keyword = query.searchTerm.trim().toLowerCase()

  return rows.filter((row) => {
    if (keyword) {
      const hasExactMatch = [
        row.taskId,
        row.workId,
        row.resourceId,
        row.resourceName,
        row.domainId,
        row.division,
      ].some((value) => {
        if (value == null) {
          return false
        }
        return value.toString().toLowerCase() === keyword
      })
      if (!hasExactMatch) {
        return false
      }
    }

    if (query.divisions.length && !query.divisions.includes(row.division)) {
      return false
    }

    if (query.domains.length && !query.domains.includes(row.domainId)) {
      return false
    }

    if (query.statuses.length && !query.statuses.includes(row.status)) {
      return false
    }

    if (query.capabilities.length) {
      const capabilityPool = new Set<TaskSkillCode>([row.primarySkill, ...row.capabilities])
      const hasMatch = query.capabilities.some((capability: TaskSkillCode) => capabilityPool.has(capability))
      if (!hasMatch) {
        return false
      }
    }

    if (query.responseCodes.length && !query.responseCodes.includes(row.responseCode)) {
      return false
    }

    if (query.impactValue != null && query.impactOperator) {
      const val = query.impactValue
      if (query.impactOperator === 'gt' && !(row.impactScore > val)) {
        return false
      }
      if (query.impactOperator === 'lt' && !(row.impactScore < val)) {
        return false
      }
      if (query.impactOperator === 'eq' && !(row.impactScore === val)) {
        return false
      }
    }

    const updatedAt = new Date(row.updatedAt)
    if (fromDate && updatedAt < fromDate) {
      return false
    }

    if (toDate && updatedAt > toDate) {
      return false
    }

    return true
  })
}



