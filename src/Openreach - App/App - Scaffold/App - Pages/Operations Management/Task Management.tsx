import { useCallback, useMemo, useState } from 'react'
import { Alert, Box, Chip, IconButton, Snackbar, Stack, Typography, useTheme } from '@mui/material'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CalloutCompodent from '../../../App - Shared Components/MUI - Callout MGT/Callout - Compodent'
import { useCalloutMgt } from './useCalloutMgt'
import type { GridColDef, GridCellParams } from '@mui/x-data-grid'
import { useGridApiRef } from '@mui/x-data-grid'
import SharedMuiTable from '../../../App - Shared Components/MUI - Table/MUI Table - Table Shell'
import TaskTableQueryConfig from '../../../App - Shared Components/MUI - Table/MUI Table - Task Filter Component'
import type { TaskTableQueryState } from '../../../App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import { buildDefaultTaskTableQuery } from '../../../App - Shared Components/MUI - Table/TaskTableQueryConfig.shared'
import { TASK_STATUS_LABELS, TASK_TABLE_ROWS, type TaskSkillCode, type TaskTableRow } from '../../../App - Data Tables/Task - Table'
import { TableContextMenu } from '../../../App - Shared Components/MUI - Table'
import { useTaskTableSelection } from '../../../App - Shared Components/Selection - UI'

const TaskManagementPage = ({
  openTaskDialog,
}: {
  openTaskDialog?: (task: TaskTableRow) => void
}) => {
  const { callout, openCallout, closeCallout } = useCalloutMgt();
  const theme = useTheme()
  const tokens = theme.palette.mode === 'dark' ? theme.openreach?.darkTokens : theme.openreach?.lightTokens
  const apiRef = useGridApiRef();

  // Selection UI integration
  const { 
    selectedTaskIds,
    toggleTaskSelection, 
    rangeSelectTasks,
    isLastInteracted,
  } = useTaskTableSelection()

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const showMessage = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  // Right-click context menu
  const contextMenu = TableContextMenu<TaskTableRow>({
    additionalItems: [
      {
        label: 'Open Task Details',
        icon: <OpenInNewIcon fontSize="small" />,
        onClick: () => {
          if (contextMenu.contextMenuState?.rowData) {
            openTaskDialog?.(contextMenu.contextMenuState.rowData)
          }
        },
      },
    ],
  })

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
              {meta.label}
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
                  variant="outlined"
                  sx={{
                    borderColor: theme.palette.mode === 'dark' ? tokens.chip.border : tokens.secondary.main,
                    color: theme.palette.mode === 'dark' ? tokens.chip.text : tokens.secondary.main,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? tokens.chip.bg 
                      : tokens.background.alt,
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? tokens.chip.hover.bg 
                        : tokens.secondary.light,
                      borderColor: theme.palette.mode === 'dark' 
                        ? tokens.chip.border 
                        : tokens.secondary.main,
                    }
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
    [statusMetadata, dateFormatter, commitDateFormatter, commitTypeLabels, commitTypeColors, linkedTaskLabels, tokens.success.main, tokens.state.error, tokens.state.warning, tokens.background.alt, tokens.secondary.light, tokens.secondary.main, tokens.chip.bg, tokens.chip.border, tokens.chip.hover.bg, tokens.chip.text, theme.palette.text, theme.palette.mode, openCallout],
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

  // Row styling for selected tasks
  const getRowClassName = useCallback((params: { id: string | number; row: TaskTableRow }) => {
    const isSelected = selectedTaskIds.includes(params.row.taskId);
    const isLast = isLastInteracted(params.row.taskId);
    
    if (isSelected && isLast) return 'selected-row last-interacted-row';
    if (isSelected) return 'selected-row';
    if (isLast) return 'last-interacted-row';
    return '';
  }, [selectedTaskIds, isLastInteracted]);

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

  // Handle row clicks for selection with Ctrl/Shift support
  const handleRowClick = useCallback((params: GridCellParams<TaskTableRow>, event: React.MouseEvent) => {
    const isCtrlPressed = event.ctrlKey || event.metaKey;
    const isShiftPressed = event.shiftKey;
    
    if (isShiftPressed) {
      // Prevent default text selection when shift-clicking
      event.preventDefault();
      // Shift-click: range select - use DataGrid's actual visible row order
      // This respects sorting and ensures range matches what user sees
      const allVisibleRowIds = apiRef.current?.getAllRowIds() || filteredRows.map(row => row.taskId);
      rangeSelectTasks(params.row.taskId, allVisibleRowIds as string[], 'table');
    } else {
      // Regular or Ctrl-click
      toggleTaskSelection(params.row.taskId, isCtrlPressed, 'table');
    }
  }, [toggleTaskSelection, rangeSelectTasks, filteredRows, apiRef]);

  return (
    <>
      <Stack
        sx={{
          bgcolor: 'background.default',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Toolbar Section */}
        <Box 
          sx={{ 
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            px: { xs: 2, sm: 3 },
            py: 1,
          }}
        >
          <TaskTableQueryConfig
            compact
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

        {/* Table Section */}
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', px: { xs: 2, sm: 3 }, py: 2 }}>
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
              apiRef={apiRef}
              getRowClassName={getRowClassName}
              onCellClick={handleRowClick}
              contextMenuItems={[
                {
                  label: 'Open Task Details',
                  onClick: () => {
                    if (contextMenu.contextMenuState?.rowData) {
                      openTaskDialog?.(contextMenu.contextMenuState.rowData)
                    }
                  },
                },
              ]}
              onCellDoubleClick={(params) => {
                openTaskDialog?.(params.row)
              }}
            />
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stack
                spacing={1.5}
                alignItems="center"
                sx={{
                  maxWidth: '400px',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '1.125rem',
                  }}
                >
                  Run a query to load tasks
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                  }}
                >
                  Use the filters above to define your search, then hit Search to fetch matching rows.
                </Typography>
              </Stack>
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
      </Stack>
      <CalloutCompodent open={callout.open} taskNumber={callout.taskNumber || ''} onClose={closeCallout} />
      {contextMenu.contextMenuComponent}
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



