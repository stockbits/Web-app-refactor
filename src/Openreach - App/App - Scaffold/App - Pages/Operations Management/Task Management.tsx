import { useMemo, useState } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import SharedMuiTable from '../../../App - Shared Components/MUI - Table/MUI Table - Table Shell'
import TaskTableQueryConfig, { buildDefaultTaskTableQuery } from '../../../App - Shared Components/MUI - Table/MUI Table - Task Filter Component'
import type { TaskTableQueryState } from '../../../App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import { TASK_STATUS_LABELS, TASK_TABLE_ROWS, type TaskSkillCode, type TaskTableRow } from '../../../App - Data Tables/Task - Table'

const statusMetadata: Record<TaskTableRow['status'], { color: string; bg: string; label: string }> = {
  ACT: { label: TASK_STATUS_LABELS.ACT, color: '#006C9E', bg: 'rgba(0,108,158,0.15)' },
  AWI: { label: TASK_STATUS_LABELS.AWI, color: '#6A5B8A', bg: 'rgba(106,91,138,0.18)' },
  ISS: { label: TASK_STATUS_LABELS.ISS, color: '#B34700', bg: 'rgba(179,71,0,0.15)' },
  EXC: { label: TASK_STATUS_LABELS.EXC, color: '#8B2F4E', bg: 'rgba(139,47,78,0.15)' },
  COM: { label: TASK_STATUS_LABELS.COM, color: '#1B5E20', bg: 'rgba(27,94,32,0.12)' },
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

const TaskManagementPage = () => {
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

  const filteredRows = useMemo(
    () => (hasAppliedQuery ? applyTaskFilters(TASK_TABLE_ROWS, activeQuery) : []),
    [hasAppliedQuery, activeQuery],
  )

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
    }}>
      <Box sx={{ flexShrink: 0 }}>
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
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {hasAppliedQuery ? (
          <SharedMuiTable<TaskTableRow>
            columns={columns}
            rows={filteredRows}
            getRowId={(row) => row.taskId}
            density="compact"
            enableQuickFilter
            showFooterControls
            maxHeight="100%" // Responsive height for table area
          />
        ) : (
          <Box
            sx={{
              borderRadius: 2,
              border: '1px dashed rgba(7,59,76,0.3)',
              bgcolor: 'rgba(7,59,76,0.02)',
              p: 4,
              textAlign: 'center',
              height: '100%',
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



