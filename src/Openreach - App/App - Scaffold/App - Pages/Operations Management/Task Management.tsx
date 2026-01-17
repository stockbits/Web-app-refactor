import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Box, Chip, IconButton, Paper, Snackbar, Stack, Typography, useTheme } from '@mui/material'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import CalloutCompodent from '../../../App - Shared Components/MUI - Callout MGT/Callout - Compodent'
import { useCalloutMgt } from './useCalloutMgt'
import type { GridColDef, GridCellParams } from '@mui/x-data-grid'
import SharedMuiTable from '../../../App - Shared Components/MUI - Table/MUI Table - Table Shell'
import TaskTableQueryConfig from '../../../App - Shared Components/MUI - Table/MUI Table - Task Filter Component'
import type { TaskTableQueryState } from '../../../App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import { buildDefaultTaskTableQuery } from '../../../App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import { TASK_STATUS_LABELS, TASK_TABLE_ROWS, type TaskSkillCode, type TaskTableRow } from '../../../App - Data Tables/Task - Table'

const TaskManagementPage = ({
  openTaskDialog,
}: {
  openTaskDialog?: (task: TaskTableRow) => void
}) => {
  const { callout, openCallout, closeCallout } = useCalloutMgt();
  const theme = useTheme()
  const tokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const showMessage = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  // Touch and hold functionality
  const [touchTimer, setTouchTimer] = useState<number | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const touchTargetRef = useRef<TaskTableRow | null>(null)

  const handleTouchStart = useCallback((params: GridCellParams<TaskTableRow>, event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    touchTargetRef.current = params.row

    // Start timer for long press (500ms)
    const timer = window.setTimeout(() => {
      openTaskDialog?.(params.row)
      setTouchTimer(null)
    }, 500)
    setTouchTimer(timer)
  }, [openTaskDialog])

  const handleTouchEnd = useCallback(() => {
    if (touchTimer) {
      clearTimeout(touchTimer)
      setTouchTimer(null)
    }
    setTouchStartPos(null)
    touchTargetRef.current = null
  }, [touchTimer])

  const handleTouchMove = useCallback((_params: GridCellParams<TaskTableRow>, event: React.TouchEvent) => {
    if (!touchStartPos || !touchTimer) return

    const touch = event.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)

    // Cancel long press if user moves finger more than 10px
    if (deltaX > 10 || deltaY > 10) {
      clearTimeout(touchTimer)
      setTouchTimer(null)
      setTouchStartPos(null)
      touchTargetRef.current = null
    }
  }, [touchStartPos, touchTimer])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (touchTimer) {
        clearTimeout(touchTimer)
      }
    }
  }, [touchTimer])

  const statusMetadata: Record<TaskTableRow['status'], { label: string }> = useMemo(
    () => ({
      ACT: { label: TASK_STATUS_LABELS.ACT },
      AWI: { label: TASK_STATUS_LABELS.AWI },
      ISS: { label: TASK_STATUS_LABELS.ISS },
      EXC: { label: TASK_STATUS_LABELS.EXC },
      COM: { label: TASK_STATUS_LABELS.COM },
    }),
    [],
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

  const commitTypeColors: Record<TaskTableRow['commitType'], string> = useMemo(
    () => ({
      APPOINTMENT: tokens.mapTaskColors.appointment,
      'START BY': tokens.mapTaskColors.startBy,
      'COMPLETE BY': tokens.mapTaskColors.completeBy,
      TAIL: tokens.mapTaskColors.failedSLA,
    }),
    [tokens.mapTaskColors],
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
      // Actions (sticky): quick actions (Call, Task)
      {
        field: 'actions',
        headerName: 'Actions',
        width: 90,
        minWidth: 80,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        disableColumnMenu: true,
        resizable: false,
        cellClassName: 'action-col',
        headerClassName: 'action-col',
        renderCell: (params) => (
          <IconButton
            disableRipple={true}
            onClick={(e) => {
              e.stopPropagation();
              openCallout(params.row.taskId);
            }}
            sx={{ p: 0.5 }}
          >
            <PhoneRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        ),
      },
      // Task ID
      {
        field: 'taskId',
        headerName: 'Task ID',
        flex: 1.1,
        minWidth: 160,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Typography variant="body2" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap>
            {params.row.taskId}
          </Typography>
        ),
      },
      // Work ID
      {
        field: 'workId',
        headerName: 'Work ID',
        flex: 1,
        minWidth: 160,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', '&:hover .copy-button': { opacity: 1 } }}>
            <Typography variant="body2" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {params.row.workId}
            </Typography>
          </Box>
        ),
      },
      // Task Status
      {
        field: 'status',
        headerName: 'Task Status',
        flex: 1.3,
        minWidth: 220,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => {
          const meta = statusMetadata[params.row.status]
          return (
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }} noWrap>
              {`${params.row.status} → ${meta.label}`}
            </Typography>
          )
        },
      },
      // Commit Date
      {
        field: 'commitDate',
        headerName: 'Commit Date',
        flex: 1.1,
        minWidth: 200,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            {commitDateFormatter.format(new Date(params.row.commitDate))}
          </Typography>
        ),
      },
      // Commit Type
      {
        field: 'commitType',
        headerName: 'Commit Type',
        flex: 1,
        minWidth: 150,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} sx={{ color: commitTypeColors[params.row.commitType] }}>
            {commitTypeLabels[params.row.commitType] ?? params.row.commitType}
          </Typography>
        ),
      },
      // Resource ID
      {
        field: 'resourceId',
        headerName: 'Resource ID',
        flex: 0.9,
        minWidth: 140,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', '&:hover .copy-button': { opacity: 1 } }}>
            <Typography variant="body2" fontFamily="'IBM Plex Mono', monospace" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {params.row.resourceId}
            </Typography>
          </Box>
        ),
      },
      // Impact Score
      {
        field: 'impactScore',
        headerName: 'Impact score',
        flex: 0.8,
        minWidth: 130,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => {
          const score = params.row.impactScore
          let color: string
          if (score >= 500) {
            color = tokens.state.error  // Red
          } else if (score >= 300) {
            color = tokens.state.warning  // Amber
          } else {
            color = tokens.success.main  // Green accent
          }
          return (
            <Typography variant="body2" fontWeight={600} color={color} noWrap>
              {params.row.impactScore}
            </Typography>
          )
        },
      },
      // Resource Name
      {
        field: 'resourceName',
        headerName: 'Resource name',
        flex: 1.2,
        minWidth: 160,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Typography variant="body2" color={params.row.resourceName ? 'text.primary' : 'text.secondary'} noWrap>
            {params.row.resourceName || '—'}
          </Typography>
        ),
      },
      // Domain
      {
        field: 'domainId',
        headerName: 'Domain',
        flex: 1,
        minWidth: 140,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.domainId}
          </Typography>
        ),
      },
      // Response Code
      {
        field: 'responseCode',
        headerName: 'Response code',
        flex: 1,
        minWidth: 150,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.responseCode}
          </Typography>
        ),
      },
      // Primary Skill
      {
        field: 'primarySkill',
        headerName: 'Primary skill',
        flex: 0.9,
        minWidth: 140,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.primarySkill}
          </Typography>
        ),
      },
      // Capabilities
      {
        field: 'capabilities',
        headerName: 'Capabilities',
        flex: 1.3,
        minWidth: 220,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Stack direction="row" gap={0.5} flexWrap="wrap" alignItems="center">
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
                    borderColor: tokens.state.info,
                    color: tokens.state.info,
                    backgroundColor: tokens.background.alt,
                    fontWeight: 500,
                  }}
                />
              ))
            )}
          </Stack>
        ),
      },
      // Last update
      {
        field: 'updatedAt',
        headerName: 'Last update (alt)',
        flex: 1,
        minWidth: 180,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {dateFormatter.format(new Date(params.row.updatedAt))}
          </Typography>
        ),
      },
      // Linked Task
      {
        field: 'linkedTask',
        headerName: 'Linked task',
        flex: 1,
        minWidth: 140,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            {linkedTaskLabels[params.row.linkedTask] ?? params.row.linkedTask}
          </Typography>
        ),
      },
      // Post code
      {
        field: 'postCode',
        headerName: 'Post code',
        flex: 0.8,
        minWidth: 130,
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', '&:hover .copy-button': { opacity: 1 } }}
          >
            <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {params.row.postCode}
            </Typography>
          </Box>
        ),
      },
    ],
    [statusMetadata, dateFormatter, commitDateFormatter, commitTypeLabels, commitTypeColors, linkedTaskLabels, tokens.success.main, tokens.state.error, tokens.state.warning, theme.palette.text, openCallout],
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

  const commitTypeOptions = useMemo(
    () => Array.from(new Set(TASK_TABLE_ROWS.map((row) => row.commitType))).sort((a, b) => a.localeCompare(b)),
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

  const handleCopyHtml = useCallback(async () => {
    try {
      const headerRow = columns.map((col) => `<th style="text-align:left; padding:6px 8px;">${col.headerName ?? col.field}</th>`).join('')
      const bodyRows = filteredRows.map((row) => `<tr>${columns.map((col) => `<td style="padding:6px 8px;">${getCellText(row, col.field)}</td>`).join('')}</tr>`).join('')
      const html = `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`
      await navigator.clipboard.writeText(html)
      showMessage('Copied full table (HTML) to clipboard')
    } catch {
      showMessage('Copy failed. Please allow clipboard access.', 'error')
    }
  }, [columns, filteredRows, getCellText, showMessage])

  const handleApplyQuery = (nextQuery: TaskTableQueryState) => {
    setActiveQuery(nextQuery)
    setHasAppliedQuery(true)
  }

  return (
    <>
      <Paper
        sx={{
          boxShadow: 'none',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <TaskTableQueryConfig
            initialQuery={activeQuery}
            defaultQuery={defaultQuery}
            divisionOptions={divisionOptions}
            domainOptions={domainOptions}
            capabilityOptions={capabilityOptions}
            responseCodeOptions={responseCodeOptions}
            commitTypeOptions={commitTypeOptions}
            exactSearchValues={exactSearchValues}
            onApply={handleApplyQuery}
            hasRows={filteredRows.length > 0}
            onCopyHtml={handleCopyHtml}
            onExportCsv={handleExportCsv}
          />
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', px: 3, pt: 1, pb: 3 }}>
          {hasAppliedQuery ? (
            <SharedMuiTable<TaskTableRow>
              columns={columns}
              rows={filteredRows}
              getRowId={(row) => row.taskId}
              density="compact"
              enableQuickFilter
              hideFooter={false}
              enablePagination={true}
              initialPageSize={30}
              pageSizeOptions={[30, 50, 100]}
              onCellDoubleClick={(params) => {
                openTaskDialog?.(params.row)
              }}
              onCellTouchStart={handleTouchStart}
              onCellTouchEnd={handleTouchEnd}
              onCellTouchMove={handleTouchMove}
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
                m: 3,
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
      <CalloutCompodent open={callout.open} taskNumber={callout.taskNumber || ''} onClose={closeCallout} />
    </>
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

    if (query.commitTypes.length && !query.commitTypes.includes(row.commitType)) {
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



