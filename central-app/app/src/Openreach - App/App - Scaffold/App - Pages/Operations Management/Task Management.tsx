import { Box, Chip, Stack, Typography } from '@mui/material'
import SharedMuiTable, { type SharedMuiTableColumn } from '../../../App - Shared Components/Share MUI - Table'
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
  const columns: SharedMuiTableColumn<TaskTableRow>[] = [
    {
      header: 'Task ID',
      field: 'id',
      render: (row) => (
        <Typography variant="body2" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} color="text.primary">
          {row.id}
        </Typography>
      ),
    },
    {
      header: 'Task',
      field: 'name',
      render: (row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={600}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Owner: {row.owner}
          </Typography>
        </Stack>
      ),
    },
    {
      header: 'Priority',
      field: 'priority',
      align: 'center',
      render: (row) => (
        <Chip
          label={row.priority}
          size="small"
          sx={{
            bgcolor: priorityStyles[row.priority].bg,
            color: priorityStyles[row.priority].color,
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      header: 'Status',
      field: 'status',
      render: (row) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            bgcolor: statusPalette[row.status].bg,
            color: statusPalette[row.status].color,
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      header: 'Last update',
      field: 'updatedAt',
      align: 'right',
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {dateFormatter.format(new Date(row.updatedAt))}
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

      <SharedMuiTable
        title="Operational tasks"
        caption="Prioritised by escalation policies and SLA clocks"
        columns={columns}
        rows={TASK_TABLE_ROWS}
        getRowId={(row) => row.id}
        dense
      />
    </Stack>
  )
}

export default TaskManagementPage
