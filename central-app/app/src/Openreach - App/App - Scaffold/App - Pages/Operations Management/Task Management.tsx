import { Box, Chip, Stack, Typography } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import SharedMuiTable from '../../../App - Shared Components/Share MUI - Table'
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
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} color="text.primary">
          {params.row.id}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Task',
      flex: 1.6,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => (
        <Stack spacing={0.25} overflow="hidden">
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Owner: {params.row.owner}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      align: 'center',
      headerAlign: 'center',
      flex: 0.7,
      minWidth: 120,
      sortable: false,
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
      sortable: false,
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
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {dateFormatter.format(new Date(params.row.updatedAt))}
        </Typography>
      ),
    },
  ]

  return (
    <Stack gap={2}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Task management live queue
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Data refreshes every 30 seconds from Command Centre feeds.
        </Typography>
      </Box>

      <SharedMuiTable<TaskTableRow>
        title="Operational tasks"
        caption="Prioritised by escalation policies and SLA clocks"
        columns={columns}
        rows={TASK_TABLE_ROWS}
        getRowId={(row) => row.id}
        density="compact"
        enableQuickFilter
      />
    </Stack>
  )
}

export default TaskManagementPage
