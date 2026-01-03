import { useMemo, useState } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import SharedMuiTable from '../../../App - Shared Components/MUI - Table/MUI Table - Table Shell'
import TaskTableQueryConfig, {
  buildDefaultTaskTableQuery,
  type TaskTableQueryState,
} from '../../../App - Shared Components/MUI - Table/MUI Table - Task Filter Component'
import { TASK_TABLE_ROWS, type TaskTableRow } from '../../../App - Data Base/Task - Table'

const priorityStyles: Record<TaskTableRow['priority'], { color: string; bg: string }> = {
  Critical: { color: '#A4161A', bg: 'rgba(164,22,26,0.1)' },
  High: { color: '#B34700', bg: 'rgba(179,71,0,0.12)' },
  Medium: { color: '#1565C0', bg: 'rgba(21,101,192,0.12)' },
  Low: { color: '#2E7D32', bg: 'rgba(46,125,50,0.12)' },
}

const statusPalette: Record<TaskTableRow['status'], { color: string; bg: string }> = {
  'In Progress': { color: '#006C9E', bg: 'rgba(0,108,158,0.15)' },
  Queued: { color: '#6A5B8A', bg: 'rgba(106,91,138,0.18)' },
  Blocked: { color: '#B71C1C', bg: 'rgba(183,28,28,0.15)' },
  Complete: { color: '#1B5E20', bg: 'rgba(27,94,32,0.12)' },
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const TaskManagementPage = () => {
  const columns: GridColDef<TaskTableRow>[] = [
    {
      field: 'id',
      headerName: 'Task ID',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontFamily="'IBM Plex Mono', monospace"
          fontWeight={600}
          color="text.primary"
          noWrap
        >
          {params.row.id}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Task',
      flex: 1.6,
      minWidth: 220,
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight={600}
          noWrap
          sx={{ display: 'block', width: '100%' }}
          title={`${params.row.name} • Owner: ${params.row.owner}`}
        >
          {params.row.name}
          <Typography component="span" variant="body2" color="text.secondary" fontWeight={500} sx={{ ml: 1 }}>
            • {params.row.owner}
          </Typography>
        </Typography>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      align: 'center',
      headerAlign: 'center',
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.priority}
          size="small"
          sx={{
            bgcolor: priorityStyles[params.row.priority].bg,
            color: priorityStyles[params.row.priority].color,
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          size="small"
          sx={{
            bgcolor: statusPalette[params.row.status].bg,
            color: statusPalette[params.row.status].color,
            fontWeight: 600,
          }}
        />
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

  const ownerOptions = useMemo(
    () => Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.owner))).sort((a, b) => a.localeCompare(b)),
    [],
  )
  const defaultQuery = useMemo(() => buildDefaultTaskTableQuery(), [])
  const [activeQuery, setActiveQuery] = useState<TaskTableQueryState>(defaultQuery)

  const filteredRows = useMemo(() => applyTaskFilters(TASK_TABLE_ROWS, activeQuery), [activeQuery])

  const handleApplyQuery = (nextQuery: TaskTableQueryState) => {
    setActiveQuery(nextQuery)
  }

  return (
    <Stack spacing={3}>
      <TaskTableQueryConfig
        ownerOptions={ownerOptions}
        initialQuery={activeQuery}
        defaultQuery={defaultQuery}
        onApply={handleApplyQuery}
      />
      <SharedMuiTable<TaskTableRow>
        columns={columns}
        rows={filteredRows}
        getRowId={(row) => row.id}
        density="compact"
        enableQuickFilter
        showFooterControls
      />
    </Stack>
  )
}

export default TaskManagementPage

const applyTaskFilters = (rows: TaskTableRow[], query: TaskTableQueryState): TaskTableRow[] => {
  const fromDate = query.updatedFrom ? startOfDay(query.updatedFrom) : null
  const toDate = query.updatedTo ? endOfDay(query.updatedTo) : null
  const keyword = query.searchTerm.trim().toLowerCase()

  return rows.filter((row) => {
    if (keyword) {
      const haystack = `${row.id} ${row.name} ${row.owner}`.toLowerCase()
      if (!haystack.includes(keyword)) {
        return false
      }
    }

    if (query.owners.length && !query.owners.includes(row.owner)) {
      return false
    }

    if (query.priorities.length && !query.priorities.includes(row.priority)) {
      return false
    }

    if (query.statuses.length && !query.statuses.includes(row.status)) {
      return false
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

const startOfDay = (value: string) => {
  const date = new Date(`${value}T00:00:00`)
  return date
}

const endOfDay = (value: string) => {
  const date = new Date(`${value}T23:59:59`)
  date.setMilliseconds(999)
  return date
}
