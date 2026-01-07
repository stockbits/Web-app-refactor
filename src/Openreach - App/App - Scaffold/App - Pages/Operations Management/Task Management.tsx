import { useCallback, useMemo, useState } from 'react'
import { Alert, Box, Chip, Paper, Snackbar, Stack, Typography, useTheme } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'
import SharedMuiTable from '../../../App - Shared Components/MUI - Table/MUI Table - Table Shell'
import TaskTableQueryConfig from '../../../App - Shared Components/MUI - Table/MUI Table - Task Filter Component'
import type { TaskTableQueryState } from '../../../App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import { buildDefaultTaskTableQuery } from '../../../App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import { TASK_STATUS_LABELS, TASK_TABLE_ROWS, type TaskSkillCode, type TaskTableRow } from '../../../App - Data Tables/Task - Table'

const TaskManagementPage = () => {
  const theme = useTheme()
  const tokens = theme.palette.mode === 'dark' ? theme.openreach.darkTokens : theme.openreach.lightTokens
  
  const statusMetadata: Record<TaskTableRow['status'], { color: string; bg: string; label: string }> = useMemo(
    () => ({
      ACT: { label: TASK_STATUS_LABELS.ACT, ...tokens.taskStatus.ACT },
      AWI: { label: TASK_STATUS_LABELS.AWI, ...tokens.taskStatus.AWI },
      ISS: { label: TASK_STATUS_LABELS.ISS, ...tokens.taskStatus.ISS },
      EXC: { label: TASK_STATUS_LABELS.EXC, ...tokens.taskStatus.EXC },
      COM: { label: TASK_STATUS_LABELS.COM, ...tokens.taskStatus.COM },
    }),
    [tokens.taskStatus],
  )

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  )

  const commitDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [],
  )

  const commitTypeLabels: Record<TaskTableRow['commitType'], string> = useMemo(
    () => ({
      APPOINTMENT: 'Appointment',
      'START BY': 'Start by',
      'COMPLETE BY': 'Complete by',
      TAIL: 'Tail',
    }),
    [],
  )

  const linkedTaskLabels: Record<TaskTableRow['linkedTask'], string> = useMemo(
    () => ({
      Y: 'Yes',
      N: 'No',
    }),
    [],
  )

  const columns: GridColDef<TaskTableRow>[] = useMemo(
    () => [
      {
        field: 'taskId',
        headerName: 'Task ID',
        flex: 0.9,
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
        field: 'workId',
        headerName: 'Work ID',
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <Typography variant="body2" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>
            {params.row.workId}
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
        minWidth: 160,
        renderCell: (params) => (
          <Chip
            label={params.row.division}
            size="small"
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              borderColor: tokens.success.main,
              color: tokens.success.main,
            }}
          />
        ),
      },
      {
        field: 'domainId',
        headerName: 'Domain',
        flex: 1,
        minWidth: 140,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.domainId}
          </Typography>
        ),
      },
      {
        field: 'responseCode',
        headerName: 'Response code',
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.responseCode}
          </Typography>
        ),
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
                <Chip 
                  key={capability} 
                  label={capability} 
                  size="small" 
                  variant="outlined"
                  sx={{
                    borderColor: tokens.success.main,
                    color: tokens.success.main,
                  }}
                />
              ))
            )}
          </Stack>
        ),
      },
      {
        field: 'impactScore',
        headerName: 'Impact score',
        flex: 0.8,
        minWidth: 130,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} color="primary.main" noWrap>
            {params.row.impactScore}
          </Typography>
        ),
      },
      {
        field: 'commitType',
        headerName: 'Commit type',
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            {commitTypeLabels[params.row.commitType] ?? params.row.commitType}
          </Typography>
        ),
      },
      {
        field: 'commitDate',
        headerName: 'Commit date',
        flex: 1.1,
        minWidth: 200,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            {commitDateFormatter.format(new Date(params.row.commitDate))}
          </Typography>
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Last update (alt)',
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {dateFormatter.format(new Date(params.row.updatedAt))}
          </Typography>
        ),
      },
      {
        field: 'linkedTask',
        headerName: 'Linked task',
        flex: 1,
        minWidth: 140,
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            {linkedTaskLabels[params.row.linkedTask] ?? params.row.linkedTask}
          </Typography>
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
    ],
    [statusMetadata, dateFormatter, commitDateFormatter, commitTypeLabels, linkedTaskLabels, tokens.success.main],
  )

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
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const filteredRows = useMemo(
    () => (hasAppliedQuery ? applyTaskFilters(TASK_TABLE_ROWS, activeQuery) : []),
    [hasAppliedQuery, activeQuery],
  )

  const showMessage = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const getCellText = useCallback((row: TaskTableRow, field: string) => {
    const value = (row as unknown as Record<string, unknown>)[field]
    if (value == null) return ''
    if (Array.isArray(value)) return value.join('; ')
    return value.toString()
  }, [])

  const buildCsv = useCallback(() => {
    const headers = columns.map((col) => col.headerName ?? col.field)
    const rows = filteredRows.map((row) =>
      columns
        .map((col) => {
          const text = getCellText(row, col.field)
          const escaped = text.replace(/"/g, '""')
          return text.includes(',') || text.includes('"') ? `"${escaped}"` : escaped
        })
        .join(','),
    )
    return [headers.join(','), ...rows].join('\n')
  }, [columns, filteredRows, getCellText])

  const handleExportCsv = useCallback(() => {
    if (!filteredRows.length) {
      showMessage('No rows to export', 'error')
      return
    }
    const csvContent = buildCsv()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'tasks.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showMessage('Exported CSV for current table')
  }, [buildCsv, filteredRows.length, showMessage])

  const buildHtmlTable = useCallback(() => {
    const headerRow = columns
      .map((col) => `<th style="text-align:left; padding:6px 8px;">${col.headerName ?? col.field}</th>`)
      .join('')
    const bodyRows = filteredRows
      .map((row) => {
        const cells = columns
          .map((col) => {
            const text = getCellText(row, col.field)
            if (!text) return '<td style="padding:6px 8px;"></td>'
            const escaped = text
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
            return `<td style="padding:6px 8px;">${escaped}</td>`
          })
          .join('')
        return `<tr>${cells}</tr>`
      })
      .join('')

    return `<table style="border-collapse:collapse; width:100%;">` +
      `<thead><tr>${headerRow}</tr></thead>` +
      `<tbody>${bodyRows}</tbody></table>`
  }, [columns, filteredRows, getCellText])

  const handleCopyHtml = useCallback(async () => {
    if (!filteredRows.length) {
      showMessage('No rows to copy', 'error')
      return
    }
    try {
      const html = buildHtmlTable()
      await navigator.clipboard.writeText(html)
      showMessage('Copied full table (HTML) to clipboard')
    } catch {
      showMessage('Copy failed. Please allow clipboard access.', 'error')
    }
  }, [buildHtmlTable, filteredRows.length, showMessage])

  const handleApplyQuery = (nextQuery: TaskTableQueryState) => {
    setActiveQuery(nextQuery)
    setHasAppliedQuery(true)
  }

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100dvh - 64px)',
        maxHeight: 'calc(100dvh - 64px)',
        minHeight: 0,
        overflow: 'hidden',
        width: '100%',
        gap: 1.5,
        p: { xs: 2, md: 3 },
        pb: { xs: 3.5, md: 4.5 },
        boxShadow: theme.shadows[10],
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <TaskTableQueryConfig
        initialQuery={activeQuery}
        defaultQuery={defaultQuery}
        divisionOptions={divisionOptions}
        domainOptions={domainOptions}
        capabilityOptions={capabilityOptions}
        responseCodeOptions={responseCodeOptions}
        exactSearchValues={exactSearchValues}
        onApply={handleApplyQuery}
        hasRows={filteredRows.length > 0}
        onCopyHtml={handleCopyHtml}
        onExportCsv={handleExportCsv}
      />

      <Box sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {hasAppliedQuery ? (
          <SharedMuiTable<TaskTableRow>
            columns={columns}
            rows={filteredRows}
            getRowId={(row) => row.taskId}
            density="compact"
            enableQuickFilter
            showFooterControls
            initialPageSize={16}
            pageSizeOptions={[16, 32, 64]}
            maxHeight="100%"
          />
        ) : (
          <Box
            sx={{
              borderRadius: 2,
              border: `2px dashed ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.02)'
                : 'rgba(0, 0, 0, 0.02)',
              p: 4,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              Run a query to load tasks
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: '400px',
              }}
            >
              Use the filters above to define your search, then hit Search to fetch matching rows.
            </Typography>
          </Box>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
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



